import { schemaAsJson } from '../../shared/resume-schema.js';

const STYLE_PRESET_IDS = ['classic', 'modern', 'bold', 'warm'];

function baseExtractionPrompt(text) {
  return `You are a resume parser. Extract the resume below into the following JSON schema and return ONLY valid JSON (no markdown, no explanation).

Schema:
${schemaAsJson()}

Rules:
- Keep every field as a string.
- For experience and education, preserve dates exactly as written when possible.
- Preserve every meaningful source detail and every listed item. Do not summarize, omit, or invent content.
- If a section is missing, use an empty string or empty array as appropriate.
- Contact may include email, phone, location, and website. Extract any website/portfolio/LinkedIn/Github URL and put it in website.

Resume text:
---
${text}
---
`;
}

function tailoringBlock(jobDescription) {
  if (!jobDescription || !jobDescription.trim()) return '';
  return `\nTarget job description:\n---\n${jobDescription.trim()}\n---\nTailoring instruction: re-order and re-weight the parsed resume so the most relevant experience, projects, and skills appear first and are emphasized. De-emphasize less relevant items, but do not delete anything. Make the tailoring visible in the final JSON.\n`;
}

function styleSuggestionBlock(suggestStyle) {
  if (!suggestStyle) return '';
  return `\nStyle suggestion instruction: based on the resume content, choose the single best visual preset from this exact list: ${STYLE_PRESET_IDS.join(', ')}. Return your choice as a JSON object with "presetId" (string) and "reason" (one sentence). Prefer "classic" for finance/law/operations, "modern" for general tech, "bold" for design/creative/marketing, "warm" for academic/nonprofit/editorial.\n`;
}

function responseShapeBlock() {
  return `\nReturn a JSON object with a top-level key "resume" containing the parsed resume according to the schema. ${STYLE_PRESET_IDS.length ? 'If you were asked for a style suggestion, also include a top-level key "styleSuggestion" with { "presetId", "reason" }.' : ''}\n`;
}

export function buildParsePrompt({ text, jobDescription, suggestStyle }) {
  return (
    baseExtractionPrompt(text) +
    tailoringBlock(jobDescription) +
    styleSuggestionBlock(suggestStyle) +
    responseShapeBlock()
  );
}
