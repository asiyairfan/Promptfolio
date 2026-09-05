import {
  buildParsePrompt,
  buildSectionParsePrompt,
  buildStyleSuggestionPrompt
} from './prompts.js';
import { coerceResume } from '../../shared/resume-schema.js';
import sampleResume from '../../shared/sample-resume.json' with { type: 'json' };

const API_KEY = process.env.GROQ_API_KEY;
const BASE_URL = (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const USES_QWEN3 = MODEL.toLowerCase().startsWith('qwen/qwen3');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const SECTION_IDS = ['profile', 'experience', 'education', 'skills', 'projects'];
const SECTION_HEADINGS = {
  profile: new Set(['profile', 'professional summary', 'summary', 'objective', 'career objective', 'about', 'about me', 'contact', 'contact information', 'personal information']),
  experience: new Set(['experience', 'work experience', 'professional experience', 'employment history', 'work history', 'career history', 'internships', 'internship experience']),
  education: new Set(['education', 'academic background', 'qualifications']),
  skills: new Set(['skills', 'technical skills', 'core skills', 'core competencies', 'competencies', 'technologies', 'technical proficiencies', 'tools']),
  projects: new Set(['projects', 'selected projects', 'personal projects', 'portfolio projects'])
};

let modelCapabilitiesPromise;

export const AI_MODES = {
  MOCK: 'mock',
  LIVE: 'live'
};

export function getAiMode() {
  return API_KEY ? AI_MODES.LIVE : AI_MODES.MOCK;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockParse({ suggestStyle }) {
  await sleep(600);
  const styleSuggestion = suggestStyle
    ? { presetId: 'modern', reason: 'Mock fallback: modern is the safe default.' }
    : undefined;
  return {
    resume: sampleResume,
    score: 100,
    styleSuggestion,
    meta: { mode: AI_MODES.MOCK, model: 'mock', ms: 600 }
  };
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return trimmed;

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();

  const firstBrace = trimmed.indexOf('{');
  if (firstBrace !== -1) return trimmed.slice(firstBrace);
  return trimmed;
}

function numericMetadata(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isInteger(number) && number > 0) return number;
  }
  return null;
}

async function getModelCapabilities() {
  if (!modelCapabilitiesPromise) {
    modelCapabilitiesPromise = (async () => {
      const res = await fetch(`${BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown');
        const error = new Error(`Groq model lookup failed with HTTP ${res.status}: ${errText}`);
        error.status = res.status;
        throw error;
      }

      const payload = await res.json();
      const model = payload.data?.find((entry) => entry.id === MODEL);
      if (!model) throw new Error(`Configured Groq model was not returned by /models: ${MODEL}`);

      const maxOutputTokens = numericMetadata(model.max_completion_tokens, model.max_output_length);
      const contextWindow = numericMetadata(model.context_window, model.context_length);
      if (!maxOutputTokens || !contextWindow) {
        throw new Error(`Groq model metadata for ${MODEL} did not include output and context limits.`);
      }

      const supportedParameters = model.supported_sampling_parameters || [];
      if (!supportedParameters.includes('max_tokens')) {
        throw new Error(`Groq model ${MODEL} does not support the max_tokens parameter reported by its metadata.`);
      }

      const supportedFeatures = model.supported_features || [];
      if (!supportedFeatures.includes('json_mode')) {
        throw new Error(`Groq model ${MODEL} does not support JSON mode reported by its metadata.`);
      }

      return {
        contextWindow,
        maxOutputTokens,
        supportsReasoning: supportedFeatures.includes('reasoning')
      };
    })();

    modelCapabilitiesPromise.catch(() => {
      modelCapabilitiesPromise = undefined;
    });
  }

  return modelCapabilitiesPromise;
}

async function callModel(prompt, attempt, capabilities, useGemini = false) {
  const apiKey = useGemini ? GEMINI_API_KEY : API_KEY;
  const baseUrl = useGemini ? GEMINI_BASE_URL : BASE_URL;
  const model = useGemini ? GEMINI_MODEL : MODEL;

  const body = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a precise resume parser. Always return valid JSON matching the requested shape. Do not include markdown or explanations outside the JSON.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: attempt === 1 ? 0.1 : 0.0,
    max_tokens: capabilities.maxOutputTokens,
    response_format: { type: 'json_object' }
  };

  if (!useGemini && USES_QWEN3 && capabilities.supportsReasoning) {
    body.reasoning_effort = 'none';
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown');
    const error = new Error(`${useGemini ? 'Gemini' : 'Groq'} HTTP ${res.status}: ${errText}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const content = choice?.message?.content;
  if (!content) throw new Error(`Empty completion from ${useGemini ? 'Gemini' : 'Groq'}`);
  return { content, finishReason: choice.finish_reason };
}

async function callGroq(prompt, attempt, capabilities) {
  try {
    return await callModel(prompt, attempt, capabilities, false);
  } catch (err) {
    if (err.status === 429 && GEMINI_API_KEY) {
      console.warn('Groq rate-limited — falling back to Gemini for this request.');
      return callModel(prompt, attempt, capabilities, true);
    }
    throw err;
  }
}

async function requestJson(prompt, capabilities) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const completion = await callGroq(prompt, attempt, capabilities);
      if (completion.finishReason === 'length') {
        const error = new Error(`Groq reached the ${capabilities.maxOutputTokens}-token output limit.`);
        error.code = 'completion_truncated';
        throw error;
      }
      return JSON.parse(extractJson(completion.content));
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

function isPromptWithinContext(prompt, capabilities) {
  return Buffer.byteLength(prompt, 'utf8') + capabilities.maxOutputTokens <= capabilities.contextWindow;
}

function splitTextByBytes(text, maxBytes) {
  if (!text) return [];

  const chunks = [];
  let chunk = '';
  let chunkBytes = 0;

  for (const character of text) {
    const characterBytes = Buffer.byteLength(character, 'utf8');
    if (chunk && chunkBytes + characterBytes > maxBytes) {
      chunks.push(chunk);
      chunk = '';
      chunkBytes = 0;
    }
    chunk += character;
    chunkBytes += characterBytes;
  }

  if (chunk) chunks.push(chunk);
  return chunks;
}

function sectionForHeading(line) {
  const normalized = line
    .trim()
    .replace(/^#+\s*/, '')
    .replace(/:\s*$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();

  for (const [section, headings] of Object.entries(SECTION_HEADINGS)) {
    if (headings.has(normalized)) return section;
  }
  return null;
}

function splitResumeSections(text) {
  const sections = Object.fromEntries(SECTION_IDS.map((section) => [section, []]));
  let currentSection = 'profile';
  let foundHeading = false;

  for (const line of text.split(/\r?\n/)) {
    const nextSection = sectionForHeading(line);
    if (nextSection) {
      currentSection = nextSection;
      foundHeading = true;
      continue;
    }
    sections[currentSection].push(line);
  }

  if (!foundHeading) {
    return Object.fromEntries(SECTION_IDS.map((section) => [section, text]));
  }

  return Object.fromEntries(SECTION_IDS.map((section) => [section, sections[section].join('\n').trim()]));
}

function sectionChunks(section, text, jobDescription, capabilities) {
  const emptyPrompt = buildSectionParsePrompt({ section, text: '', jobDescription });
  const maxTextBytes = capabilities.contextWindow - capabilities.maxOutputTokens - Buffer.byteLength(emptyPrompt, 'utf8');
  if (maxTextBytes < 1) {
    throw new Error('The target job description is too large for the configured Groq model context window.');
  }
  return splitTextByBytes(text, maxTextBytes);
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function scoreFrom(value) {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
}

function styleSuggestionFrom(value) {
  const suggestion = asObject(value);
  const presetId = asString(suggestion.presetId);
  const reason = asString(suggestion.reason);
  return presetId && reason ? { presetId, reason } : undefined;
}

function addScore(scores, value) {
  const score = scoreFrom(value);
  if (score !== null) scores.push(score);
}

function mergeSectionResponses(responses) {
  const resume = {
    name: '',
    title: '',
    summary: '',
    contact: { email: '', phone: '', location: '', website: '' },
    experience: [],
    education: [],
    skills: [],
    projects: []
  };
  const scores = [];

  for (const response of responses.profile) {
    const parsed = asObject(response.resume || response);
    for (const field of ['name', 'title', 'summary']) {
      if (!resume[field]) resume[field] = asString(parsed[field]);
    }
    const contact = asObject(parsed.contact);
    for (const field of ['email', 'phone', 'location', 'website']) {
      if (!resume.contact[field]) resume.contact[field] = asString(contact[field]);
    }
    addScore(scores, response.score ?? parsed.score);
  }

  for (const section of ['experience', 'education', 'skills', 'projects']) {
    for (const response of responses[section]) {
      const parsed = asObject(response.resume || response);
      if (Array.isArray(parsed[section])) resume[section].push(...parsed[section]);
      addScore(scores, response.score ?? parsed.score);
    }
  }

  const score = scores.length
    ? Math.round(scores.reduce((total, value) => total + value, 0) / scores.length)
    : 0;

  return { resume, score };
}

async function parseSectionedResume({ text, jobDescription, capabilities }) {
  const sections = splitResumeSections(text);
  const responses = Object.fromEntries(SECTION_IDS.map((section) => [section, []]));
  const warnings = [];

  for (const section of SECTION_IDS) {
    const chunks = sectionChunks(section, sections[section], jobDescription, capabilities);
    for (const chunk of chunks) {
      try {
        const prompt = buildSectionParsePrompt({ section, text: chunk, jobDescription });
        responses[section].push(await requestJson(prompt, capabilities));
      } catch (err) {
        warnings.push(`Could not parse ${section}: ${parserErrorMessage(err)}`);
      }
    }
  }

  return { ...mergeSectionResponses(responses), warnings };
}

function parserErrorMessage(err) {
  return err.status === 429
    ? 'Groq is temporarily rate-limited. Wait a minute and retry.'
    : err.message;
}

async function requestStyleSuggestion(resume, capabilities) {
  const prompt = buildStyleSuggestionPrompt(resume);
  if (!isPromptWithinContext(prompt, capabilities)) return undefined;
  const parsed = await requestJson(prompt, capabilities);
  return styleSuggestionFrom(parsed.styleSuggestion);
}

export async function parseResume({ text, jobDescription, suggestStyle }) {
  if (!API_KEY) {
    return mockParse({ suggestStyle });
  }

  const started = Date.now();

  try {
    const capabilities = await getModelCapabilities();
    const fullPrompt = buildParsePrompt({ text, jobDescription, suggestStyle });
    const shouldUseSections = !isPromptWithinContext(fullPrompt, capabilities);
    let rawResume;
    let score;
    let styleSuggestion;
    let parserWarnings = [];

    if (shouldUseSections) {
      const sectioned = await parseSectionedResume({ text, jobDescription, capabilities });
      rawResume = sectioned.resume;
      score = sectioned.score;
      parserWarnings = sectioned.warnings;
    } else {
      const parsed = await requestJson(fullPrompt, capabilities);
      rawResume = parsed.resume || parsed;
      score = scoreFrom(parsed.score) ?? 0;
      styleSuggestion = suggestStyle ? styleSuggestionFrom(parsed.styleSuggestion) : undefined;
    }

    const { data: resume, warnings } = coerceResume(rawResume);

    if (shouldUseSections && suggestStyle) {
      try {
        styleSuggestion = await requestStyleSuggestion(resume, capabilities);
      } catch (err) {
        parserWarnings.push(`Could not suggest a style: ${parserErrorMessage(err)}`);
      }
    }

    return {
      resume,
      score,
      styleSuggestion,
      warnings: [...parserWarnings, ...warnings].length ? [...parserWarnings, ...warnings] : undefined,
      meta: {
        mode: AI_MODES.LIVE,
        model: MODEL,
        ms: Date.now() - started,
        maxOutputTokens: capabilities.maxOutputTokens,
        contextWindow: capabilities.contextWindow,
        sectioned: shouldUseSections
      }
    };
  } catch (err) {
    return {
      resume: coerceResume({}).data,
      score: 0,
      warnings: [parserErrorMessage(err)],
      meta: { mode: AI_MODES.LIVE, model: MODEL, ms: Date.now() - started, error: err.message }
    };
  }
}
