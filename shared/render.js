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

function avatarHtml(url, shape, size = '96px') {
  const safe = safeUrl(url);
  if (!safe || shape === 'none') return '';
  const shapeClass = `avatar-${shape}`;
  return `<img class="avatar ${shapeClass}" src="${escapeHtml(safe)}" alt="" style="width:${size};height:${size}">`;
}

function hasContact(contact) {
  return contact && (contact.email || contact.phone || contact.location || contact.website);
}

function navHtml(resume) {
  const name = escapeHtml(resume.name || 'Portfolio');
  const links = [
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'resume', label: 'Resume' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ];
  const items = links
    .map((l) => `<a href="#${l.id}" class="nav-link">${l.label}</a>`)
    .join('');
  return `
    <nav class="site-nav">
      <div class="nav-inner">
        <a href="#top" class="nav-brand">${name}</a>
        <div class="nav-links">${items}</div>
        <button class="nav-toggle" aria-label="Open menu" onclick="document.body.classList.toggle('nav-open')">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `;
}

function ctaHtml(text = 'Get in touch', href = '#contact') {
  const link = safeUrl(href) || href;
  return `<a class="cta-button" href="${escapeHtml(link)}">${escapeHtml(text)}</a>`;
}

function heroHtml(resume, layout) {
  const c = resume.contact || {};
  const name = escapeHtml(resume.name || 'Your Name');
  const title = escapeHtml(resume.title || '');
  const summary = resume.summary ? joinLines(resume.summary) : '';
  const avatar = avatarHtml(c.avatarUrl, getPreset().tokens.avatarShape, '140px');

  if (layout === 'creative') {
    return `
      <header class="site-hero hero-creative" id="top">
        <div class="hero-creative-bg"></div>
        <div class="hero-creative-shape"></div>
        <div class="hero-inner">
          <div class="hero-content">
            <p class="hero-eyebrow">Hello, I'm</p>
            <h1>${name}</h1>
            ${title ? `<p class="hero-title">${title}</p>` : ''}
            ${summary ? `<div class="hero-summary">${summary}</div>` : ''}
            <div class="hero-actions">
              ${ctaHtml('View my work', '#projects')}
              ${ctaHtml('Contact me', '#contact')}
            </div>
          </div>
          <div class="hero-visual">
            ${avatar || `<div class="hero-avatar-placeholder">${name.charAt(0)}</div>`}
          </div>
        </div>
      </header>
    `;
  }

  if (layout === 'minimal') {
    return `
      <header class="site-hero hero-minimal" id="top">
        <div class="hero-inner">
          ${avatar || `<div class="hero-avatar-placeholder">${name.charAt(0)}</div>`}
          <h1>${name}</h1>
          ${title ? `<p class="hero-title">${title}</p>` : ''}
          ${summary ? `<div class="hero-summary">${summary}</div>` : ''}
          <div class="hero-actions">${ctaHtml('Get in touch', '#contact')}</div>
        </div>
      </header>
    `;
  }

  // studio default
  return `
    <header class="site-hero hero-studio" id="top">
      <div class="hero-inner">
        <div class="hero-text">
          <p class="hero-eyebrow">Portfolio</p>
          <h1>${name}</h1>
          ${title ? `<p class="hero-title">${title}</p>` : ''}
          ${summary ? `<div class="hero-summary">${summary}</div>` : ''}
          <div class="hero-actions">${ctaHtml('View my work', '#projects')}</div>
        </div>
        <div class="hero-visual">
          ${avatar || `<div class="hero-avatar-placeholder">${name.charAt(0)}</div>`}
        </div>
      </div>
    </header>
  `;
}

function aboutHtml(resume) {
  const c = resume.contact || {};
  const summary = resume.summary ? joinLines(resume.summary) : '';
  if (!summary && !c.avatarUrl) return '';
  const avatar = avatarHtml(c.avatarUrl, getPreset().tokens.avatarShape, '180px');
  return `
    <section class="section about-section" id="about">
      <div class="section-inner">
        <div class="about-grid">
          <div class="about-visual">
            ${avatar || `<div class="about-avatar-placeholder">${escapeHtml((resume.name || 'P').charAt(0))}</div>`}
          </div>
          <div class="about-content">
            <p class="section-eyebrow">About me</p>
            <h2 class="section-title">Who I am</h2>
            ${summary}
          </div>
        </div>
      </div>
    </section>
  `;
}

function servicesHtml(skills) {
  if (!skills || skills.length === 0) return '';
  const cards = skills
    .map((s) => `
      <article class="service-card">
        <div class="service-icon">${escapeHtml(s.charAt(0))}</div>
        <h3>${escapeHtml(s)}</h3>
      </article>
    `)
    .join('');
  return `
    <section class="section services-section" id="services">
      <div class="section-inner">
        <p class="section-eyebrow">What I do</p>
        <h2 class="section-title">Services & Skills</h2>
        <div class="services-grid">${cards}</div>
      </div>
    </section>
  `;
}

function experienceContentHtml(items) {
  if (!items || items.length === 0) return '';
  const rows = items
    .map(
      (item) => `
      <article class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-head">
            <h3>${escapeHtml(item.role)}</h3>
            <span class="timeline-org">${escapeHtml(item.organization)}</span>
            <span class="timeline-dates">${escapeHtml(item.dates)}</span>
          </div>
          ${item.description ? `<div class="timeline-body">${joinLines(item.description)}</div>` : ''}
        </div>
      </article>
    `
    )
    .join('');
  return `
    <p class="section-eyebrow">Background</p>
    <h2 class="section-title">Experience</h2>
    <div class="timeline">${rows}</div>
  `;
}

function educationContentHtml(items) {
  if (!items || items.length === 0) return '';
  const rows = items
    .map(
      (item) => `
      <article class="edu-card">
        <h3>${escapeHtml(item.degree)}</h3>
        <p class="edu-org">${escapeHtml(item.institution)}</p>
        <p class="edu-dates">${escapeHtml(item.dates)}</p>
        ${item.details ? `<div class="edu-body">${joinLines(item.details)}</div>` : ''}
      </article>
    `
    )
    .join('');
  return `
    <h3 class="subsection-title">Education</h3>
    <div class="education-grid">${rows}</div>
  `;
}

function projectsHtml(items) {
  if (!items || items.length === 0) return '';
  const cards = items
    .map((item) => {
      const link = safeUrl(item.link);
      const title = link
        ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(item.name)}</a>`
        : escapeHtml(item.name);
      return `
        <article class="project-card">
          <div class="project-visual">
            <span class="project-initial">${escapeHtml((item.name || 'P').charAt(0))}</span>
          </div>
          <div class="project-body">
            <h3>${title}</h3>
            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
          </div>
        </article>
      `;
    })
    .join('');
  return `
    <section class="section projects-section" id="projects">
      <div class="section-inner">
        <p class="section-eyebrow">Selected work</p>
        <h2 class="section-title">Projects</h2>
        <div class="projects-grid">${cards}</div>
      </div>
    </section>
  `;
}

function contactHtml(contact) {
  if (!hasContact(contact)) return '';
  const c = contact || {};
  const items = [
    c.email
      ? `<a class="contact-card" href="mailto:${escapeHtml(c.email)}"><span class="contact-label">Email</span><span class="contact-value">${escapeHtml(c.email)}</span></a>`
      : '',
    c.phone
      ? `<a class="contact-card" href="tel:${escapeHtml(c.phone)}"><span class="contact-label">Phone</span><span class="contact-value">${escapeHtml(c.phone)}</span></a>`
      : '',
    c.location
      ? `<div class="contact-card"><span class="contact-label">Location</span><span class="contact-value">${escapeHtml(c.location)}</span></div>`
      : '',
    c.website
      ? `<a class="contact-card" href="${escapeHtml(safeUrl(c.website))}" target="_blank" rel="noopener"><span class="contact-label">Website</span><span class="contact-value">${escapeHtml(c.website)}</span></a>`
      : ''
  ].filter(Boolean);
  return `
    <section class="section contact-section" id="contact">
      <div class="section-inner">
        <p class="section-eyebrow">Let's talk</p>
        <h2 class="section-title">Contact</h2>
        <div class="contact-grid">${items.join('')}</div>
      </div>
    </section>
  `;
}

function footerHtml(resume) {
  const name = escapeHtml(resume.name || 'Portfolio');
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <p>&copy; ${new Date().getFullYear()} ${name}. Built with AI Portfolio Builder.</p>
      </div>
    </footer>
  `;
}

function buildStudio(resume) {
  const exp = experienceContentHtml(resume.experience);
  const edu = educationContentHtml(resume.education);
  return [
    heroHtml(resume, 'studio'),
    aboutHtml(resume),
    servicesHtml(resume.skills),
    exp ? `<section class="section resume-section" id="resume"><div class="section-inner">${exp}</div></section>` : '',
    edu ? `<section class="section education-section"><div class="section-inner">${edu}</div></section>` : '',
    projectsHtml(resume.projects),
    contactHtml(resume.contact),
    footerHtml(resume)
  ].join('');
}

function buildCreative(resume) {
  const exp = experienceContentHtml(resume.experience);
  const edu = educationContentHtml(resume.education);
  return [
    heroHtml(resume, 'creative'),
    aboutHtml(resume),
    servicesHtml(resume.skills),
    (exp || edu) ? `<section class="section resume-section" id="resume"><div class="section-inner">${exp}${edu}</div></section>` : '',
    projectsHtml(resume.projects),
    contactHtml(resume.contact),
    footerHtml(resume)
  ].join('');
}

function buildMinimal(resume) {
  const exp = experienceContentHtml(resume.experience);
  const edu = educationContentHtml(resume.education);
  return [
    heroHtml(resume, 'minimal'),
    aboutHtml(resume),
    servicesHtml(resume.skills),
    exp ? `<section class="section resume-section" id="resume"><div class="section-inner">${exp}</div></section>` : '',
    edu ? `<section class="section education-section"><div class="section-inner">${edu}</div></section>` : '',
    projectsHtml(resume.projects),
    contactHtml(resume.contact),
    footerHtml(resume)
  ].join('');
}

const LAYOUT_BUILDERS = {
  studio: buildStudio,
  creative: buildCreative,
  minimal: buildMinimal,
  // legacy aliases fall back to studio
  timeline: buildStudio,
  sidebar: buildStudio,
  split: buildCreative,
  cards: buildStudio,
  magazine: buildMinimal
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
      --hero-bg: var(--hero-bg);
      --avatar-shape: var(--avatar-shape);
      --accent-gradient: var(--accent-gradient);
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: var(--font-body);
      background: var(--bg);
      color: var(--text);
      font-size: var(--body-font-size);
      line-height: var(--line-height);
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    .cta-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.85em 1.6em;
      border-radius: 999px;
      background: var(--accent);
      color: var(--bg);
      font-weight: 600;
      font-size: 0.95rem;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }
    .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
    .cta-button + .cta-button {
      background: transparent;
      color: var(--accent);
      border: 2px solid var(--accent-soft);
      box-shadow: none;
    }

    /* Navigation */
    .site-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(var(--bg), 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--accent-soft);
    }
    .nav-inner {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 0.9rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .nav-brand {
      font-family: var(--font-display);
      font-weight: var(--font-display-weight);
      font-size: 1.25rem;
      color: var(--text);
    }
    .nav-links {
      display: flex;
      gap: 1.75rem;
    }
    .nav-link {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--muted);
      position: relative;
    }
    .nav-link:hover { color: var(--accent); }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--accent);
      transition: width 0.2s ease;
    }
    .nav-link:hover::after { width: 100%; }
    .nav-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.4rem;
    }
    .nav-toggle span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--text);
      transition: 0.2s;
    }

    /* Hero */
    .site-hero {
      position: relative;
      overflow: hidden;
      padding: clamp(3rem, 8vw, 6rem) 1.5rem;
    }
    .hero-inner {
      max-width: var(--max-width);
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: center;
    }
    .hero-eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent);
      margin: 0 0 0.75rem;
    }
    .hero-content h1, .hero-text h1, .hero-minimal h1 {
      font-family: var(--font-display);
      font-weight: var(--font-display-weight);
      font-size: clamp(2.6rem, 6vw, 4.5rem);
      line-height: 1.05;
      margin: 0 0 0.25em;
      color: var(--text);
    }
    .hero-title {
      font-size: clamp(1.2rem, 2.5vw, 1.6rem);
      color: var(--accent);
      font-weight: 500;
      margin: 0 0 1rem;
    }
    .hero-summary { color: var(--muted); max-width: 54ch; }
    .hero-summary p { margin: 0 0 0.6em; }
    .hero-actions { margin-top: 1.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    .avatar {
      object-fit: cover;
      border: 4px solid var(--accent-soft);
      box-shadow: 0 20px 50px rgba(0,0,0,0.12);
      position: relative;
      z-index: 2;
    }
    .avatar-circle { border-radius: 50%; }
    .avatar-rounded { border-radius: var(--radius); }
    .avatar-square { border-radius: 0; }

    .hero-avatar-placeholder, .about-avatar-placeholder {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 4rem;
      font-weight: var(--font-display-weight);
      background: var(--accent-soft);
      color: var(--accent);
      border: 4px solid var(--accent-soft);
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
    }

    /* Studio hero */
    .hero-studio {
      background: linear-gradient(135deg, var(--hero-bg) 0%, var(--bg) 100%);
      min-height: 70vh;
      display: flex;
      align-items: center;
    }
    .hero-studio .hero-visual::before {
      content: '';
      position: absolute;
      width: 280px;
      height: 280px;
      border-radius: 50%;
      background: var(--accent-soft);
      opacity: 0.5;
      z-index: 1;
    }

    /* Creative hero */
    .hero-creative {
      background: var(--hero-bg);
      min-height: 85vh;
      display: flex;
      align-items: center;
    }
    .hero-creative-bg {
      position: absolute;
      inset: 0;
      background: var(--accent-gradient);
      opacity: 0.08;
      z-index: 0;
    }
    .hero-creative-shape {
      position: absolute;
      right: -10%;
      top: -20%;
      width: 60vw;
      height: 60vw;
      border-radius: 50%;
      background: var(--accent-soft);
      opacity: 0.25;
      z-index: 0;
    }
    .hero-creative .hero-inner {
      position: relative;
      z-index: 1;
    }
    .hero-creative .hero-content {
      padding-right: 2rem;
    }
    .hero-creative .hero-visual::before {
      content: '';
      position: absolute;
      inset: -20px;
      border: 3px solid var(--accent);
      border-radius: var(--radius);
      z-index: 1;
    }

    /* Minimal hero */
    .hero-minimal {
      background: var(--bg);
      text-align: center;
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-minimal .hero-inner {
      grid-template-columns: 1fr;
      max-width: 720px;
    }
    .hero-minimal .avatar, .hero-minimal .hero-avatar-placeholder {
      margin: 0 auto 1.5rem;
    }

    /* Sections */
    .section {
      padding: clamp(3rem, 7vw, 5rem) 1.5rem;
    }
    .section:nth-child(even) { background: var(--surface); }
    .section-inner {
      max-width: var(--max-width);
      margin: 0 auto;
    }
    .section-eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent);
      margin: 0 0 0.5rem;
    }
    .section-title {
      font-family: var(--font-display);
      font-weight: var(--font-display-weight);
      font-size: clamp(1.6rem, 3.5vw, 2.4rem);
      margin: 0 0 1.5rem;
      color: var(--text);
      text-transform: var(--heading-transform);
      letter-spacing: var(--heading-letter-spacing);
    }
    .subsection-title {
      font-family: var(--font-display);
      font-weight: var(--font-display-weight);
      font-size: 1.3rem;
      margin: 2.5rem 0 1rem;
      color: var(--text);
    }

    /* About */
    .about-grid {
      display: grid;
      grid-template-columns: 0.45fr 1fr;
      gap: 3rem;
      align-items: center;
    }
    .about-visual {
      display: flex;
      justify-content: center;
    }
    .about-avatar-placeholder {
      width: 200px;
      height: 200px;
      font-size: 5rem;
    }
    .about-content p { color: var(--muted); max-width: 60ch; }
    .about-content p + p { margin-top: 0.8em; }

    /* Services */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .service-card {
      background: var(--bg);
      border: 1px solid var(--accent-soft);
      border-radius: var(--radius);
      padding: 1.5rem;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.08);
    }
    .service-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--accent-soft);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-weight: var(--font-display-weight);
      font-size: 1.4rem;
      margin-bottom: 1rem;
    }
    .service-card h3 {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: var(--font-display-weight);
      margin: 0;
      color: var(--text);
    }

    /* Timeline / Experience */
    .timeline {
      position: relative;
      padding-left: 1.5rem;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 6px;
      top: 6px;
      bottom: 6px;
      width: 2px;
      background: var(--accent-soft);
    }
    .timeline-item {
      position: relative;
      padding-bottom: 2rem;
    }
    .timeline-marker {
      position: absolute;
      left: -1.5rem;
      top: 6px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent);
      border: 3px solid var(--bg);
      box-shadow: 0 0 0 2px var(--accent-soft);
    }
    .timeline-head h3 {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: var(--font-display-weight);
      margin: 0 0 0.2rem;
      color: var(--text);
    }
    .timeline-org { font-weight: 500; color: var(--text); margin-right: 0.75rem; }
    .timeline-dates { color: var(--muted); font-size: 0.9rem; }
    .timeline-body { color: var(--muted); margin-top: 0.5rem; }
    .timeline-body p { margin: 0 0 0.4em; }

    /* Education */
    .education-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .edu-card {
      background: var(--bg);
      border: 1px solid var(--accent-soft);
      border-radius: var(--radius);
      padding: 1.25rem;
    }
    .edu-card h3 {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: var(--font-display-weight);
      margin: 0 0 0.25rem;
      color: var(--text);
    }
    .edu-org { margin: 0; color: var(--muted); }
    .edu-dates { margin: 0.15rem 0 0; font-size: 0.9rem; color: var(--muted); }
    .edu-body { margin-top: 0.5rem; color: var(--muted); }

    /* Projects */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .project-card {
      background: var(--bg);
      border: 1px solid var(--accent-soft);
      border-radius: var(--radius);
      overflow: hidden;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.1);
    }
    .project-visual {
      height: 160px;
      background: var(--accent-soft);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .project-initial {
      font-family: var(--font-display);
      font-size: 4rem;
      font-weight: var(--font-display-weight);
      color: var(--accent);
      opacity: 0.6;
    }
    .project-body { padding: 1.25rem; }
    .project-body h3 {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: var(--font-display-weight);
      margin: 0 0 0.4rem;
      color: var(--text);
    }
    .project-body h3 a { color: var(--accent); }
    .project-body h3 a:hover { text-decoration: underline; }
    .project-body p { margin: 0; color: var(--muted); font-size: 0.95rem; }

    /* Contact */
    .contact-section { background: var(--surface); }
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }
    .contact-card {
      background: var(--bg);
      border: 1px solid var(--accent-soft);
      border-radius: var(--radius);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: transform 0.15s ease;
    }
    .contact-card:hover { transform: translateY(-3px); }
    .contact-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent);
      font-weight: 600;
    }
    .contact-value {
      font-size: 1rem;
      color: var(--text);
      word-break: break-word;
    }

    /* Footer */
    .site-footer {
      background: var(--text);
      color: var(--bg);
      padding: 1.5rem;
      text-align: center;
    }
    .footer-inner {
      max-width: var(--max-width);
      margin: 0 auto;
    }
    .site-footer p { margin: 0; font-size: 0.9rem; opacity: 0.8; }

    @media (max-width: 760px) {
      .nav-links {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg);
        border-bottom: 1px solid var(--accent-soft);
        flex-direction: column;
        padding: 1rem 1.5rem;
        gap: 1rem;
      }
      .nav-open .nav-links { display: flex; }
      .nav-toggle { display: flex; }
      .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
      .hero-creative .hero-content { padding-right: 0; }
      .hero-creative-shape { display: none; }
      .about-grid { grid-template-columns: 1fr; gap: 2rem; }
      .hero-actions { justify-content: center; }
      .hero-studio .hero-visual { order: -1; }
    }
  `;
}

export function renderPortfolio(resume, layoutId, presetId) {
  const preset = getPreset(presetId);
  const tokens = preset.tokens;
  const tokenVars = Object.entries(tokens)
    .map(([k, v]) => `--${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n      ');

  const builder = LAYOUT_BUILDERS[layoutId] || buildStudio;
  const bodyInner = navHtml(resume) + builder(resume);

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
  ${bodyInner}
</body>
</html>`;
}
