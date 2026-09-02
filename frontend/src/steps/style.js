import { LAYOUTS, PRESETS } from '../../../shared/style-presets.js';
import { el } from '../dom.js';

export function renderStyle(state, dispatch) {
  const layoutGrid = el('div', { class: 'choice-grid' });
  Object.values(LAYOUTS).forEach((layout) => {
    const card = el('div', {
      class: `choice-card ${state.layout === layout.id ? 'selected' : ''}`,
      onclick: () => dispatch({ type: 'setLayout', payload: layout.id }),
    }, [
      el('h4', {}, layout.label),
      el('p', {}, layout.description),
    ]);
    layoutGrid.appendChild(card);
  });

  const presetGrid = el('div', { class: 'choice-grid' });
  Object.values(PRESETS).forEach((preset) => {
    const isSuggested = state.styleSuggestion?.presetId === preset.id;
    const card = el('div', {
      class: `choice-card ${state.preset === preset.id ? 'selected' : ''}`,
      onclick: () => dispatch({ type: 'setPreset', payload: preset.id }),
    }, [
      el('h4', {}, [
        preset.label,
        isSuggested ? el('span', { class: 'suggested-badge' }, 'AI pick') : null,
      ]),
      el('p', {}, preset.description),
    ]);
    presetGrid.appendChild(card);
  });

  return el('div', {}, [
    el('h2', {}, 'Choose a look'),
    el('p', { class: 'lead' }, 'Pick a layout and color preset. The live preview on the right updates instantly.'),
    el('h3', {}, 'Layout'),
    layoutGrid,
    el('h3', {}, 'Preset'),
    presetGrid,
    state.styleSuggestion?.reason
      ? el('p', { class: 'lead' }, `AI suggestion: ${state.styleSuggestion.reason}`)
      : null,
    el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-secondary', onclick: () => dispatch({ type: 'setStep', payload: 1 }) }, 'Back'),
      el('button', { class: 'btn btn-primary', onclick: () => dispatch({ type: 'setStep', payload: 3 }) }, 'Next: Publish'),
    ]),
  ]);
}

