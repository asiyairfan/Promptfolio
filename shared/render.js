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

function safeImageUrl(raw) {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (/^data:image\/(jpeg|png);base64,/i.test(trimmed)) return trimmed;
  const url = safeUrl(trimmed);
  return /^https?:\/\//i.test(url) ? url : '';
}

function joinLines(text) {
  return escapeHtml(text)
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join('');
}

function avatarHtml(url, shape, size = '96px') {
  const safe = safeImageUrl(url);
  if (!safe || shape === 'none') return '';
  const shapeClass = `avatar-${shape}`;
  return `<img class="avatar ${shapeClass}" src="${escapeHtml(safe)}" alt="" style="width:${size};height:${size}">`;
}

function hasContact(contact) {
  return contact && (contact.email || contact.phone || contact.location || contact.website);
}

function navHtml(resume, links, variant = '') {
  const name = escapeHtml(resume.name || 'Portfolio');
  const items = links
    .map((link) => `<a href="#${link.id}" class="nav-link">${escapeHtml(link.label)}</a>`)
    .join('');
  return `
    <nav class="site-nav ${variant}">
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

function skillChipsHtml(skills, skillStyle = 'chip', limit = 6) {
  if (!skills || skills.length === 0) return '';
  const visible = skills.slice(0, limit);
  if (skillStyle === 'inline') {
    const items = visible.map((s) => `<span class="hero-skill-inline">${escapeHtml(s)}</span>`).join(', ');
    return `<div class="hero-skills hero-skills-inline">${items}</div>`;
  }
  const chips = visible
    .map((s) => `<span class="hero-skill ${skillStyle === 'outline' ? 'hero-skill-outline' : ''}">${escapeHtml(s)}</span>`)
    .join('');
  return `<div class="hero-skills hero-skills-${skillStyle}">${chips}</div>`;
}

function socialLinksHtml(contact) {
  const website = safeUrl(contact?.website);
  const links = [];
  if (website) {
    const lower = contact.website.toLowerCase();
    if (lower.includes('github.com')) links.push({ label: 'GitHub', href: website });
    if (lower.includes('linkedin.com')) links.push({ label: 'LinkedIn', href: website });
    if (lower.includes('twitter.com') || lower.includes('x.com')) links.push({ label: 'Twitter', href: website });
    if (links.length === 0) links.push({ label: 'Website', href: website });
  }
  if (contact?.email) {
    links.push({ label: 'Email', href: `mailto:${escapeHtml(contact.email)}` });
  }
  if (links.length === 0) return '';
  const items = links
    .map((l) => `<a class="hero-social" href="${escapeHtml(l.href)}"${l.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(l.label)}</a>`)
    .join('');
  return `<div class="hero-socials">${items}</div>`;
}

function heroAvatarHtml(contact, name, preset, size = '280px') {
  return avatarHtml(contact.avatarUrl, preset.tokens.avatarShape, size);
}

function studioHeroHtml(resume, preset) {
  const contact = resume.contact || {};
  const name = escapeHtml(resume.name || 'Your Name');
  const title = escapeHtml(resume.title || '');
  const summary = resume.summary ? joinLines(resume.summary) : '';
  const location = escapeHtml(contact.location || 'Independent portfolio');
  const experienceCount = resume.experience?.length || 0;
  const projectCount = resume.projects?.length || 0;
  const skillCount = resume.skills?.length || 0;
  const portrait = heroAvatarHtml(contact, name, preset, '100%');

  return `
    <header class="site-hero studio-hero" id="top">
      <div class="studio-hero-grid ${portrait ? '' : 'studio-hero-grid--no-portrait'}">
        <div class="studio-hero-copy">
          <p class="hero-eyebrow">Digital portfolio</p>
          <h1>${name}</h1>
          ${title ? `<p class="hero-title">${title}</p>` : ''}
          ${summary ? `<div class="hero-summary">${summary}</div>` : ''}
          <div class="hero-actions">
            ${ctaHtml('Explore projects', '#projects')}
            ${ctaHtml('Start a conversation', '#contact')}
          </div>
          ${socialLinksHtml(contact)}
        </div>
        ${portrait ? `
        <aside class="studio-portrait-panel">
          <div class="studio-portrait">
            ${portrait}
          </div>
          <div class="studio-portrait-meta">
            <span>Based in</span>
            <strong>${location}</strong>
          </div>
        </aside>
        ` : ''}
      </div>
      <div class="studio-highlights" aria-label="Portfolio highlights">
        <div><strong>${experienceCount}</strong><span>${experienceCount === 1 ? 'Role' : 'Roles'}</span></div>
        <div><strong>${projectCount}</strong><span>${projectCount === 1 ? 'Project' : 'Projects'}</span></div>
        <div><strong>${skillCount}</strong><span>${skillCount === 1 ? 'Skill' : 'Skills'}</span></div>
      </div>
    </header>
  `;
}

function creativeHeroHtml(resume) {
  const contact = resume.contact || {};
  const name = escapeHtml(resume.name || 'Your Name');
  const title = escapeHtml(resume.title || '');
  const summary = resume.summary ? joinLines(resume.summary) : '';

  return `
    <header class="site-hero creative-hero" id="top">
      <div class="creative-hero-grid">
        <p class="creative-index">Portfolio / 01</p>
        <div class="creative-hero-title">
          <p class="hero-eyebrow">Selected work by</p>
          <h1>${name}</h1>
          ${title ? `<p class="hero-title">${title}</p>` : ''}
        </div>
        <div class="creative-hero-notes">
          ${summary ? `<div class="hero-summary">${summary}</div>` : ''}
          <div class="hero-actions">
            ${ctaHtml('View the work', '#projects')}
            ${ctaHtml('Get in touch', '#contact')}
          </div>
          ${socialLinksHtml(contact)}
        </div>
      </div>
    </header>
  `;
}

function minimalHeroHtml(resume, preset) {
  const contact = resume.contact || {};
  const name = escapeHtml(resume.name || 'Your Name');
  const title = escapeHtml(resume.title || '');
  const summary = resume.summary ? joinLines(resume.summary) : '';
  const skills = skillChipsHtml(resume.skills, preset.tokens.skillStyle, 8);

  return `
    <header class="site-hero minimal-hero" id="top">
      <div class="minimal-hero-copy">
        <p class="hero-eyebrow">Portfolio</p>
        <h1>${name}</h1>
        ${title ? `<p class="hero-title">${title}</p>` : ''}
        ${summary ? `<div class="hero-summary">${summary}</div>` : ''}
        ${skills}
        <div class="hero-actions">
          ${ctaHtml('Projects', '#projects')}
          ${ctaHtml('Contact', '#contact')}
        </div>
        ${socialLinksHtml(contact)}
      </div>
    </header>
  `;
}

function aboutHtml(resume, preset) {
  const c = resume.contact || {};
  const summary = resume.summary ? joinLines(resume.summary) : '';
  const avatar = avatarHtml(c.avatarUrl, preset.tokens.avatarShape, '180px');
  if (!summary && !avatar) return '';
  return `
    <section class="section about-section" id="about">
      <div class="section-inner">
        <div class="about-grid ${avatar ? '' : 'about-grid--no-visual'}">
          ${avatar ? `<div class="about-visual">${avatar}</div>` : ''}
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

function minimalResumeHtml(resume) {
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  if (experience.length === 0 && education.length === 0 && skills.length === 0) return '';

  const experienceRows = experience
    .map((item) => `
      <article class="minimal-resume-row">
        <div>
          <h3>${escapeHtml(item.role)}</h3>
          ${item.organization ? `<p>${escapeHtml(item.organization)}</p>` : ''}
        </div>
        ${item.dates ? `<time>${escapeHtml(item.dates)}</time>` : ''}
      </article>
    `)
    .join('');
  const educationRows = education
    .map((item) => `
      <article class="minimal-resume-row">
        <div>
          <h3>${escapeHtml(item.degree)}</h3>
          ${item.institution ? `<p>${escapeHtml(item.institution)}</p>` : ''}
        </div>
        ${item.dates ? `<time>${escapeHtml(item.dates)}</time>` : ''}
      </article>
    `)
    .join('');
  const skillsList = skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join('');

  return `
    <section class="section minimal-resume-section" id="resume">
      <div class="section-inner minimal-resume-inner">
        <p class="section-eyebrow">Resume</p>
        <h2 class="section-title">Experience at a glance</h2>
        ${experienceRows ? `<div class="minimal-resume-group"><h3>Experience</h3>${experienceRows}</div>` : ''}
        ${educationRows ? `<div class="minimal-resume-group"><h3>Education</h3>${educationRows}</div>` : ''}
        ${skillsList ? `<ul class="minimal-skills-list">${skillsList}</ul>` : ''}
      </div>
    </section>
  `;
}

function projectsHtml(items) {
  if (!items || items.length === 0) return '';
  const cards = items
    .map((item) => {
      const link = safeUrl(item.link);
      const imageUrl = safeImageUrl(item.imageUrl);
      const title = link
        ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">${escapeHtml(item.name)}</a>`
        : escapeHtml(item.name);
      const visual = imageUrl
        ? `<img class="project-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.name || 'Project')} project preview" loading="lazy">`
        : `<span class="project-initial">${escapeHtml((item.name || 'P').charAt(0))}</span>`;
      return `
        <article class="project-card">
          <div class="project-visual">${visual}</div>
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

function buildStudio(resume, preset) {
  const exp = experienceContentHtml(resume.experience);
  const edu = educationContentHtml(resume.education);
  return [
    studioHeroHtml(resume, preset),
    aboutHtml(resume, preset),
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
    creativeHeroHtml(resume),
    projectsHtml(resume.projects),
    servicesHtml(resume.skills),
    (exp || edu) ? `<section class="section resume-section" id="resume"><div class="section-inner">${exp}${edu}</div></section>` : '',
    contactHtml(resume.contact),
    footerHtml(resume)
  ].join('');
}

function buildMinimal(resume, preset) {
  return [
    minimalHeroHtml(resume, preset),
    minimalResumeHtml(resume),
    projectsHtml(resume.projects),
    contactHtml(resume.contact),
    footerHtml(resume)
  ].join('');
}

const LAYOUT_BUILDERS = {
  studio: buildStudio,
  creative: buildCreative,
  minimal: buildMinimal
};

const LAYOUT_NAV_LINKS = {
  studio: [
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Skills' },
    { id: 'resume', label: 'Resume' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ],
  creative: [
    { id: 'projects', label: 'Work' },
    { id: 'services', label: 'Expertise' },
    { id: 'resume', label: 'Experience' },
    { id: 'contact', label: 'Contact' }
  ],
  minimal: [
    { id: 'top', label: 'Profile' },
    { id: 'resume', label: 'Resume' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ]
};

function resolveLayoutId(layoutId) {
  if (layoutId === 'creative' || layoutId === 'split') return 'creative';
  if (layoutId === 'minimal' || layoutId === 'magazine') return 'minimal';
  return 'studio';
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
      --font-display-weight: var(--font-display-weight);
      --heading-transform: var(--heading-transform);
      --heading-letter-spacing: var(--heading-letter-spacing);
      --body-font-size: var(--body-font-size);
      --line-height: var(--line-height);
      --visual-hero-pattern: var(--hero-pattern);
      --visual-body-pattern: var(--body-pattern);
      --visual-section-pattern: var(--section-pattern);
      --visual-animation-style: var(--animation-style);
      --visual-section-divider: var(--section-divider);
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
    .pattern-body-grid {
      background-image: linear-gradient(var(--accent-soft) 1px, transparent 1px), linear-gradient(90deg, var(--accent-soft) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .pattern-body-dots {
      background-image: radial-gradient(var(--accent-soft) 1px, transparent 1.5px);
      background-size: 18px 18px;
    }
    .pattern-body-diagonal {
      background-image: repeating-linear-gradient(135deg, transparent 0 22px, var(--accent-soft) 22px 23px);
    }
    .pattern-body-noise {
      background-image: radial-gradient(var(--accent-soft) 0.8px, transparent 1px);
      background-size: 7px 7px;
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

    /* Heroes */
    .site-hero {
      position: relative;
      overflow: hidden;
      padding: clamp(4rem, 9vw, 7rem) 1.5rem;
    }
    .site-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      pointer-events: none;
    }
    .pattern-hero-mesh .site-hero::before {
      background-image: radial-gradient(circle at 12% 18%, var(--accent-soft), transparent 34%), radial-gradient(circle at 86% 80%, var(--accent-soft), transparent 38%);
      opacity: 0.7;
    }
    .pattern-hero-grid .site-hero::before {
      background-image: linear-gradient(var(--accent-soft) 1px, transparent 1px), linear-gradient(90deg, var(--accent-soft) 1px, transparent 1px);
      background-size: 44px 44px;
      opacity: 0.42;
    }
    .pattern-hero-dots .site-hero::before {
      background-image: radial-gradient(var(--accent) 1px, transparent 1.5px);
      background-size: 18px 18px;
      opacity: 0.18;
    }
    .pattern-hero-noise .site-hero::before {
      background-image: radial-gradient(var(--accent-soft) 0.8px, transparent 1px);
      background-size: 7px 7px;
      opacity: 0.55;
    }
    .pattern-hero-diagonal .site-hero::before {
      background-image: repeating-linear-gradient(135deg, transparent 0 26px, var(--accent-soft) 26px 28px);
      opacity: 0.5;
    }
    .hero-eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent);
      margin: 0 0 0.6rem;
    }
    .studio-hero h1, .creative-hero h1, .minimal-hero h1 {
      font-family: var(--font-display);
      font-weight: var(--font-display-weight);
      line-height: 0.98;
      margin: 0;
      color: var(--text);
    }
    .hero-title {
      font-size: clamp(1.15rem, 2.4vw, 1.55rem);
      color: var(--accent);
      font-weight: 500;
      margin: 0.75rem 0 0;
    }
    .hero-summary {
      color: var(--muted);
      max-width: 52ch;
      font-size: clamp(1rem, 1.5vw, 1.15rem);
    }
    .hero-summary p { margin: 0 0 0.55em; }
    .hero-summary p:last-child { margin-bottom: 0; }
    .hero-actions { margin-top: 1.6rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .hero-skills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.25rem; }
    .hero-skill {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 0.82rem;
      font-weight: 600;
      border: 1px solid var(--accent-soft);
    }
    .hero-skill-outline { background: transparent; border-color: var(--accent); }
    .hero-skills-inline { display: block; color: var(--accent); font-size: 0.9rem; font-weight: 600; }
    .hero-skill-inline { white-space: nowrap; }
    .hero-socials { display: flex; gap: 1rem; margin-top: 1.4rem; flex-wrap: wrap; }
    .hero-social { font-size: 0.88rem; font-weight: 500; color: var(--muted); }
    .hero-social:hover { color: var(--accent); }

    .avatar {
      object-fit: cover;
      border: 5px solid var(--accent-soft);
      box-shadow: 0 24px 60px rgba(0,0,0,0.16);
    }
    .avatar-circle { border-radius: 50%; }
    .avatar-rounded { border-radius: var(--radius); }
    .avatar-square { border-radius: 0; }
    /* Studio: profile panel and factual highlights */
    .studio-hero { background: linear-gradient(135deg, var(--hero-bg), var(--bg)); }
    .studio-hero-grid, .studio-highlights {
      max-width: var(--max-width);
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }
    .studio-hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
      gap: clamp(2rem, 7vw, 6rem);
      align-items: center;
    }
    .studio-hero-grid--no-portrait { grid-template-columns: 1fr; }
    .studio-hero-copy h1 { font-size: clamp(3.2rem, 7vw, 6.5rem); max-width: 10ch; }
    .studio-hero-copy .hero-summary { margin-top: 1.5rem; }
    .studio-portrait-panel {
      background: var(--surface);
      border: 1px solid var(--accent-soft);
      box-shadow: 18px 18px 0 var(--accent-soft);
      padding: 0.9rem;
    }
    .studio-portrait { aspect-ratio: 4 / 5; overflow: hidden; background: var(--accent-soft); }
    .studio-portrait .avatar, .studio-portrait .hero-avatar-placeholder {
      width: 100% !important;
      height: 100% !important;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .studio-portrait-meta { display: flex; justify-content: space-between; gap: 1rem; padding-top: 0.9rem; color: var(--muted); font-size: 0.85rem; }
    .studio-portrait-meta strong { color: var(--text); text-align: right; }
    .studio-highlights {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      margin-top: clamp(2.5rem, 6vw, 5rem);
      border-top: 1px solid var(--accent-soft);
      border-bottom: 1px solid var(--accent-soft);
    }
    .studio-highlights div { display: flex; gap: 0.5rem; align-items: baseline; padding: 1rem 1.25rem; }
    .studio-highlights div + div { border-left: 1px solid var(--accent-soft); }
    .studio-highlights strong { font-family: var(--font-display); color: var(--accent); font-size: 1.65rem; }
    .studio-highlights span { color: var(--muted); font-size: 0.85rem; }

    /* Creative: typographic, work-led composition */
    .creative-hero { background: var(--hero-bg); border-top: 1px solid var(--accent-soft); border-bottom: 1px solid var(--accent-soft); }
    .creative-hero-grid {
      max-width: var(--max-width);
      margin: 0 auto;
      display: grid;
      grid-template-columns: minmax(120px, 0.25fr) minmax(0, 1.2fr) minmax(240px, 0.55fr);
      gap: 2rem;
      align-items: end;
      position: relative;
      z-index: 1;
    }
    .creative-index { margin: 0; color: var(--accent); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; writing-mode: vertical-rl; transform: rotate(180deg); }
    .creative-hero-title { border-top: 3px solid var(--accent); padding-top: 1.2rem; }
    .creative-hero-title h1 { font-size: clamp(4rem, 11vw, 10rem); letter-spacing: -0.07em; overflow-wrap: anywhere; }
    .creative-hero-notes { border-top: 1px solid var(--accent-soft); padding-top: 1.2rem; }
    .creative-hero-notes .hero-actions { flex-direction: column; align-items: flex-start; }
    .creative-hero-notes .cta-button { border-radius: 0; }

    /* Minimal: text-only introduction */
    .site-nav-minimal { position: relative; background: transparent; backdrop-filter: none; border-bottom: 0; }
    .minimal-hero { background: var(--bg); border-bottom: 1px solid var(--accent-soft); }
    .minimal-hero-copy { max-width: 760px; margin: 0 auto; position: relative; z-index: 1; }
    .minimal-hero h1 { font-size: clamp(3rem, 8vw, 7rem); letter-spacing: -0.06em; }
    .minimal-hero .hero-summary { margin-top: 1.5rem; }
    .minimal-hero .hero-actions { margin-top: 2rem; }
    .minimal-resume-inner { max-width: 820px; }
    .minimal-resume-group { margin-top: 2.5rem; }
    .minimal-resume-group > h3 { margin: 0; font-size: 0.8rem; color: var(--accent); letter-spacing: 0.12em; text-transform: uppercase; }
    .minimal-resume-row { display: flex; justify-content: space-between; gap: 1.5rem; padding: 1rem 0; border-bottom: 1px solid var(--accent-soft); }
    .minimal-resume-row h3 { margin: 0; font-family: var(--font-display); font-size: 1.05rem; }
    .minimal-resume-row p, .minimal-resume-row time { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.9rem; }
    .minimal-resume-row time { white-space: nowrap; }
    .minimal-skills-list { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; list-style: none; padding: 1.5rem 0 0; margin: 2.5rem 0 0; border-top: 1px solid var(--accent-soft); color: var(--muted); }
    .minimal-skills-list li::before { content: '•'; color: var(--accent); margin-right: 0.4rem; }

    /* Sections */
    .section {
      padding: clamp(3rem, 7vw, 5rem) 1.5rem;
    }
    .section:nth-child(even) { background-color: var(--surface); }
    .pattern-section-grid .section:nth-child(even) {
      background-image: linear-gradient(var(--accent-soft) 1px, transparent 1px), linear-gradient(90deg, var(--accent-soft) 1px, transparent 1px);
      background-size: 38px 38px;
    }
    .pattern-section-mesh .section:nth-child(even) {
      background-image: radial-gradient(circle at 10% 10%, var(--accent-soft), transparent 28%), radial-gradient(circle at 90% 85%, var(--accent-soft), transparent 30%);
    }
    .pattern-section-dots .section:nth-child(even) {
      background-image: radial-gradient(var(--accent-soft) 1px, transparent 1.5px);
      background-size: 18px 18px;
    }
    .pattern-section-noise .section:nth-child(even) {
      background-image: radial-gradient(var(--accent-soft) 0.8px, transparent 1px);
      background-size: 7px 7px;
    }
    .pattern-section-diagonal .section:nth-child(even) {
      background-image: repeating-linear-gradient(135deg, transparent 0 24px, var(--accent-soft) 24px 25px);
    }
    .section-divider-line .section + .section { border-top: 1px solid var(--accent-soft); }
    .section-divider-bar .section + .section { border-top: 3px solid var(--accent); }
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
    .about-grid--no-visual { grid-template-columns: 1fr; }
    .about-visual {
      display: flex;
      justify-content: center;
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
      overflow: hidden;
    }
    .project-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }
    .project-card:hover .project-image { transform: scale(1.05); }
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

    @keyframes hero-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    @keyframes card-rise {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animation-float .studio-portrait-panel { animation: hero-float 6s ease-in-out infinite; }
    .animation-float .creative-index { animation: hero-float 8s ease-in-out infinite reverse; }
    .has-reveal .section {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .has-reveal .section.is-visible { opacity: 1; transform: translateY(0); }
    .has-reveal .section.is-visible .service-card,
    .has-reveal .section.is-visible .edu-card,
    .has-reveal .section.is-visible .project-card,
    .has-reveal .section.is-visible .contact-card {
      animation: card-rise 0.5s both;
    }
    .has-reveal .section.is-visible .service-card:nth-child(2),
    .has-reveal .section.is-visible .edu-card:nth-child(2),
    .has-reveal .section.is-visible .project-card:nth-child(2),
    .has-reveal .section.is-visible .contact-card:nth-child(2) { animation-delay: 0.08s; }
    .has-reveal .section.is-visible .service-card:nth-child(3),
    .has-reveal .section.is-visible .edu-card:nth-child(3),
    .has-reveal .section.is-visible .project-card:nth-child(3),
    .has-reveal .section.is-visible .contact-card:nth-child(3) { animation-delay: 0.16s; }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      .has-reveal .section { opacity: 1; transform: none; }
    }

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
      .site-hero { padding: 3.5rem 1.25rem; }
      .hero-eyebrow { margin-bottom: 0.4rem; }
      .hero-title { margin-bottom: 0.6rem; }
      .hero-summary { font-size: 0.95rem; max-width: 46ch; }
      .hero-skills { margin-top: 0.9rem; }
      .hero-actions { margin-top: 1.1rem; }
      .hero-socials { margin-top: 1rem; }
      .studio-hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
      .studio-hero-copy h1 { font-size: clamp(2.8rem, 14vw, 4.4rem); }
      .studio-portrait-panel { max-width: 320px; }
      .studio-highlights { margin-top: 3rem; }
      .studio-highlights div { padding: 0.8rem 0.6rem; flex-direction: column; gap: 0; }
      .studio-highlights strong { font-size: 1.35rem; }
      .creative-hero-grid { grid-template-columns: 1fr; gap: 1.5rem; }
      .creative-index { writing-mode: initial; transform: none; }
      .creative-hero-title h1 { font-size: clamp(3.4rem, 18vw, 6.5rem); }
      .creative-hero-notes .hero-actions { flex-direction: row; }
      .minimal-hero h1 { font-size: clamp(2.8rem, 14vw, 4.8rem); }
      .minimal-resume-row { flex-direction: column; gap: 0.25rem; }
      .minimal-resume-row time { margin: 0; }
      .about-grid { grid-template-columns: 1fr; gap: 2rem; }
    }
  `;
}

function visualClass(prefix, value, allowed, fallback) {
  return `${prefix}${allowed.has(value) ? value : fallback}`;
}

function interactionScript() {
  return `<script>
    (() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

      const sections = document.querySelectorAll('.section');
      if (!sections.length) return;

      document.body.classList.add('has-reveal');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px' });

      sections.forEach((section) => observer.observe(section));
    })();
  </script>`;
}

export function renderPortfolio(resume, layoutId, presetId) {
  const preset = getPreset(presetId);
  const tokens = preset.tokens;
  const tokenVars = Object.entries(tokens)
    .map(([k, v]) => `--${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n      ');
  const activeLayoutId = resolveLayoutId(layoutId);
  const patterns = new Set(['none', 'mesh', 'grid', 'dots', 'noise', 'diagonal']);
  const bodyClasses = [
    `layout-${activeLayoutId}`,
    visualClass('pattern-hero-', tokens.heroPattern, patterns, 'none'),
    visualClass('pattern-body-', tokens.bodyPattern, patterns, 'none'),
    visualClass('pattern-section-', tokens.sectionPattern, patterns, 'none'),
    visualClass('animation-', tokens.animationStyle, new Set(['subtle', 'float']), 'subtle'),
    visualClass('section-divider-', tokens.sectionDivider, new Set(['none', 'line', 'bar']), 'none')
  ].join(' ');

  const builder = LAYOUT_BUILDERS[activeLayoutId];
  const navVariant = activeLayoutId === 'minimal' ? 'site-nav-minimal' : '';
  const bodyInner = navHtml(resume, LAYOUT_NAV_LINKS[activeLayoutId], navVariant) + builder(resume, preset);

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
<body class="${bodyClasses}">
  ${bodyInner}
  ${interactionScript()}
</body>
</html>`;
}
