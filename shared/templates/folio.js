import { avatarHtml, contactLink, escapeHtml, externalLinkAttributes, joinLines, safeImageUrl, safeUrl } from '../html-helpers.js';

function baseTag(baseHref) {
  return baseHref ? `<base href="${escapeHtml(baseHref)}">` : '';
}

function projectCards(projects) {
  return (projects || []).map((project, index) => {
    const image = safeImageUrl(project.imageUrl);
    const link = safeUrl(project.link);
    const title = escapeHtml(project.name || `Project ${index + 1}`);
    return `<article class="group border-t border-neutral-300 py-7 md:grid md:grid-cols-[1.2fr_.8fr] md:gap-10">${image ? `<img class="mb-5 aspect-[4/3] w-full object-cover grayscale transition duration-500 group-hover:grayscale-0 md:mb-0" src="${escapeHtml(image)}" alt="${title}" loading="lazy">` : `<div class="mb-5 flex aspect-[4/3] items-center justify-center bg-neutral-200 text-5xl font-semibold md:mb-0">${String(index + 1).padStart(2, '0')}</div>`}<div><p class="mb-3 text-xs uppercase tracking-[.2em] text-neutral-500">Selected project</p><h3 class="text-2xl font-medium">${link ? `<a class="hover:underline" href="${escapeHtml(link)}"${externalLinkAttributes(link)}>${title}</a>` : title}</h3>${project.description ? `<p class="mt-3 text-neutral-600">${escapeHtml(project.description)}</p>` : ''}</div></article>`;
  }).join('');
}

export function renderFolio(resume, { baseHref = '' } = {}) {
  const contact = resume.contact || {};
  const photo = avatarHtml(contact.avatarUrl, 'h-full w-full object-cover grayscale', resume.name || 'Portfolio portrait');
  const action = contactLink(contact);
  const skills = resume.skills || [];
  const experience = resume.experience || [];
  const education = resume.education || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${baseTag(baseHref)}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(resume.name || 'Portfolio')} — ${escapeHtml(resume.title || '')}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap" rel="stylesheet">
  <style>body{font-family:'DM Sans',sans-serif}.folio-mono{font-family:'DM Mono',monospace}.hero-grid{background-image:linear-gradient(to right,#e5e5e5 1px,transparent 1px),linear-gradient(to bottom,#e5e5e5 1px,transparent 1px);background-size:36px 36px}.profile-image{min-height:420px;background:#e5e5e5}.text-balance{text-wrap:balance}</style>
</head>
<body class="bg-[#f7f7f5] text-neutral-900">
  <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"><a class="folio-mono text-xs uppercase tracking-[.22em]" href="#top">${escapeHtml(resume.name || 'Portfolio')}</a><div class="flex gap-5 text-sm"><a href="#about">About</a><a href="#work">Work</a><a href="#contact">Contact</a></div></nav>
  <main id="top">
    <section class="hero-grid border-y border-neutral-300"><div class="mx-auto grid min-h-[72vh] max-w-7xl items-end px-6 py-16 lg:grid-cols-[1.35fr_.65fr] lg:px-10"><div class="pb-3"><p class="folio-mono mb-8 text-xs uppercase tracking-[.2em]">Portfolio / ${new Date().getFullYear()}</p><h1 class="text-balance max-w-4xl text-6xl font-medium leading-[.88] tracking-[-.06em] md:text-8xl">${escapeHtml(resume.name || 'Your Name')}</h1>${resume.title ? `<p class="mt-8 max-w-xl text-xl md:text-2xl">${escapeHtml(resume.title)}</p>` : ''}${resume.summary ? `<div class="mt-6 max-w-xl text-neutral-600">${joinLines(resume.summary)}</div>` : ''}${action ? `<a class="mt-8 inline-block border-b border-neutral-900 pb-1 text-sm" href="${escapeHtml(action)}"${externalLinkAttributes(action)}>Start a conversation ↗</a>` : '<a class="mt-8 inline-block border-b border-neutral-900 pb-1 text-sm" href="#work">Selected work ↓</a>'}</div><div class="mt-12 lg:mt-0">${photo ? `<div class="profile-image overflow-hidden">${photo}</div>` : `<div class="profile-image flex items-end p-6"><span class="folio-mono text-sm uppercase tracking-[.2em]">${escapeHtml(contact.location || 'Independent')}</span></div>`}</div></div></section>

    <section id="about" class="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[.5fr_1fr] lg:px-10"><p class="folio-mono text-xs uppercase tracking-[.2em] text-neutral-500">01 / About</p><div><h2 class="max-w-3xl text-4xl leading-tight tracking-[-.04em] md:text-5xl">${escapeHtml(resume.title || 'A thoughtful practice with a practical point of view.')}</h2>${resume.summary ? `<div class="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-600">${joinLines(resume.summary)}</div>` : ''}${contact.location ? `<p class="mt-6 folio-mono text-xs uppercase tracking-[.16em]">Based in ${escapeHtml(contact.location)}</p>` : ''}${skills.length ? `<div class="mt-9 flex flex-wrap gap-2">${skills.map((skill) => `<span class="rounded-full border border-neutral-400 px-3 py-1 text-sm">${escapeHtml(skill)}</span>`).join('')}</div>` : ''}</div></section>

    ${(experience.length || education.length) ? `<section class="border-y border-neutral-300 bg-white"><div class="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[.5fr_1fr] lg:px-10"><p class="folio-mono text-xs uppercase tracking-[.2em] text-neutral-500">02 / Background</p><div>${experience.length ? `<div class="mb-12"><h2 class="mb-6 text-3xl tracking-[-.04em]">Experience</h2>${experience.map((item) => `<article class="grid gap-2 border-t border-neutral-300 py-5 md:grid-cols-[.75fr_1.25fr]"><p class="folio-mono text-xs uppercase tracking-[.14em] text-neutral-500">${escapeHtml(item.dates)}</p><div><h3 class="text-xl">${escapeHtml(item.role)}</h3><p class="mt-1 text-neutral-600">${escapeHtml(item.organization)}</p>${item.description ? `<div class="mt-3 text-neutral-600">${joinLines(item.description)}</div>` : ''}</div></article>`).join('')}</div>` : ''}${education.length ? `<div><h2 class="mb-6 text-3xl tracking-[-.04em]">Education</h2>${education.map((item) => `<article class="grid gap-2 border-t border-neutral-300 py-5 md:grid-cols-[.75fr_1.25fr]"><p class="folio-mono text-xs uppercase tracking-[.14em] text-neutral-500">${escapeHtml(item.dates)}</p><div><h3 class="text-xl">${escapeHtml(item.degree)}</h3><p class="mt-1 text-neutral-600">${escapeHtml(item.institution)}</p>${item.details ? `<div class="mt-3 text-neutral-600">${joinLines(item.details)}</div>` : ''}</div></article>`).join('')}</div>` : ''}</div></div></section>` : ''}

    ${resume.projects?.length ? `<section id="work" class="mx-auto max-w-7xl px-6 py-24 lg:px-10"><div class="mb-12 grid gap-6 md:grid-cols-[.5fr_1fr]"><p class="folio-mono text-xs uppercase tracking-[.2em] text-neutral-500">03 / Work</p><h2 class="text-4xl tracking-[-.04em] md:text-5xl">Selected projects</h2></div>${projectCards(resume.projects)}</section>` : ''}

    <section id="contact" class="border-t border-neutral-300 bg-neutral-900 text-[#f7f7f5]"><div class="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[.5fr_1fr] lg:px-10"><p class="folio-mono text-xs uppercase tracking-[.2em] text-neutral-400">04 / Contact</p><div><h2 class="max-w-2xl text-5xl leading-[.95] tracking-[-.05em] md:text-7xl">Let’s make the next thing count.</h2><div class="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-lg">${contact.email ? `<a class="border-b border-neutral-500 pb-1" href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : ''}${contact.phone ? `<a class="border-b border-neutral-500 pb-1" href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a>` : ''}${contact.website && safeUrl(contact.website) ? `<a class="border-b border-neutral-500 pb-1" href="${escapeHtml(safeUrl(contact.website))}"${externalLinkAttributes(safeUrl(contact.website))}>${escapeHtml(contact.website)} ↗</a>` : ''}</div></div></div></section>
  </main>
  <footer class="bg-neutral-900 px-6 pb-8 text-center text-xs text-neutral-400">© ${new Date().getFullYear()} ${escapeHtml(resume.name || 'Portfolio')}</footer>
</body>
</html>`;
}
