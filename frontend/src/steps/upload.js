import { extractText, parseResume } from '../api.js';
import sampleResume from '../../../shared/sample-resume.json';
import { el } from '../dom.js';

const MAX_SIZE = 10 * 1024 * 1024;

export function renderUpload(state, dispatch) {
  const fileInput = el('input', {
    type: 'file',
    accept: 'application/pdf',
    style: 'display:none',
    onchange: (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file);
    },
  });

  let dropZone;

  function handleFile(file) {
    if (file.type !== 'application/pdf') {
      dispatch({ type: 'setError', payload: 'Please upload a PDF file.' });
      return;
    }
    if (file.size > MAX_SIZE) {
      dispatch({ type: 'setError', payload: 'PDF must be under 10 MB.' });
      return;
    }
    dispatch({ type: 'setError', payload: null });
    dispatch({ type: 'setFile', payload: file });
    updateDropLabel();
  }

  function updateDropLabel() {
    const label = dropZone.querySelector('.drop-label');
    const name = dropZone.querySelector('.file-name');
    if (state.file) {
      label.textContent = 'File selected';
      name.textContent = `${state.file.name} (${(state.file.size / 1024).toFixed(1)} KB)`;
    } else {
      label.textContent = 'Drop your resume PDF here, or click to browse';
      name.textContent = '';
    }
  }

  async function onSubmit() {
    if (!state.file) {
      dispatch({ type: 'setError', payload: 'Select a PDF first.' });
      return;
    }
    dispatch({ type: 'setError', payload: null });
    dispatch({ type: 'setBusy', payload: true });
    try {
      const { text } = await extractText(state.file);
      const { resume, styleSuggestion, warnings } = await parseResume(
        text,
        state.jobDescription,
        true
      );
      dispatch({ type: 'setText', payload: text });
      dispatch({ type: 'setResume', payload: resume });
      dispatch({ type: 'setWarnings', payload: warnings || [] });
      dispatch({ type: 'setStyleSuggestion', payload: styleSuggestion || null });
      if (styleSuggestion?.presetId) {
        dispatch({ type: 'setPreset', payload: styleSuggestion.presetId });
      }
      dispatch({ type: 'setStep', payload: 1 });
    } catch (err) {
      dispatch({ type: 'setError', payload: err.message });
    } finally {
      dispatch({ type: 'setBusy', payload: false });
    }
  }

  async function useSample() {
    dispatch({ type: 'setError', payload: null });
    dispatch({ type: 'setBusy', payload: true });
    try {
      const text = `Sample resume for ${sampleResume.name}. ${sampleResume.title}. ${sampleResume.summary}`;
      dispatch({ type: 'setText', payload: text });
      dispatch({ type: 'setResume', payload: sampleResume });
      dispatch({ type: 'setWarnings', payload: [] });
      dispatch({ type: 'setStyleSuggestion', payload: { presetId: 'modern', reason: 'Default sample style' } });
      dispatch({ type: 'setPreset', payload: 'modern' });
      dispatch({ type: 'setStep', payload: 1 });
    } finally {
      dispatch({ type: 'setBusy', payload: false });
    }
  }

  dropZone = el('div', {
    class: 'drop-zone',
    onclick: () => fileInput.click(),
    ondragover: (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    },
    ondragleave: () => dropZone.classList.remove('dragover'),
    ondrop: (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
  }, [
    el('div', { class: 'drop-label' }, 'Drop your resume PDF here, or click to browse'),
    el('div', { class: 'file-name' }, ''),
  ]);

  const jdInput = el('textarea', {
    id: 'jd',
    placeholder: 'Paste a job description here to tailor the portfolio (optional)',
    oninput: (e) => dispatch({ type: 'setJobDescription', payload: e.target.value }),
  });
  jdInput.value = state.jobDescription;

  const container = el('div', {}, [
    el('h2', {}, 'Upload your resume'),
    el('p', { class: 'lead' }, 'We will extract the text, parse it with AI, and turn it into a portfolio.'),
    fileInput,
    dropZone,
    el('div', { class: 'form-group', style: 'margin-top:1.5rem' }, [
      el('label', { for: 'jd' }, 'Target job description (optional)'),
      jdInput,
    ]),
    el('div', { class: 'actions' }, [
      el('button', {
        class: 'btn btn-primary',
        disabled: state.busy,
        onclick: onSubmit,
      }, state.busy ? [spinner(), ' Parsing…'] : 'Parse resume'),
      el('button', {
        class: 'btn btn-secondary',
        disabled: state.busy,
        onclick: useSample,
      }, 'Use sample resume'),
    ]),
  ]);

  if (state.file) updateDropLabel();
  return container;
}

function spinner() {
  return el('span', { class: 'spinner' });
}

