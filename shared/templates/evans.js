import { avatarHtml, contactLink, escapeHtml, externalLinkAttributes, joinLines, safeImageUrl, safeUrl } from '../html-helpers.js';

function baseTag(baseHref) {
  return baseHref ? `<base href="${escapeHtml(baseHref)}">` : '';
}

function projectCards(projects) {
  return (projects || []).map((project, index) => {
    const image = safeImageUrl(project.imageUrl);
    const link = safeUrl(project.link);
    const title = escapeHtml(project.name || `Project ${index + 1}`);
    return `<div class="col-md-6 col-lg-4 ftco-animate"><article class="project-card">${image ? `<img src="${escapeHtml(image)}" class="img-fluid" alt="${title}" loading="lazy">` : `<div class="project-placeholder"><span class="icon-briefcase"></span></div>`}<div class="project-card__content"><h3>${link ? `<a href="${escapeHtml(link)}"${externalLinkAttributes(link)}>${title}</a>` : title}</h3>${project.description ? `<p>${escapeHtml(project.description)}</p>` : ''}</div></article></div>`;
  }).join('');
}

export function renderEvans(resume, { baseHref = '' } = {}) {
  const contact = resume.contact || {};
  const profileImage = avatarHtml(contact.avatarUrl, 'img-fluid rounded-circle', resume.name || 'Portfolio portrait');
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
  <link href="https://fonts.googleapis.com/css?family=Barlow+Condensed:400,500,600,700|Lora:400,500,600,700|Poppins:300,400,500,600,700" rel="stylesheet">
  <link rel="stylesheet" href="css/open-iconic-bootstrap.min.css">
  <link rel="stylesheet" href="css/animate.css">
  <link rel="stylesheet" href="css/owl.carousel.min.css">
  <link rel="stylesheet" href="css/owl.theme.default.min.css">
  <link rel="stylesheet" href="css/magnific-popup.css">
  <link rel="stylesheet" href="css/aos.css">
  <link rel="stylesheet" href="css/ionicons.min.css">
  <link rel="stylesheet" href="css/icomoon.css">
  <link rel="stylesheet" href="css/flaticon.css">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <link rel="stylesheet" href="css/style.css">
  <style>.hero-copy{color:#fff}.hero-copy h1,.hero-copy h2{color:#fff}.hero-copy .lead{color:#fdcb6e}.hero-portrait{width:min(330px,78vw);aspect-ratio:1;object-fit:cover;border:10px solid rgba(255,255,255,.12)}.project-card{height:100%;background:#fff;box-shadow:0 12px 28px rgba(0,0,0,.08)}.project-card img,.project-placeholder{width:100%;height:230px;object-fit:cover}.project-placeholder{display:grid;place-items:center;background:#f3f3f3;color:#fdcb6e;font-size:3rem}.project-card__content{padding:1.5rem}.project-card__content h3{font-size:1.25rem}.skill-pill{display:inline-block;margin:.25rem .35rem .25rem 0;padding:.35rem .75rem;border:1px solid #fdcb6e;border-radius:999px}.timeline-entry{padding:1.5rem 0;border-top:1px solid #eee}.timeline-entry h3{font-size:1.25rem}.footer-contact a{color:#fff}.footer-contact a:hover{color:#fdcb6e}</style>
</head>
<body data-spy="scroll" data-target="#ftco-nav" data-offset="300">
  <nav class="navbar navbar-expand-lg navbar-dark ftco_navbar bg-dark ftco-navbar-light" id="ftco-navbar"><div class="container"><a class="navbar-brand" href="#home">${escapeHtml(resume.name || 'Portfolio')}</a><button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#ftco-nav" aria-controls="ftco-nav" aria-expanded="false" aria-label="Toggle navigation"><span class="oi oi-menu"></span> Menu</button><div class="collapse navbar-collapse" id="ftco-nav"><ul class="navbar-nav ml-auto"><li class="nav-item active"><a href="#home" class="nav-link">Home</a></li><li class="nav-item"><a href="#about" class="nav-link">About</a></li>${experience.length || education.length ? '<li class="nav-item"><a href="#background" class="nav-link">Background</a></li>' : ''}${resume.projects?.length ? '<li class="nav-item"><a href="#work" class="nav-link">Work</a></li>' : ''}<li class="nav-item"><a href="#contact" class="nav-link">Contact</a></li></ul></div></div></nav>

  <section id="home" class="home-slider owl-carousel"><div class="slider-item" style="background:#111"><div class="overlay"></div><div class="container"><div class="row slider-text align-items-center justify-content-center"><div class="col-md-7 text-center hero-copy"><p class="lead">Portfolio</p><h1>${escapeHtml(resume.name || 'Your Name')}</h1>${resume.title ? `<h2 class="mb-4">${escapeHtml(resume.title)}</h2>` : ''}${resume.summary ? `<div class="mb-4">${joinLines(resume.summary)}</div>` : ''}${action ? `<a class="btn btn-primary px-4 py-3" href="${escapeHtml(action)}"${externalLinkAttributes(action)}>Get in touch</a>` : '<a class="btn btn-primary px-4 py-3" href="#work">View my work</a>'}</div><div class="col-md-4 text-center mt-4 mt-md-0">${profileImage ? `<div class="hero-portrait overflow-hidden rounded-circle mx-auto">${profileImage}</div>` : ''}</div></div></div></div></section>

  <section id="about" class="ftco-section"><div class="container"><div class="row justify-content-center"><div class="col-md-10"><span class="subheading text-primary">About me</span><h2 class="mb-4">Building work that matters.</h2>${resume.summary ? `<div>${joinLines(resume.summary)}</div>` : ''}${contact.location ? `<p class="mt-3"><span class="icon-map-marker text-primary mr-2"></span>${escapeHtml(contact.location)}</p>` : ''}${skills.length ? `<div class="mt-4">${skills.map((skill) => `<span class="skill-pill">${escapeHtml(skill)}</span>`).join('')}</div>` : ''}</div></div></div></section>

  ${(experience.length || education.length) ? `<section id="background" class="ftco-section bg-light"><div class="container"><div class="row justify-content-center pb-4"><div class="col-md-10 heading-section"><span class="subheading text-primary">My background</span><h2>Experience and education</h2></div></div><div class="row">${experience.length ? `<div class="col-lg-6"><h3 class="mb-4">Experience</h3>${experience.map((item) => `<article class="timeline-entry"><p class="text-primary mb-1">${escapeHtml(item.dates)}</p><h3>${escapeHtml(item.role)}</h3><p class="font-weight-bold">${escapeHtml(item.organization)}</p>${item.description ? `<div>${joinLines(item.description)}</div>` : ''}</article>`).join('')}</div>` : ''}${education.length ? `<div class="col-lg-6"><h3 class="mb-4">Education</h3>${education.map((item) => `<article class="timeline-entry"><p class="text-primary mb-1">${escapeHtml(item.dates)}</p><h3>${escapeHtml(item.degree)}</h3><p class="font-weight-bold">${escapeHtml(item.institution)}</p>${item.details ? `<div>${joinLines(item.details)}</div>` : ''}</article>`).join('')}</div>` : ''}</div></div></section>` : ''}

  ${resume.projects?.length ? `<section id="work" class="ftco-section"><div class="container"><div class="row justify-content-center pb-4"><div class="col-md-10 heading-section"><span class="subheading text-primary">Selected projects</span><h2>My work</h2></div></div><div class="row">${projectCards(resume.projects)}</div></div></section>` : ''}

  <footer id="contact" class="ftco-footer ftco-section"><div class="container"><div class="row"><div class="col-md-8"><div class="ftco-footer-widget"><h2 class="ftco-heading-2">Let’s work together.</h2><p>Start a conversation when you’re ready.</p></div></div><div class="col-md-4 footer-contact">${contact.email ? `<p><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>` : ''}${contact.phone ? `<p><a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a></p>` : ''}${contact.website && safeUrl(contact.website) ? `<p><a href="${escapeHtml(safeUrl(contact.website))}"${externalLinkAttributes(safeUrl(contact.website))}>${escapeHtml(contact.website)}</a></p>` : ''}</div></div><div class="row mt-5"><div class="col-md-12 text-center"><p>© ${new Date().getFullYear()} ${escapeHtml(resume.name || 'Portfolio')}</p></div></div></div></footer>
  <script src="js/jquery.min.js"></script>
  <script src="js/popper.min.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/jquery.easing.1.3.js"></script>
  <script src="js/jquery.waypoints.min.js"></script>
  <script src="js/jquery.stellar.min.js"></script>
  <script src="js/owl.carousel.min.js"></script>
  <script src="js/jquery.magnific-popup.min.js"></script>
  <script src="js/aos.js"></script>
  <script src="js/jquery.animateNumber.min.js"></script>
  <script src="js/scrollax.min.js"></script>
  <script src="js/main.js"></script>
</body>
</html>`;
}
