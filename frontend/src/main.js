import { emptyResume } from '../../shared/resume-schema.js';
import { renderPortfolio } from '../../shared/render.js';
import { DEFAULT_LAYOUT, DEFAULT_PRESET } from '../../shared/style-presets.js';
import { renderUpload } from './steps/upload.js';
import { renderReview } from './steps/review.js';
import { renderStyle } from './steps/style.js';
import { renderPublish } from './steps/publish.js';
import { renderLanding } from './landing.js';
import { renderPortfolios } from './portfolios.js';
import { el } from './dom.js';
import { supabase, getCurrentUser, getSession } from './supabase.js';

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review' },
  { id: 'style', label: 'Style' },
  { id: 'publish', label: 'Publish' },
];

const state = {
  view: 'landing',
  step: 0,
  file: null,
  text: '',
  jobDescription: '',
  resume: emptyResume(),
  layout: DEFAULT_LAYOUT,
  preset: DEFAULT_PRESET,
  styleSuggestion: null,
  warnings: [],
  published: null,
  busy: false,
  error: null,
  user: null,
  session: null,
};

const app = document.getElementById('app');

let shellEl = null;
let workspaceEl = null;
let previewFrame = null;
let previewKey = null;
let previewTimer = null;
let lastPreviewLayout = state.layout;
let lastPreviewPreset = state.preset;

export function dispatch(action) {
  switch (action.type) {
    case 'setView':
      state.view = action.payload;
      break;
    case 'setStep':
      state.step = action.payload;
      break;
    case 'setFile':
      state.file = action.payload;
      break;
    case 'setText':
      state.text = action.payload;
      break;
    case 'setJobDescription':
      state.jobDescription = action.payload;
      break;
    case 'setResume':
      state.resume = action.payload;
      break;
    case 'setLayout':
      state.layout = action.payload;
      break;
    case 'setPreset':
      state.preset = action.payload;
      break;
    case 'setStyleSuggestion':
      state.styleSuggestion = action.payload;
      break;
    case 'setWarnings':
      state.warnings = action.payload;
      break;
    case 'setPublished':
      state.published = action.payload;
      break;
    case 'setBusy':
      state.busy = action.payload;
      break;
    case 'setError':
      state.error = action.payload;
      break;
    case 'setUser':
      state.user = action.payload;
      break;
    case 'setSession':
      state.session = action.payload;
      break;
    case 'startBuilder':
      state.view = 'app';
      state.step = 0;
      break;
    case 'reset':
      Object.assign(state, {
        step: 0,
        file: null,
        text: '',
        jobDescription: '',
        resume: emptyResume(),
        layout: DEFAULT_LAYOUT,
        preset: DEFAULT_PRESET,
        styleSuggestion: null,
        warnings: [],
        published: null,
        busy: false,
        error: null,
      });
      break;
    default:
      return;
  }
  renderApp();
}

function renderAuthButton() {
  if (state.user) {
    return el('div', { class: 'user-chip' }, [
      state.user.user_metadata?.avatar_url
        ? el('img', { class: 'user-avatar', src: state.user.user_metadata.avatar_url, alt: '' })
        : null,
      el('span', { class: 'user-name' }, state.user.user_metadata?.full_name || state.user.email || 'Account'),
      el('button', {
        class: 'btn btn-secondary btn-sm',
        onclick: async () => {
          const { signOut } = await import('./supabase.js');
          await signOut();
          dispatch({ type: 'setUser', payload: null });
          dispatch({ type: 'setSession', payload: null });
        },
      }, 'Sign out'),
    ]);
  }
  return el('button', {
    class: 'btn btn-primary btn-sm',
    onclick: () => dispatch({ type: 'setView', payload: 'auth' }),
  }, 'Sign in');
}

function renderSidebar() {
  const nav = el('nav', { class: 'sidebar-nav' });
  STEPS.forEach((s, idx) => {
    const isActive = idx === state.step;
    const isDone = idx < state.step;
    const btn = el('button', {
      class: `nav-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`,
      onclick: () => dispatch({ type: 'setStep', payload: idx }),
    }, [
      el('span', { class: 'nav-number' }, String(idx + 1)),
      el('span', { class: 'nav-label' }, s.label),
    ]);
    nav.appendChild(btn);
  });

  return el('aside', { class: 'app-sidebar' }, [
    el('div', { class: 'sidebar-brand' }, [
      el('div', { class: 'brand-mark' }, '✦'),
      el('div', { class: 'brand-text' }, [
        el('div', { class: 'brand-title' }, 'AI Portfolio'),
        el('div', { class: 'brand-subtitle' }, 'Builder'),
      ]),
    ]),
    nav,
    el('div', { class: 'sidebar-footer' }, [
      renderAuthButton(),
      el('div', { class: 'footer-note' }, 'MVP hackathon edition'),
    ]),
  ]);
}

function renderPreviewPane() {
  previewFrame = el('iframe', {
    class: 'preview-frame',
    title: 'Live portfolio preview',
  });
  previewKey = null;
  clearTimeout(previewTimer);
  previewTimer = null;
  updatePreview(true);
  return el('aside', { class: 'app-preview' }, [
    el('div', { class: 'preview-header' }, [
      el('span', {}, 'Live preview'),
      el('span', { class: 'preview-hint' }, `${state.layout} · ${state.preset}`),
    ]),
    previewFrame,
  ]);
}

function getPreviewKey() {
  return `${state.layout}:${state.preset}:${JSON.stringify(state.resume)}`;
}

function updatePreview(immediate = false) {
  const frame = previewFrame;
  const key = getPreviewKey();

  clearTimeout(previewTimer);
  previewTimer = null;

  if (!frame || (key === previewKey && frame.srcdoc)) return;

  const html = renderPortfolio(state.resume, state.layout, state.preset);
  const layoutChanged = state.layout !== lastPreviewLayout;
  const presetChanged = state.preset !== lastPreviewPreset;
  const shouldUpdateImmediately = immediate || layoutChanged || presetChanged;

  const apply = () => {
    if (!frame) return;
    frame.srcdoc = html;
    previewKey = key;
    lastPreviewLayout = state.layout;
    lastPreviewPreset = state.preset;
  };

  if (shouldUpdateImmediately) {
    apply();
  } else {
    previewTimer = setTimeout(apply, 300);
  }
}

function renderStepPanel() {
  switch (state.step) {
    case 0: return renderUpload(state, dispatch);
    case 1: return renderReview(state, dispatch);
    case 2: return renderStyle(state, dispatch);
    case 3: return renderPublish(state, dispatch);
    default: return el('div', {}, 'Unknown step');
  }
}

function renderWorkspace() {
  const banner = state.error
    ? el('div', { class: 'error-banner' }, state.error)
    : null;

  const panel = el('div', { class: 'step-panel' });
  panel.appendChild(renderStepPanel());

  workspaceEl = el('div', { class: 'app-workspace' }, [
    banner,
    panel,
  ]);
  return workspaceEl;
}

function renderAppShell() {
  shellEl = el('div', { class: 'app-shell' });
  shellEl.appendChild(renderSidebar());
  shellEl.appendChild(renderWorkspace());
  shellEl.appendChild(renderPreviewPane());
  return shellEl;
}

function renderCurrentView() {
  switch (state.view) {
    case 'landing':
      return renderLanding(state, dispatch);
    case 'app':
      return renderAppShell();
    case 'portfolios':
      return renderPortfolios(state, dispatch);
    case 'auth':
      return renderAuthView();
    default:
      return renderLanding(state, dispatch);
  }
}

function renderAuthView() {
  return el('div', { class: 'auth-page' }, [
    el('div', { class: 'auth-card' }, [
      el('h2', {}, 'Sign in to publish'),
      el('p', { class: 'lead' }, 'Choose a provider to continue. No password required.'),
      el('div', { class: 'oauth-grid' }, [
        el('button', {
          class: 'btn btn-secondary oauth-btn google',
          onclick: async () => {
            const { signInWithGoogle } = await import('./supabase.js');
            await signInWithGoogle();
          },
        }, 'Continue with Google'),
        el('button', {
          class: 'btn btn-secondary oauth-btn github',
          onclick: async () => {
            const { signInWithGitHub } = await import('./supabase.js');
            await signInWithGitHub();
          },
        }, 'Continue with GitHub'),
      ]),
      el('button', { class: 'btn btn-link', onclick: () => dispatch({ type: 'setView', payload: 'landing' }) }, 'Back'),
    ]),
  ]);
}

function renderApp() {
  app.innerHTML = '';
  app.appendChild(renderCurrentView());
}

async function initAuth() {
  const session = await getSession();
  dispatch({ type: 'setSession', payload: session });
  dispatch({ type: 'setUser', payload: session?.user || null });

  supabase.auth.onAuthStateChange((_event, session) => {
    dispatch({ type: 'setSession', payload: session });
    dispatch({ type: 'setUser', payload: session?.user || null });
  });

  const user = await getCurrentUser();
  if (user) {
    dispatch({ type: 'setUser', payload: user });
  }
}

function handleOAuthCallback() {
  const hash = window.location.hash;
  const hasAuthParams = hash.includes('access_token=') || hash.includes('refresh_token=');
  if (hasAuthParams) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
    dispatch({ type: 'setView', payload: 'app' });
  }
}

initAuth().then(() => {
  handleOAuthCallback();
  renderApp();
});
