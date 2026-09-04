import { getSession } from './supabase.js';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

async function authHeader() {
  const session = await getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

async function authHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(await authHeader()),
  };
}

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

export async function uploadProjectImage(image, filename) {
  const form = new FormData();
  form.append('image', image, filename);
  const res = await fetch(`${API_URL}/api/publish/image`, {
    method: 'POST',
    headers: await authHeader(),
    body: form,
  });
  return handleResponse(res);
}

function isInlineProjectImage(value) {
  return /^data:image\/(?:jpeg|png);base64,/i.test(value || '');
}

async function uploadInlineProjectImages(resume) {
  const projects = await Promise.all((resume.projects || []).map(async (project) => {
    if (!isInlineProjectImage(project.imageUrl)) return project;

    const response = await fetch(project.imageUrl);
    const image = await response.blob();
    const filename = image.type === 'image/png' ? 'project.png' : 'project.jpg';
    const { url } = await uploadProjectImage(image, filename);
    return { ...project, imageUrl: url };
  }));

  return { ...resume, projects };
}

export async function publish(resume, layout, preset) {
  const publishableResume = await uploadInlineProjectImages(resume);
  const res = await fetch(`${API_URL}/api/publish`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ resume: publishableResume, layout, preset }),
  });
  return handleResponse(res);
}

export async function getPortfolios() {
  const res = await fetch(`${API_URL}/api/portfolios`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
}

export async function deletePortfolio(slug) {
  const res = await fetch(`${API_URL}/api/portfolios/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return handleResponse(res);
}
