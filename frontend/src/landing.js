import { el } from './dom.js';

export function renderLanding(state, dispatch) {
  return el('div', { class: 'landing-page' }, [
    el('header', { class: 'landing-header' }, [
      el('div', { class: 'brand' }, [
        el('span', { class: 'brand-mark' }, '✦'),
        el('span', { class: 'brand-title' }, 'AI Portfolio Builder'),
      ]),
      el('nav', { class: 'landing-nav' }, [
        state.user
          ? el('button', { class: 'btn btn-secondary', onclick: () => dispatch({ type: 'setView', payload: 'portfolios' }) }, 'My portfolios')
          : null,
        state.user
          ? el('button', { class: 'btn btn-primary', onclick: () => dispatch({ type: 'startBuilder' }) }, 'Build portfolio')
          : el('button', { class: 'btn btn-primary', onclick: () => dispatch({ type: 'setView', payload: 'auth' }) }, 'Get started'),
      ]),
    ]),
    el('section', { class: 'hero-section' }, [
      el('h1', {}, 'Turn your resume into a polished portfolio site'),
      el('p', { class: 'hero-lead' }, 'Upload a PDF or paste your resume, review the AI-extracted details, pick a distinctive look, and publish — all in minutes.'),
      el('div', { class: 'hero-actions' }, [
        el('button', { class: 'btn btn-primary btn-lg', onclick: () => dispatch({ type: 'startBuilder' }) }, 'Start building'),
        state.user
          ? null
          : el('button', { class: 'btn btn-secondary btn-lg', onclick: () => dispatch({ type: 'setView', payload: 'auth' }) }, 'Sign in'),
      ]),
    ]),
    el('section', { class: 'features-section' }, [
      el('h2', {}, 'How it works'),
      el('div', { class: 'feature-grid' }, [
        featureCard('1', 'Upload', 'Drop your resume PDF or paste plain text.'),
        featureCard('2', 'Review', 'Edit anything the AI parser missed.'),
        featureCard('3', 'Style', 'Choose from 9 presets and 5 layouts.'),
        featureCard('4', 'Publish', 'Deploy a live page after signing in.'),
      ]),
    ]),
    el('footer', { class: 'landing-footer' }, [
      el('p', {}, 'Built for the AI hackathon.'),
    ]),
  ]);
}

function featureCard(number, title, description) {
  return el('div', { class: 'feature-card' }, [
    el('span', { class: 'feature-number' }, number),
    el('h3', {}, title),
    el('p', {}, description),
  ]);
}
