import { LAYOUTS, PRESETS } from '../../../shared/style-presets.js';
import { el } from '../dom.js';

function groupByFamily(presets) {
  return Object.values(presets).reduce((acc, preset) => {
    const family = preset.family || 'Other';
    if (!acc[family]) acc[family] = [];
    acc[family].push(preset);
    return acc;
  }, {});
}

function presetSwatch(preset) {
  const gradient = preset.tokens.accentGradient !== 'none'
    ? preset.tokens.accentGradient
    : `linear-gradient(135deg, ${preset.tokens.colorAccent}, ${preset.tokens.colorAccentSoft})`;
  return el('div', { class: 'preset-swatch' }, [
    el('div', {
      class: 'swatch-preview',
      style: `background: ${preset.tokens.colorBg}; color: ${preset.tokens.colorText};`,
    }, [
      el('div', { class: 'swatch-accent', style: `background: ${gradient};` }, ''),
      el('div', { class: 'swatch-title', style: `font-family: ${preset.tokens.fontDisplay};` }, preset.label),
      el('div', { class: 'swatch-body', style: `font-family: ${preset.tokens.fontBody};` }, 'Aa'),
    ]),
  ]);
}

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

  const familyGroups = groupByFamily(PRESETS);
  const presetContainer = el('div', { class: 'preset-groups' });

  Object.entries(familyGroups).forEach(([family, presets]) => {
    const groupEl = el('div', { class: 'preset-group' }, [
      el('h4', { class: 'preset-family' }, family),
      el('div', { class: 'choice-grid preset-grid' }),
    ]);
    const grid = groupEl.querySelector('.choice-grid');

    presets.forEach((preset) => {
      const isSuggested = state.styleSuggestion?.presetId === preset.id;
      const card = el('div', {
        class: `choice-card preset-card ${state.preset === preset.id ? 'selected' : ''}`,
        onclick: () => dispatch({ type: 'setPreset', payload: preset.id }),
      }, [
        presetSwatch(preset),
        el('div', { class: 'preset-info' }, [
          el('h4', {}, [
            preset.label,
            isSuggested ? el('span', { class: 'suggested-badge' }, 'AI pick') : null,
          ]),
          el('p', {}, preset.description),
        ]),
      ]);
      grid.appendChild(card);
    });

    presetContainer.appendChild(groupEl);
  });

  function surpriseMe() {
    const presetIds = Object.keys(PRESETS);
    const layoutIds = Object.keys(LAYOUTS);
    const nextPreset = presetIds[Math.floor(Math.random() * presetIds.length)];
    const nextLayout = layoutIds[Math.floor(Math.random() * layoutIds.length)];
    dispatch({ type: 'setPreset', payload: nextPreset });
    dispatch({ type: 'setLayout', payload: nextLayout });
  }

  return el('div', {}, [
    el('h2', {}, 'Choose a look'),
    el('p', { class: 'lead' }, 'Pick a layout and color preset. The live preview on the right updates instantly.'),
    el('div', { class: 'style-toolbar' }, [
      el('button', { class: 'btn btn-secondary', onclick: surpriseMe }, 'Surprise me'),
    ]),
    el('h3', {}, 'Layout'),
    layoutGrid,
    el('h3', {}, 'Preset'),
    presetContainer,
    state.styleSuggestion?.reason
      ? el('p', { class: 'lead' }, `AI suggestion: ${state.styleSuggestion.reason}`)
      : null,
    el('div', { class: 'actions' }, [
      el('button', { class: 'btn btn-secondary', onclick: () => dispatch({ type: 'setStep', payload: 1 }) }, 'Back'),
      el('button', { class: 'btn btn-primary', onclick: () => dispatch({ type: 'setStep', payload: 3 }) }, 'Next: Publish'),
    ]),
  ]);
}
