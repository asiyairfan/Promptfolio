const VERCEL_API = 'https://api.vercel.com';
const MAX_POLL_SECONDS = 45;
const POLL_INTERVAL_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function vercelFetch(path, options = {}) {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  const qs = new URLSearchParams({ skipAutoDetectionConfirmation: '1' });
  if (teamId) qs.set('teamId', teamId);

  const url = `${VERCEL_API}${path}?${qs.toString()}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function deployToVercel(html) {
  const name = `ai-portfolio-${Date.now()}`;
  const data = Buffer.from(html, 'utf-8').toString('base64');

  const deployment = await vercelFetch('/v13/deployments', {
    method: 'POST',
    body: JSON.stringify({
      name,
      files: [{ file: 'index.html', data, encoding: 'base64' }],
      projectSettings: {
        framework: null,
        buildCommand: null,
        outputDirectory: null
      },
      target: 'production'
    })
  });

  const id = deployment.id;
  if (!id) throw new Error('Vercel did not return a deployment id');

  const projectId = deployment.projectId || deployment.project?.id;
  if (projectId) {
    try {
      await vercelFetch(`/v9/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ssoProtection: null })
      });
    } catch (err) {
      console.warn('Could not disable Vercel SSO protection:', err.message);
    }
  }

  const deadline = Date.now() + MAX_POLL_SECONDS * 1000;
  while (Date.now() < deadline) {
    const status = await vercelFetch(`/v13/deployments/${id}`);
    if (status.readyState === 'READY') {
      return {
        url: `https://${status.url}`,
        provider: 'vercel',
        deploymentId: id
      };
    }
    if (status.readyState === 'ERROR') {
      throw new Error(status.error?.message || 'Vercel deployment failed');
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error('Vercel deployment timed out');
}
