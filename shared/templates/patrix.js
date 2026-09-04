import { avatarHtml, contactLink, escapeHtml, externalLinkAttributes, joinLines, safeImageUrl, safeUrl } from '../html-helpers.js';

function baseTag(baseHref) {
  return baseHref ? `<base href="${escapeHtml(baseHref)}">` : '';
}

function projectCards(projects) {
  return (projects || []).map((project, index) => {
    const image = safeImageUrl(project.imageUrl);
    const link = safeUrl(project.link);
    const title = escapeHtml(project.name || `Project ${index + 1}`);
    return `<div class="col-md-6 col-lg-4"><div class="portfolio-box shadow">${image ? `<img src="${escapeHtml(image)}" alt="${title}" loading="lazy">` : `<div class="portfolio-placeholder">${String(index + 1).padStart(2, '0')}</div>`}<div class="portfolio-info"><div class="caption"><h4>${title}</h4>${project.description ? `<p>${escapeHtml(project.description)}</p>` : ''}${link ? `<a href="${escapeHtml(link)}"${externalLinkAttributes(link)}><i class="fas fa-link"></i></a>` : ''}</div></div></div></div>`;
  }).join('');
}

export function renderPatrix(resume, { baseHref = '' } = {}) {
  const contact = resume.contact || {};
  const photo = avatarHtml(contact.avatarUrl, 'img-fluid rounded-circle', resume.name || 'Portfolio portrait');
  const action = contactLink(contact);
  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${baseTag(baseHref)}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(resume.name || 'Portfolio')} — ${escapeHtml(resume.title || '')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/fontawesome.css">
  <link rel="stylesheet" href="assets/vendors/glightbox/css/glightbox.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <style>.portfolio-placeholder{height:100%;display:grid;place-items:center;background:#e9d8fd;color:#9926f0;font-size:3rem;font-weight:700}.intro-portrait{width:100%;max-width:420px;aspect-ratio:1;object-fit:cover;border:8px solid rgba(255,255,255,.2)}.experience-copy{max-width:44rem}.skill-list span{display:inline-block;margin:.3rem;padding:.45rem .8rem;border-radius:999px;background:#f3e8ff;color:#6b21a8}.portfolio-info a{color:#fff;font-size:1.4rem}</style>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark menu shadow fixed-top"><div class="container"><a class="navbar-brand" href="#home">${escapeHtml(resume.name || 'Portfolio')}</a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#patrix-nav" aria-controls="patrix-nav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="patrix-nav"><ul class="navbar-nav ms-auto"><li class="nav-item"><a class="nav-link" href="#about">About</a></li>${experience.length || education.length ? '<li class="nav-item"><a class="nav-link" href="#background">Background</a></li>' : ''}${resume.projects?.length ? '<li class="nav-item"><a class="nav-link" href="#work">Work</a></li>' : ''}<li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li></ul></div></div></nav>

  <main>
    <section id="home" class="intro-section"><div class="container"><div class="row align-items-center text-white intros"><div class="col-md-6"><h1 class="display-2"><span class="display-2--intro">${escapeHtml(resume.name || 'Your Name')}</span>${resume.title ? `<span class="display-2--description lh-base">${escapeHtml(resume.title)}</span>` : ''}</h1>${resume.summary ? `<div class="lead lh-lg">${joinLines(resume.summary)}</div>` : ''}${action ? `<a class="rounded-pill btn-rounded" href="${escapeHtml(action)}"${externalLinkAttributes(action)}>Get in touch <span><i class="fas fa-arrow-right"></i></span></a>` : '<a class="rounded-pill btn-rounded" href="#work">See my work <span><i class="fas fa-arrow-right"></i></span></a>'}</div><div class="col-md-6 text-center mt-5 mt-md-0">${photo ? `<div class="video-box"><div class="intro-portrait overflow-hidden rounded-circle mx-auto">${photo}</div></div>` : `<div class="display-1 fw-bold">${escapeHtml((resume.name || 'P').charAt(0))}</div>`}</div></div></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#fff" fill-opacity="1" d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,202.7C672,213,768,235,864,229.3C960,224,1056,192,1152,176C1248,160,1344,160,1392,160L1440,160L1440,320L0,320Z"></path></svg></section>

    <section id="about" class="services"><div class="container"><div class="row align-items-center"><div class="col-lg-6"><div class="services__content"><div class="icon d-block fas fa-user-circle"></div><h2 class="display-3--title mt-1">About me</h2>${resume.summary ? `<div class="experience-copy">${joinLines(resume.summary)}</div>` : ''}${contact.location ? `<p class="mt-3"><i class="fas fa-map-marker-alt me-2"></i>${escapeHtml(contact.location)}</p>` : ''}${skills.length ? `<div class="skill-list mt-3">${skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join('')}</div>` : ''}</div></div><div class="col-lg-6 text-center">${photo ? `<div class="services__pic">${photo}</div>` : ''}</div></div></div></section>

    ${(experience.length || education.length) ? `<section id="background" class="services"><div class="container"><div class="row"><div class="col-lg-5"><h2 class="display-3--title">Background</h2></div><div class="col-lg-7">${experience.map((item) => `<article class="services__content border-bottom"><div class="icon fas fa-briefcase"></div><h3>${escapeHtml(item.role)}</h3><p class="mb-1 fw-bold">${escapeHtml(item.organization)}</p><p class="text-muted">${escapeHtml(item.dates)}</p>${item.description ? `<div>${joinLines(item.description)}</div>` : ''}</article>`).join('')}${education.map((item) => `<article class="services__content border-bottom"><div class="icon fas fa-graduation-cap"></div><h3>${escapeHtml(item.degree)}</h3><p class="mb-1 fw-bold">${escapeHtml(item.institution)}</p><p class="text-muted">${escapeHtml(item.dates)}</p>${item.details ? `<div>${joinLines(item.details)}</div>` : ''}</article>`).join('')}</div></div></div></section>` : ''}

    ${resume.projects?.length ? `<section id="work" class="portfolio"><div class="container"><div class="row text-center"><h2 class="display-3 fw-bold">Recent work</h2><div class="heading-line mb-5"></div></div><div class="row">${projectCards(resume.projects)}</div></div></section>` : ''}

    <section id="contact" class="get-started"><div class="container"><div class="row text-center"><h2 class="display-3 fw-bold">Let’s build something together.</h2><div class="heading-line mb-5"></div></div><div class="row justify-content-center"><div class="col-lg-8 gradient shadow rounded-3"><div class="cta-info text-white text-center"><h4 class="display-3--title text-white">Start a conversation</h4><ul class="cta-info__list">${contact.email ? `<li><a class="text-white" href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></li>` : ''}${contact.phone ? `<li><a class="text-white" href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a></li>` : ''}${contact.website && safeUrl(contact.website) ? `<li><a class="text-white" href="${escapeHtml(safeUrl(contact.website))}"${externalLinkAttributes(safeUrl(contact.website))}>${escapeHtml(contact.website)}</a></li>` : ''}</ul></div></div></div></div></section>
  </main>
  <footer class="footer"><div class="container"><div class="row"><div class="col-md-4"><div class="contact-box d-flex">${contact.email ? `<i class="contact-box__icon fas fa-envelope"></i><div class="contact-box__info"><a class="contact-box__info--title" href="mailto:${escapeHtml(contact.email)}">Email</a></div>` : ''}</div></div><div class="col-md-4 text-center footer-sm">${contact.website && safeUrl(contact.website) ? `<a href="${escapeHtml(safeUrl(contact.website))}"${externalLinkAttributes(safeUrl(contact.website))}><i class="fas fa-globe"></i></a>` : ''}</div><div class="col-md-4 text-md-end"><div class="contact-box d-flex justify-content-md-end">${contact.phone ? `<i class="contact-box__icon fas fa-phone"></i><div class="contact-box__info"><a class="contact-box__info--title" href="tel:${escapeHtml(contact.phone)}">Call</a></div>` : ''}</div></div></div></div><div class="footer-bottom py-3"><div class="container"><div class="row text-center text-white"><div class="col-12 footer-bottom__copyright">© ${new Date().getFullYear()} ${escapeHtml(resume.name || 'Portfolio')}</div></div></div></div></footer>
  <script src="assets/js/bootstrap.bundle.min.js"></script>
  <script src="assets/vendors/glightbox/js/glightbox.min.js"></script>
</body>
</html>`;
}
