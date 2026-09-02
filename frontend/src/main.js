import { emptyResume } from '../../shared/resume-schema.js';
import { renderPortfolio } from '../../shared/render.js';
import { DEFAULT_LAYOUT, DEFAULT_PRESET } from '../../shared/style-presets.js';
import { renderUpload } from './steps/upload.js';
import { renderReview } from './steps/review.js';
import { renderStyle } from './steps/style.js';
import { renderPublish } from './steps/publish.js';
import { el } from './dom.js';

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review' },
  { id: 'style', label: 'Style' },
  { id: 'publish', label: 'Publish' },
];

const state = {
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
    el('div', { class: 'sidebar-footer' }, 'MVP hackathon edition'),
  ]);
}

function renderPreviewPane() {
  previewFrame = el('iframe', {
    class: 'preview-frame',
    title: 'Live portfolio preview',
  });
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
  const key = getPreviewKey();
  if (key === previewKey && previewFrame?.srcdoc) return;

  const html = renderPortfolio(state.resume, state.layout, state.preset);
  const layoutChanged = state.layout !== lastPreviewLayout;
  const presetChanged = state.preset !== lastPreviewPreset;
  const shouldUpdateImmediately = immediate || layoutChanged || presetChanged;

  const apply = () => {
    if (!previewFrame) return;
    previewFrame.srcdoc = html;
    previewKey = key;
    lastPreviewLayout = state.layout;
    lastPreviewPreset = state.preset;
  };

  clearTimeout(previewTimer);
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

function renderApp() {
  if (!shellEl) {
    app.innerHTML = '';
    shellEl = el('div', { class: 'app-shell' });
    shellEl.appendChild(renderSidebar());
    shellEl.appendChild(renderWorkspace());
    shellEl.appendChild(renderPreviewPane());
    app.appendChild(shellEl);
  } else {
    const oldWorkspace = workspaceEl;
    const newWorkspace = renderWorkspace();
    shellEl.replaceChild(newWorkspace, oldWorkspace);
  }
  updatePreview();
}

renderApp();
