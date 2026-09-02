import { buildParsePrompt } from './prompts.js';
import { coerceResume } from '../../shared/resume-schema.js';
import sampleResume from '../../shared/sample-resume.json' with { type: 'json' };

const API_KEY = process.env.GROQ_API_KEY;
const BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

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

async function callGroq(prompt, attempt) {
  const body = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a precise resume parser. Always return valid JSON matching the requested schema. Do not include markdown or explanations outside the JSON.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: attempt === 1 ? 0.1 : 0.0,
    response_format: { type: 'json_object' }
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown');
    throw new Error(`Groq HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty completion from Groq');
  return content;
}

export async function parseResume({ text, jobDescription, suggestStyle }) {
  if (!API_KEY) {
    return mockParse({ suggestStyle });
  }

  const prompt = buildParsePrompt({ text, jobDescription, suggestStyle });
  const started = Date.now();

  let rawContent;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      rawContent = await callGroq(prompt, attempt);
      break;
    } catch (err) {
      if (attempt === 2) {
        return {
          resume: coerceResume({}).data,
          warnings: [err.message],
          meta: { mode: AI_MODES.LIVE, model: MODEL, ms: Date.now() - started, error: err.message }
        };
      }
    }
  }

  let parsed;
  try {
    const jsonText = extractJson(rawContent);
    parsed = JSON.parse(jsonText);
  } catch (err) {
    return {
      resume: coerceResume({}).data,
      warnings: [`AI returned invalid JSON: ${err.message}`],
      meta: { mode: AI_MODES.LIVE, model: MODEL, ms: Date.now() - started, error: err.message }
    };
  }

  const rawResume = parsed.resume || parsed;
  const { data: resume, warnings } = coerceResume(rawResume);

  const styleSuggestion = suggestStyle && parsed.styleSuggestion ? parsed.styleSuggestion : undefined;

  return {
    resume,
    styleSuggestion,
    warnings: warnings.length ? warnings : undefined,
    meta: { mode: AI_MODES.LIVE, model: MODEL, ms: Date.now() - started }
  };
}
