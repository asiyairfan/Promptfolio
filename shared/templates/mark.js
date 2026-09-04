import { avatarHtml, contactLink, escapeHtml, externalLinkAttributes, joinLines, safeImageUrl, safeUrl } from '../html-helpers.js';

function baseTag(baseHref) {
  return baseHref ? `<base href="${escapeHtml(baseHref)}">` : '';
}

function workItems(projects) {
  return (projects || []).map((project, index) => {
    const image = safeImageUrl(project.imageUrl);
    const link = safeUrl(project.link);
    const title = escapeHtml(project.name || `Project ${index + 1}`);
    return `<div class="col-lg-4"><article class="text-container"><div class="image-container">${image ? `<img class="img-fluid" src="${escapeHtml(image)}" alt="${title}" loading="lazy">` : `<div class="project-placeholder">${String(index + 1).padStart(2, '0')}</div>`}</div><h4>${link ? `<a href="${escapeHtml(link)}"${externalLinkAttributes(link)}>${title}</a>` : title}</h4>${project.description ? `<p>${escapeHtml(project.description)}</p>` : ''}</article></div>`;
  }).join('');
}

export function renderMark(resume, { baseHref = '' } = {}) {
  const contact = resume.contact || {};
  const photo = avatarHtml(contact.avatarUrl, 'img-fluid rounded-circle', resume.name || 'Portfolio portrait');
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700|Open+Sans:400,600|Poppins:400,500,600,700" rel="stylesheet">
  <link rel="stylesheet" href="css/bootstrap.css">
  <link rel="stylesheet" href="css/fontawesome-all.css">
  <link rel="stylesheet" href="css/styles.css">
  <style>.profile-portrait img{width:100%;max-width:360px;aspect-ratio:1;object-fit:cover}.skill-line{display:inline-block;margin:.25rem .35rem 0 0;padding:.35rem .7rem;border:1px solid #cfd7de;border-radius:999px}.project-placeholder{display:grid;min-height:230px;place-items:center;background:#edf1f5;color:#0b36a8;font-size:3rem;font-weight:700}.text-container h4 a{color:inherit}.header .profile-portrait{margin-top:2rem}</style>
</head>
<body data-spy="scroll" data-target=".navbar">
  <nav class="navbar navbar-expand-lg navbar-dark fixed-top"><div class="container"><a class="navbar-brand logo-text" href="#header">${escapeHtml(resume.name || 'Portfolio')}</a><button class="navbar-toggler p-0 border-0" type="button" data-toggle="collapse" data-target="#mark-nav" aria-controls="mark-nav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="mark-nav"><ul class="navbar-nav ml-auto"><li class="nav-item"><a class="nav-link" href="#about">About</a></li>${experience.length || education.length ? '<li class="nav-item"><a class="nav-link" href="#experience">Experience</a></li>' : ''}${resume.projects?.length ? '<li class="nav-item"><a class="nav-link" href="#projects">Projects</a></li>' : ''}<li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li></ul></div></div></nav>

  <header id="header" class="header"><div class="header-content"><div class="container"><div class="row align-items-center"><div class="col-lg-7"><div class="text-container"><h1 class="h1-large">${escapeHtml(resume.name || 'Your Name')}</h1>${resume.title ? `<p class="p-heading">${escapeHtml(resume.title)}</p>` : ''}${resume.summary ? `<div class="text-light mb-4">${joinLines(resume.summary)}</div>` : ''}${action ? `<a class="btn-solid-lg" href="${escapeHtml(action)}"${externalLinkAttributes(action)}>Contact me</a>` : '<a class="btn-solid-lg" href="#projects">Explore work</a>'}</div></div><div class="col-lg-5 text-center">${photo ? `<div class="profile-portrait">${photo}</div>` : ''}</div></div></div></div></header>

  <section id="about" class="basic-1"><div class="container"><div class="row"><div class="col-lg-5"><div class="text-container"><h2>About</h2>${contact.location ? `<p class="time"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(contact.location)}</p>` : ''}</div></div><div class="col-lg-7"><div class="text-container">${resume.summary ? joinLines(resume.summary) : ''}${skills.length ? `<div class="mt-4">${skills.map((skill) => `<span class="skill-line">${escapeHtml(skill)}</span>`).join('')}</div>` : ''}</div></div></div></div></section>

  ${(experience.length || education.length) ? `<section id="experience" class="basic-2"><div class="container"><h2 class="h2-heading">Experience and education</h2><p class="p-heading">The work behind the practice.</p><div class="row">${experience.map((item) => `<div class="col-lg-6"><article class="text-box"><i class="fas fa-briefcase"></i><h4>${escapeHtml(item.role)}</h4><p class="time">${escapeHtml(item.organization)} · ${escapeHtml(item.dates)}</p>${item.description ? `<div>${joinLines(item.description)}</div>` : ''}</article></div>`).join('')}${education.map((item) => `<div class="col-lg-6"><article class="text-box"><i class="fas fa-graduation-cap"></i><h4>${escapeHtml(item.degree)}</h4><p class="time">${escapeHtml(item.institution)} · ${escapeHtml(item.dates)}</p>${item.details ? `<div>${joinLines(item.details)}</div>` : ''}</article></div>`).join('')}</div></div></section>` : ''}

  ${resume.projects?.length ? `<section id="projects" class="basic-3"><div class="container"><h2 class="h2-heading">Selected work</h2><p class="p-heading">A few projects I’m proud of.</p><div class="row">${workItems(resume.projects)}</div></div></section>` : ''}

  <section id="contact" class="form-1"><div class="container"><h2 class="h2-heading">Let’s make something memorable.</h2><p class="p-heading">${contact.email ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : ''}${contact.email && contact.phone ? ' · ' : ''}${contact.phone ? `<a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a>` : ''}${(contact.email || contact.phone) && contact.website && safeUrl(contact.website) ? ' · ' : ''}${contact.website && safeUrl(contact.website) ? `<a href="${escapeHtml(safeUrl(contact.website))}"${externalLinkAttributes(safeUrl(contact.website))}>${escapeHtml(contact.website)}</a>` : ''}</p></div></section>
  <footer class="footer"><div class="container"><div class="row"><div class="col-lg-12"><div class="footer-col last"><p class="text-center text-light">© ${new Date().getFullYear()} ${escapeHtml(resume.name || 'Portfolio')}</p></div></div></div></footer>
  <script src="js/jquery.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/jquery.easing.min.js"></script>
  <script src="js/scripts.js"></script>
</body>
</html>`;
}
