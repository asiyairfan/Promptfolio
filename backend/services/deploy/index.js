import { deployToVercel, deleteVercelDeployment } from './vercel.js';
import { deployLocal, deleteLocal } from './local.js';

function deploymentError(message, code, status = 503) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

export function deployProvider() {
  if (process.env.VERCEL_TOKEN) return 'vercel';
  return process.env.ALLOW_LOCAL_DEPLOY === 'true' ? 'local' : 'unconfigured';
}

export async function deploy(html, layoutId) {
  const provider = deployProvider();

  if (provider === 'vercel') return deployToVercel(html, layoutId);
  if (provider === 'local') return deployLocal(html, layoutId);

  throw deploymentError(
    'Public publishing requires a VERCEL_TOKEN. Set ALLOW_LOCAL_DEPLOY=true only for local development.',
    'vercel_not_configured'
  );
}

export async function destroyDeployment(deployment) {
  if (deployment.provider === 'vercel') return deleteVercelDeployment(deployment);
  if (deployment.provider === 'local') return deleteLocal(deployment.deploymentId);

  throw deploymentError(
    'This portfolio does not have deployment metadata, so its hosted site cannot be removed automatically.',
    'deployment_metadata_missing',
    409
  );
}
