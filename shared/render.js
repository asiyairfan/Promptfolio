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

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function safeUrl(raw) {
  if (!raw) return '';
  let url = raw.trim();
  try {
    const parsed = new URL(url, 'https://example.com');
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return '';
    if (parsed.protocol === 'mailto:' && !parsed.pathname.includes('@')) return '';
    return url;
  } catch {
    return '';
  }
}

function joinLines(text) {
  return escapeHtml(text)
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join('');
}

function avatarHtml(url, shape) {
  const safe = safeUrl(url);
  if (!safe || shape === 'none') return '';
  const shapeClass = `avatar-${shape}`;
  return `<img class="avatar ${shapeClass}" src="${escapeHtml(safe)}" alt="">`;
}

function contactParts(contact) {
  const c = contact || {};
  return [
    c.email ? `<a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>` : '',
    c.phone ? `<span>${escapeHtml(c.phone)}</span>` : '',
    c.location ? `<span>${escapeHtml(c.location)}</span>` : '',
    c.website ? `<a href="${escapeHtml(safeUrl(c.website))}" target="_blank" rel="noopener">${escapeHtml(c.website)}</a>` : ''
  ].filter(Boolean);
}

function heroHtml(resume) {
  const c = resume.contact || {};
  const parts = contactParts(c);
  const hasAvatar = safeUrl(c.avatarUrl) && getPreset().tokens.avatarShape !== 'none';

  return `
    <header class="hero">
      <div class="hero-main">
        ${avatarHtml(c.avatarUrl, 'circle')}
        <div class="hero-titles">
          <h1>${escapeHtml(resume.name || 'Your Name')}</h1>
          <p class="title">${escapeHtml(resume.title || '')}</p>
        </div>
      </div>
      ${resume.summary ? `<div class="summary">${joinLines(resume.summary)}</div>` : ''}
      ${parts.length ? `<div class="contact">${parts.join(' <span class="sep">·</span> ')}</div>` : ''}
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
  const chips = skills.map((s) => `<span class="skill">${escapeHtml(s)}</span>`).join('');
  return `<section class="skills"><h2>Skills</h2><div class="skill-list">${chips}</div></section>`;
}

function sectionProjects(items) {
  if (!items || items.length === 0) return '';
  const rows = items
    .map(
      (item) => {
        const link = safeUrl(item.link);
        const name = link
          ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(item.name)}</a>`
          : escapeHtml(item.name);
        return `
          <article class="entry project">
            <div class="entry-head">
              <h3>${name}</h3>
            </div>
            ${item.description ? `<div class="entry-body">${joinLines(item.description)}</div>` : ''}
          </article>
        `;
      }
    )
    .join('');
  return `<section class="projects"><h2>Projects</h2>${rows}</section>`;
}

function mainContent(resume) {
  return [
    sectionExperience(resume.experience),
    sectionEducation(resume.education),
    sectionProjects(resume.projects)
  ].join('');
}

function sidebarContent(resume) {
  return sectionSkills(resume.skills);
}

function buildTimeline(resume) {
  return `${heroHtml(resume)}<main>${mainContent(resume)}${sidebarContent(resume)}</main>`;
}

function buildSidebar(resume) {
  return `${heroHtml(resume)}<div class="page-body"><aside>${sidebarContent(resume)}</aside><main>${mainContent(resume)}</main></div>`;
}

function buildSplit(resume) {
  return `
    <div class="split-hero">
      ${heroHtml(resume)}
    </div>
    <main>${mainContent(resume)}${sidebarContent(resume)}</main>
  `;
}

function buildCards(resume) {
  const cards = [
    sectionExperience(resume.experience),
    sectionEducation(resume.education),
    sectionProjects(resume.projects),
    sidebarContent(resume)
  ].filter(Boolean);
  return `${heroHtml(resume)}<div class="card-grid">${cards.join('')}</div>`;
}

function buildMagazine(resume) {
  return `${heroHtml(resume)}<div class="magazine-body"><main>${mainContent(resume)}</main><aside>${sidebarContent(resume)}</aside></div>`;
}

const LAYOUT_BUILDERS = {
  timeline: buildTimeline,
  sidebar: buildSidebar,
  split: buildSplit,
  cards: buildCards,
  magazine: buildMagazine
};

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
      --font-display-weight: var(--font-display-weight);
      --heading-transform: var(--heading-transform);
      --heading-letter-spacing: var(--heading-letter-spacing);
      --body-font-size: var(--body-font-size);
      --line-height: var(--line-height);
      --hero-style: var(--hero-style);
      --section-divider: var(--section-divider);
      --skill-style: var(--skill-style);
      --hero-bg: var(--hero-bg);
      --avatar-shape: var(--avatar-shape);
      --accent-gradient: var(--accent-gradient);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      font-size: var(--body-font-size);
      line-height: var(--line-height);
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .page { max-width: var(--max-width); margin: 0 auto; padding: calc(var(--spacing) * 2) calc(var(--spacing) * 1.5); }

    .avatar {
      width: 96px;
      height: 96px;
      object-fit: cover;
      border: 3px solid var(--accent-soft);
    }
    .avatar-circle { border-radius: 50%; }
    .avatar-rounded { border-radius: var(--radius); }
    .avatar-square { border-radius: 0; }

    .hero {
      margin-bottom: calc(var(--spacing) * 1.6);
      position: relative;
    }
    .hero-main {
      display: flex;
      align-items: center;
      gap: var(--spacing);
      margin-bottom: 0.6em;
    }
    .hero-titles { flex: 1; }
    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: var(--font-display-weight);
      margin: 0 0 0.15em;
      color: var(--text);
      line-height: 1.1;
    }
    .title { font-size: 1.25rem; font-weight: 500; color: var(--accent); margin: 0 0 0.6em; }
    .summary { color: var(--muted); max-width: 65ch; }
    .summary p { margin: 0 0 0.5em; }
    .contact { margin-top: 1em; font-size: 0.95rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: 0.5em 1em; }
    .contact .sep { color: var(--muted); opacity: 0.5; }

    .hero-style-banner .hero {
      background: var(--hero-bg);
      padding: calc(var(--spacing) * 1.5);
      border-radius: var(--radius);
      border: 1px solid var(--accent-soft);
    }
    .hero-style-centered .hero { text-align: center; }
    .hero-style-centered .hero-main { justify-content: center; flex-direction: column; }
    .hero-style-centered .avatar { margin: 0 auto; }
    .hero-style-split .hero-main { flex-direction: row-reverse; justify-content: space-between; }
    .hero-style-split .hero-titles { flex: 0 0 55%; }
    .hero-style-split .summary { flex: 0 0 40%; margin: 0; }

    section { margin-bottom: calc(var(--spacing) * 1.5); }
    section h2 {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: var(--font-display-weight);
      text-transform: var(--heading-transform);
      letter-spacing: var(--heading-letter-spacing);
      color: var(--accent);
      padding-bottom: 0.3em;
      margin: 0 0 1em;
    }
    .section-divider-line section h2 { border-bottom: 2px solid var(--accent-soft); }
    .section-divider-bar section h2 { border-left: 4px solid var(--accent); padding-left: 0.6em; border-bottom: none; }
    .section-divider-dots section h2 { display: flex; align-items: center; gap: 0.6em; }
    .section-divider-dots section h2::after { content: ''; flex: 1; height: 4px; background: radial-gradient(circle, var(--accent-soft) 2px, transparent 2px); background-size: 12px 4px; }
    .section-divider-none section h2 { border: none; padding-bottom: 0; }

    .entry { margin-bottom: var(--spacing); }
    .entry-head { display: flex; flex-wrap: wrap; gap: 0.2em 1em; align-items: baseline; }
    .entry-head h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: var(--font-display-weight); margin: 0; flex: 1 1 100%; }
    .org { font-weight: 500; color: var(--text); }
    .dates { color: var(--muted); font-size: 0.9rem; margin-left: auto; }
    .entry-body { color: var(--muted); margin-top: 0.4em; }
    .entry-body p { margin: 0 0 0.4em; }

    .skill-list { display: flex; flex-wrap: wrap; gap: 0.5em; }
    .skill-style-inline .skill-list { gap: 0.25em; }
    .skill {
      font-size: 0.9rem;
      font-weight: 500;
    }
    .skill-style-chip .skill {
      background: var(--accent-soft);
      color: var(--text);
      padding: 0.25em 0.75em;
      border-radius: var(--radius);
    }
    .skill-style-outline .skill {
      background: transparent;
      color: var(--accent);
      padding: 0.2em 0.7em;
      border: 1.5px solid var(--accent-soft);
      border-radius: var(--radius);
    }
    .skill-style-inline .skill:not(:last-child)::after { content: ','; margin-right: 0.4em; }
    .skill-style-bar .skill {
      background: var(--accent-soft);
      color: var(--text);
      padding: 0.2em 0.75em;
      border-radius: 2px;
      border-left: 4px solid var(--accent);
    }

    .project h3 { flex: 1 1 100%; }

    /* Layout: Sidebar */
    .layout-sidebar .page { display: grid; grid-template-columns: 260px 1fr; gap: calc(var(--spacing) * 2); }
    .layout-sidebar .hero { grid-column: 1 / -1; }
    .layout-sidebar aside { padding-right: calc(var(--spacing) * 1); }
    .layout-sidebar main section { padding-left: calc(var(--spacing) * 1); border-left: 3px solid var(--accent-soft); }
    .layout-sidebar .skills { border-left: none; padding-left: 0; }

    /* Layout: Split */
    .layout-split .page { display: grid; grid-template-columns: 320px 1fr; gap: calc(var(--spacing) * 2); align-items: start; }
    .layout-split .split-hero { position: sticky; top: calc(var(--spacing) * 2); }
    .layout-split .hero-style-split .hero-main { flex-direction: column; align-items: flex-start; }

    /* Layout: Cards */
    .layout-cards .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing); }
    .layout-cards section {
      background: var(--surface);
      padding: var(--spacing);
      border-radius: var(--radius);
      border: 1px solid var(--accent-soft);
      margin-bottom: 0;
    }

    /* Layout: Magazine */
    .layout-magazine .magazine-body { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: calc(var(--spacing) * 2); }
    .layout-magazine .hero { text-align: center; }
    .layout-magazine .hero-main { justify-content: center; }
    .layout-magazine aside { padding-left: calc(var(--spacing) * 1); border-left: 1px solid var(--accent-soft); }

    @media (max-width: 760px) {
      .page { padding: var(--spacing); }
      .layout-sidebar .page,
      .layout-split .page,
      .layout-magazine .magazine-body,
      .layout-cards .card-grid { grid-template-columns: 1fr; }
      .layout-split .split-hero { position: static; }
      .layout-sidebar aside { padding-right: 0; border-bottom: 2px solid var(--accent-soft); padding-bottom: var(--spacing); }
      .layout-sidebar main section { border-left: none; padding-left: 0; }
      .layout-magazine aside { padding-left: 0; border-left: none; border-top: 1px solid var(--accent-soft); padding-top: var(--spacing); }
      .hero-style-split .hero-main { flex-direction: column; align-items: flex-start; }
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

  const builder = LAYOUT_BUILDERS[layoutId] || buildTimeline;
  const bodyInner = builder(resume);

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
<body class="layout-${layoutId} hero-style-${tokens.heroStyle} section-divider-${tokens.sectionDivider} skill-style-${tokens.skillStyle}">
  <div class="page">
    ${bodyInner}
  </div>
</body>
</html>`;
}
