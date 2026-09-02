const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error?.message || data.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.code = data.error?.code || res.status;
    throw err;
  }
  return data;
}

export async function extractText(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/extract-text`, {
    method: 'POST',
    body: form,
  });
  return handleResponse(res);
}

export async function parseResume(text, jobDescription = '', suggestStyle = true) {
  const res = await fetch(`${API_URL}/api/parse-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, jobDescription, suggestStyle }),
  });
  return handleResponse(res);
}

export async function publish(resume, layout, preset) {
  const res = await fetch(`${API_URL}/api/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume, layout, preset }),
  });
  return handleResponse(res);
}
