const VERCEL_API = 'https://api.vercel.com';
const MAX_POLL_SECONDS = 45;
const POLL_INTERVAL_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function vercelError(message, status, data) {
  const error = new Error(message);
  error.status = status;
  error.code = 'vercel_error';
  error.data = data;
  return error;
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
    const message = data?.error?.message || data?.message
      || (text.trimStart().startsWith('<')
        ? `Vercel returned an unexpected HTML response (HTTP ${res.status}).`
        : text || `Vercel request failed (HTTP ${res.status}).`);
    throw vercelError(message, res.status, data);
  }
  return data;
}

export async function deleteVercelDeployment({ projectId, projectName, deploymentId }) {
  const projectIdentifier = projectId || projectName;

  if (!projectIdentifier && !deploymentId) {
    throw vercelError('Vercel deployment metadata is missing.', 409);
  }

  try {
    if (projectIdentifier) {
      await vercelFetch(`/v9/projects/${encodeURIComponent(projectIdentifier)}`, { method: 'DELETE' });
      return;
    }

    await vercelFetch(`/v13/deployments/${encodeURIComponent(deploymentId)}`, { method: 'DELETE' });
  } catch (err) {
    if (err.status === 404) return;
    throw err;
  }
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
  if (!id) throw vercelError('Vercel did not return a deployment id.', 502);

  const projectId = deployment.projectId || deployment.project?.id;
  const projectName = deployment.project?.name || deployment.name || name;
  const projectIdentifier = projectId || projectName;

  try {
    await vercelFetch(`/v9/projects/${encodeURIComponent(projectIdentifier)}`, {
      method: 'PATCH',
      body: JSON.stringify({ ssoProtection: null })
    });
  } catch (err) {
    try {
      await deleteVercelDeployment({ projectId, projectName, deploymentId: id });
    } catch (cleanupError) {
      console.error('Could not clean up Vercel deployment after SSO configuration failed:', cleanupError.message);
    }
    throw err;
  }

  const deadline = Date.now() + MAX_POLL_SECONDS * 1000;
  while (Date.now() < deadline) {
    const status = await vercelFetch(`/v13/deployments/${id}`);
    if (status.readyState === 'READY') {
      return {
        url: `https://${status.url}`,
        provider: 'vercel',
        deploymentId: id,
        projectId: status.projectId || status.project?.id || projectId,
        projectName: status.project?.name || status.name || projectName
      };
    }
    if (status.readyState === 'ERROR') {
      throw vercelError(status.error?.message || 'Vercel deployment failed.', 502, status.error);
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw vercelError('Vercel deployment timed out.', 504);
}
