import { publish } from '../api.js';
import { el } from '../dom.js';

export function renderPublish(state, dispatch) {
  async function onPublish() {
    dispatch({ type: 'setError', payload: null });
    dispatch({ type: 'setBusy', payload: true });
    try {
      const result = await publish(state.resume, state.layout, state.preset);
      dispatch({ type: 'setPublished', payload: result });
    } catch (err) {
      dispatch({ type: 'setError', payload: err.message });
    } finally {
      dispatch({ type: 'setBusy', payload: false });
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(state.published.url).then(() => {
      // no-op; the brief selection flash is enough feedback
    });
  }

  function startOver() {
    dispatch({ type: 'reset' });
  }

  if (!state.published) {
    return el('div', {}, [
      el('h2', {}, 'Publish your portfolio'),
      el('p', { class: 'lead' }, 'We will deploy the rendered page and give you a live URL.'),
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-secondary', onclick: () => dispatch({ type: 'setStep', payload: 2 }) }, 'Back'),
        el('button', {
          class: 'btn btn-primary',
          disabled: state.busy,
          onclick: onPublish,
        }, state.busy ? [spinner(), ' Publishing…'] : 'Publish now'),
      ]),
    ]);
  }

  return el('div', {}, [
    el('h2', {}, 'Your portfolio is live'),
    el('div', { class: 'result-card' }, [
      el('p', {}, [
        'URL: ',
        el('a', { href: state.published.url, target: '_blank', rel: 'noopener' }, state.published.url),
      ]),
      el('p', {}, `Provider: ${state.published.provider || 'unknown'}`),
      state.published.note ? el('p', {}, `Note: ${state.published.note}`) : null,
      el('div', { class: 'actions' }, [
        el('button', { class: 'btn btn-secondary', onclick: copyUrl }, 'Copy link'),
        el('button', { class: 'btn btn-primary', onclick: startOver }, 'Build another'),
      ]),
    ]),
  ]);
}

function spinner() {
  return el('span', { class: 'spinner' });
}

