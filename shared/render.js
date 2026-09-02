import { getPreset } from './style-presets.js';

export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function joinLines(text) {
  return escapeHtml(text)
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join('');
}

function sectionHeader(resume) {
  const c = resume.contact || {};
  const contactParts = [
    c.email ? `<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>` : '',
    c.phone ? `<span>${escapeHtml(c.phone)}</span>` : '',
    c.location ? `<span>${escapeHtml(c.location)}</span>` : '',
    c.website ? `<a href="${escapeHtml(c.website)}" target="_blank" rel="noopener">${escapeHtml(c.website)}</a>` : ''
  ].filter(Boolean);

  return `
    <header class="hero">
      <h1>${escapeHtml(resume.name || 'Your Name')}</h1>
      <p class="title">${escapeHtml(resume.title || '')}</p>
      ${resume.summary ? `<div class="summary">${joinLines(resume.summary)}</div>` : ''}
      ${contactParts.length ? `<div class="contact">${contactParts.join(' <span class="sep">·</span> ')}</div>` : ''}
    </header>
  `;
}

function sectionExperience(items) {
  if (!items || items.length === 0) return '';
  const rows = items
    .map(
      (item) => `
      <article class="entry">
        <div class="entry-head">
          <h3>${escapeHtml(item.role)}</h3>
          <span class="org">${escapeHtml(item.organization)}</span>
          <span class="dates">${escapeHtml(item.dates)}</span>
        </div>
        ${item.description ? `<div class="entry-body">${joinLines(item.description)}</div>` : ''}
      </article>
    `
    )
    .join('');
  return `<section class="experience"><h2>Experience</h2>${rows}</section>`;
}

function sectionEducation(items) {
  if (!items || items.length === 0) return '';
  const rows = items
    .map(
      (item) => `
      <article class="entry">
        <div class="entry-head">
          <h3>${escapeHtml(item.degree)}</h3>
          <span class="org">${escapeHtml(item.institution)}</span>
          <span class="dates">${escapeHtml(item.dates)}</span>
        </div>
        ${item.details ? `<div class="entry-body">${joinLines(item.details)}</div>` : ''}
      </article>
    `
    )
    .join('');
  return `<section class="education"><h2>Education</h2>${rows}</section>`;
}

function sectionSkills(skills) {
  if (!skills || skills.length === 0) return '';
  const chips = skills
    .map((s) => `<span class="skill">${escapeHtml(s)}</span>`)
    .join('');
  return `<section class="skills"><h2>Skills</h2><div class="skill-list">${chips}</div></section>`;
}

function sectionProjects(items) {
  if (!items || items.length === 0) return '';
  const rows = items
    .map(
      (item) => `
      <article class="entry project">
        <div class="entry-head">
          <h3>${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${escapeHtml(item.name)}</a>` : escapeHtml(item.name)}</h3>
        </div>
        ${item.description ? `<div class="entry-body">${joinLines(item.description)}</div>` : ''}
      </article>
    `
    )
    .join('');
  return `<section class="projects"><h2>Projects</h2>${rows}</section>`;
}

function globalStyles() {
  return `
    :root {
      --bg: var(--color-bg);
      --surface: var(--color-surface);
      --text: var(--color-text);
      --muted: var(--color-muted);
      --accent: var(--color-accent);
      --accent-soft: var(--color-accent-soft);
      --font-display: var(--font-display);
      --font-body: var(--font-body);
      --radius: var(--radius);
      --spacing: var(--spacing);
      --max-width: var(--max-width);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .page { max-width: var(--max-width); margin: 0 auto; padding: calc(var(--spacing) * 2) calc(var(--spacing) * 1.5); }
    .hero { margin-bottom: calc(var(--spacing) * 1.6); }
    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 5vw, 3rem);
      margin: 0 0 0.2em;
      color: var(--text);
      line-height: 1.1;
    }
    .title { font-size: 1.25rem; font-weight: 500; color: var(--accent); margin: 0 0 0.6em; }
    .summary { color: var(--muted); max-width: 65ch; }
    .summary p { margin: 0 0 0.5em; }
    .contact { margin-top: 1em; font-size: 0.95rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: 0.5em 1em; }
    .contact .sep { color: var(--muted); opacity: 0.5; }
    section { margin-bottom: calc(var(--spacing) * 1.5); }
    section h2 {
      font-family: var(--font-display);
      font-size: 1.15rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--accent);
      border-bottom: 2px solid var(--accent-soft);
      padding-bottom: 0.3em;
      margin: 0 0 1em;
    }
    .entry { margin-bottom: var(--spacing); }
    .entry-head { display: flex; flex-wrap: wrap; gap: 0.2em 1em; align-items: baseline; }
    .entry-head h3 { font-family: var(--font-display); font-size: 1.1rem; margin: 0; flex: 1 1 100%; }
    .org { font-weight: 500; color: var(--text); }
    .dates { color: var(--muted); font-size: 0.9rem; margin-left: auto; }
    .entry-body { color: var(--muted); margin-top: 0.4em; }
    .entry-body p { margin: 0 0 0.4em; }
    .skill-list { display: flex; flex-wrap: wrap; gap: 0.5em; }
    .skill {
      background: var(--accent-soft);
      color: var(--text);
      padding: 0.25em 0.75em;
      border-radius: var(--radius);
      font-size: 0.9rem;
      font-weight: 500;
    }
    .project h3 { flex: 1 1 100%; }

    /* Sidebar layout */
    .layout-sidebar .page { display: grid; grid-template-columns: 260px 1fr; gap: calc(var(--spacing) * 2); }
    .layout-sidebar .hero { grid-column: 1 / -1; }
    .layout-sidebar aside { padding-right: calc(var(--spacing) * 1); }
    .layout-sidebar main section { padding-left: calc(var(--spacing) * 1); border-left: 3px solid var(--accent-soft); }
    .layout-sidebar .skills { border-left: none; padding-left: 0; }
    .layout-sidebar .skill { display: inline-block; }

    @media (max-width: 760px) {
      .page { padding: var(--spacing); }
      .layout-sidebar .page { grid-template-columns: 1fr; }
      .layout-sidebar aside { padding-right: 0; border-bottom: 2px solid var(--accent-soft); padding-bottom: var(--spacing); }
      .layout-sidebar main section { border-left: none; padding-left: 0; }
      .entry-head { flex-direction: column; gap: 0.1em; }
      .dates { margin-left: 0; }
    }
  `;
}

export function renderPortfolio(resume, layoutId, presetId) {
  const preset = getPreset(presetId);
  const tokens = preset.tokens;
  const tokenVars = Object.entries(tokens)
    .map(([k, v]) => `--${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n      ');

  const mainContent = [
    sectionExperience(resume.experience),
    sectionEducation(resume.education),
    sectionProjects(resume.projects)
  ].join('');

  const sidebarContent = sectionSkills(resume.skills);

  const bodyInner =
    layoutId === 'sidebar'
      ? `${sectionHeader(resume)}<div class="page-body"><aside>${sidebarContent}</aside><main>${mainContent}</main></div>`
      : `${sectionHeader(resume)}<main>${mainContent}${sidebarContent}</main>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(resume.name || 'Portfolio')} — ${escapeHtml(resume.title || '')}</title>
  <meta name="description" content="${escapeHtml((resume.summary || '').slice(0, 160))}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${tokens.fontUrl}" rel="stylesheet">
  <style>
    :root {
      ${tokenVars}
    }
    ${globalStyles()}
  </style>
</head>
<body class="layout-${layoutId}">
  <div class="page">
    ${bodyInner}
  </div>
</body>
</html>`;
}
