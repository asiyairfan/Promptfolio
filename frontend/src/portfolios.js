import { getPortfolios, deletePortfolio } from './api.js';
import { el } from './dom.js';

export function renderPortfolios(state, dispatch) {
  const listContainer = el('div', { class: 'portfolio-list' });

  async function load() {
    try {
      const { portfolios } = await getPortfolios();
      listContainer.innerHTML = '';
      if (!portfolios.length) {
        listContainer.appendChild(el('p', { class: 'empty-state' }, 'No portfolios yet. Build one to get started.'));
        return;
      }
      portfolios.forEach((portfolio) => {
        listContainer.appendChild(renderPortfolioCard(portfolio, load));
      });
    } catch (err) {
      listContainer.appendChild(el('p', { class: 'error-text' }, err.message));
    }
  }

  load();

  return el('div', { class: 'portfolios-page' }, [
    el('header', { class: 'portfolios-header' }, [
      el('h2', {}, 'My portfolios'),
      el('button', { class: 'btn btn-secondary', onclick: () => dispatch({ type: 'setView', payload: 'landing' }) }, 'Back'),
    ]),
    listContainer,
  ]);
}

function renderPortfolioCard(portfolio, onChange) {
  async function remove() {
    if (!confirm('Delete this portfolio?')) return;
    try {
      await deletePortfolio(portfolio.slug);
      onChange();
    } catch (err) {
      alert(err.message);
    }
  }

  return el('div', { class: 'portfolio-card' }, [
    el('div', { class: 'portfolio-meta' }, [
      el('h3', {}, portfolio.slug),
      el('span', { class: 'portfolio-theme' }, `${portfolio.layout} · ${portfolio.preset}`),
    ]),
    el('div', { class: 'portfolio-actions' }, [
      el('a', {
        class: 'btn btn-secondary',
        href: portfolio.published_url,
        target: '_blank',
        rel: 'noopener',
      }, 'Open'),
      el('button', { class: 'btn btn-danger', onclick: remove }, 'Delete'),
    ]),
  ]);
}
