import { avatarHtml, escapeHtml, externalLinkAttributes, joinLines, safeImageUrl, safeUrl } from '../html-helpers.js';

function baseTag(baseHref) {
  return baseHref ? `<base href="${escapeHtml(baseHref)}">` : '';
}

function skillBars(skills) {
  return (skills || []).map((skill, index) => {
    const value = Math.max(65, 95 - index * 5);
    return `<div class="progress"><span class="skill"><span>${escapeHtml(skill)}</span> <i class="val">${value}%</i></span><div class="progress-bar-wrap"><div class="progress-bar" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"></div></div></div>`;
  }).join('');
}

function portfolioItems(projects) {
  return (projects || []).map((project, index) => {
    const image = safeImageUrl(project.imageUrl);
    const link = safeUrl(project.link);
    const title = escapeHtml(project.name || `Project ${index + 1}`);
    return `<div class="col-lg-4 col-md-6 portfolio-item isotope-item" data-aos="fade-up" data-aos-delay="${index % 3 * 100}"><div class="portfolio-content h-100">${image ? `<img src="${escapeHtml(image)}" class="img-fluid" alt="${title}" loading="lazy">` : `<div class="portfolio-placeholder d-flex align-items-center justify-content-center">${String(index + 1).padStart(2, '0')}</div>`}<div class="portfolio-info"><h4>${title}</h4>${project.description ? `<p>${escapeHtml(project.description)}</p>` : ''}${link ? `<a href="${escapeHtml(link)}" class="details-link" title="View ${title}"${externalLinkAttributes(link)}><i class="bi bi-link-45deg"></i></a>` : ''}</div></div></div>`;
  }).join('');
}

export function renderIPortfolio(resume, { baseHref = '' } = {}) {
  const contact = resume.contact || {};
  const photo = avatarHtml(contact.avatarUrl, 'img-fluid rounded-circle', resume.name || 'Portfolio portrait');
  const heroImage = safeImageUrl(contact.avatarUrl);
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
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/vendor/aos/aos.css">
  <link rel="stylesheet" href="assets/vendor/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/vendor/bootstrap-icons/bootstrap-icons.css">
  <link rel="stylesheet" href="assets/vendor/glightbox/css/glightbox.min.css">
  <link rel="stylesheet" href="assets/vendor/swiper/swiper-bundle.min.css">
  <link rel="stylesheet" href="assets/css/main.css">
  <style>.portfolio-placeholder{min-height:260px;background:color-mix(in srgb,var(--accent-color),transparent 85%);color:var(--accent-color);font-size:3rem;font-weight:700}.header .profile-img .profile-placeholder{width:120px;height:120px;margin:15px auto;border:8px solid color-mix(in srgb,var(--default-color),transparent 85%);border-radius:50%;display:grid;place-items:center;background:var(--accent-color);color:var(--contrast-color);font-size:2.5rem}.hero-no-image{background:var(--background-color)}</style>
</head>
<body class="index-page">
  <header id="header" class="header dark-background d-flex flex-column">
    <i class="header-toggle d-xl-none bi bi-list"></i>
    <div class="profile-img">${photo || `<div class="profile-placeholder">${escapeHtml((resume.name || 'I').charAt(0))}</div>`}</div>
    <a href="#hero" class="logo d-flex align-items-center justify-content-center"><h1 class="sitename">${escapeHtml(resume.name || 'Portfolio')}</h1></a>
    ${resume.title ? `<p class="text-center mb-3">${escapeHtml(resume.title)}</p>` : ''}
    <div class="social-links text-center">${contact.website && safeUrl(contact.website) ? `<a href="${escapeHtml(safeUrl(contact.website))}"${externalLinkAttributes(safeUrl(contact.website))}><i class="bi bi-globe2"></i></a>` : ''}${contact.email ? `<a href="mailto:${escapeHtml(contact.email)}"><i class="bi bi-envelope"></i></a>` : ''}${contact.phone ? `<a href="tel:${escapeHtml(contact.phone)}"><i class="bi bi-telephone"></i></a>` : ''}</div>
    <nav id="navmenu" class="navmenu"><ul><li><a href="#hero" class="active"><i class="bi bi-house navicon"></i><span>Home</span></a></li><li><a href="#about"><i class="bi bi-person navicon"></i><span>About</span></a></li>${skills.length ? '<li><a href="#skills"><i class="bi bi-bar-chart navicon"></i><span>Skills</span></a></li>' : ''}${experience.length || education.length ? '<li><a href="#resume"><i class="bi bi-file-earmark-text navicon"></i><span>Resume</span></a></li>' : ''}${resume.projects?.length ? '<li><a href="#portfolio"><i class="bi bi-images navicon"></i><span>Portfolio</span></a></li>' : ''}<li><a href="#contact"><i class="bi bi-envelope navicon"></i><span>Contact</span></a></li></ul></nav>
  </header>

  <main class="main">
    <section id="hero" class="hero section dark-background">${heroImage ? `<img src="${escapeHtml(heroImage)}" alt="${escapeHtml(resume.name || 'Portfolio portrait')}" data-aos="fade-in">` : '<div class="hero-no-image"></div>'}<div class="container" data-aos="fade-up" data-aos-delay="100"><h2>${escapeHtml(resume.name || 'Your Name')}</h2><p>${escapeHtml(resume.title || 'Professional portfolio')}</p>${resume.summary ? `<div class="mt-4 col-lg-8 px-0">${joinLines(resume.summary)}</div>` : ''}</div></section>

    <section id="about" class="about section"><div class="container section-title" data-aos="fade-up"><h2>About</h2>${resume.summary ? joinLines(resume.summary) : ''}</div><div class="container" data-aos="fade-up" data-aos-delay="100"><div class="row gy-4 justify-content-center">${photo ? `<div class="col-lg-4">${photo}</div>` : ''}<div class="col-lg-${photo ? '8' : '12'} content"><h2>${escapeHtml(resume.title || 'Professional')}</h2><div class="row"><div class="col-lg-6"><ul>${contact.location ? `<li><i class="bi bi-chevron-right"></i><strong>Location:</strong><span>${escapeHtml(contact.location)}</span></li>` : ''}${contact.website && safeUrl(contact.website) ? `<li><i class="bi bi-chevron-right"></i><strong>Website:</strong><span><a href="${escapeHtml(safeUrl(contact.website))}"${externalLinkAttributes(safeUrl(contact.website))}>${escapeHtml(contact.website)}</a></span></li>` : ''}</ul></div><div class="col-lg-6"><ul>${contact.email ? `<li><i class="bi bi-chevron-right"></i><strong>Email:</strong><span><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></span></li>` : ''}${contact.phone ? `<li><i class="bi bi-chevron-right"></i><strong>Phone:</strong><span><a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a></span></li>` : ''}</ul></div></div></div></div></div></section>

    ${skills.length ? `<section id="skills" class="skills section light-background"><div class="container section-title" data-aos="fade-up"><h2>Skills</h2></div><div class="container" data-aos="fade-up" data-aos-delay="100"><div class="row skills-content skills-animation"><div class="col-lg-6">${skillBars(skills.slice(0, Math.ceil(skills.length / 2)))}</div><div class="col-lg-6">${skillBars(skills.slice(Math.ceil(skills.length / 2)))}</div></div></div></section>` : ''}

    ${(experience.length || education.length) ? `<section id="resume" class="resume section"><div class="container section-title" data-aos="fade-up"><h2>Resume</h2></div><div class="container" data-aos="fade-up" data-aos-delay="100"><div class="row">${experience.length ? `<div class="col-lg-6"><h3 class="resume-title">Experience</h3>${experience.map((item) => `<div class="resume-item"><h4>${escapeHtml(item.role)}</h4><h5>${escapeHtml(item.dates)}</h5><p><em>${escapeHtml(item.organization)}</em></p>${item.description ? `<div>${joinLines(item.description)}</div>` : ''}</div>`).join('')}</div>` : ''}${education.length ? `<div class="col-lg-6"><h3 class="resume-title">Education</h3>${education.map((item) => `<div class="resume-item"><h4>${escapeHtml(item.degree)}</h4><h5>${escapeHtml(item.dates)}</h5><p><em>${escapeHtml(item.institution)}</em></p>${item.details ? `<div>${joinLines(item.details)}</div>` : ''}</div>`).join('')}</div>` : ''}</div></div></section>` : ''}

    ${resume.projects?.length ? `<section id="portfolio" class="portfolio section light-background"><div class="container section-title" data-aos="fade-up"><h2>Portfolio</h2><p>Selected work</p></div><div class="container"><div class="isotope-layout" data-default-filter="*" data-layout="masonry" data-sort="original-order"><ul class="portfolio-filters isotope-filters" data-aos="fade-up"><li data-filter="*" class="filter-active">All</li></ul><div class="row gy-4 isotope-container" data-aos="fade-up" data-aos-delay="200">${portfolioItems(resume.projects)}</div></div></div></section>` : ''}

    <section id="contact" class="contact section"><div class="container section-title" data-aos="fade-up"><h2>Contact</h2><p>Let’s start a conversation.</p></div><div class="container" data-aos="fade-up" data-aos-delay="100"><div class="row gy-4"><div class="col-lg-7"><div class="info-wrap">${contact.location ? `<div class="info-item d-flex"><i class="bi bi-geo-alt flex-shrink-0"></i><div><h3>Location</h3><p>${escapeHtml(contact.location)}</p></div></div>` : ''}${contact.email ? `<div class="info-item d-flex"><i class="bi bi-envelope flex-shrink-0"></i><div><h3>Email</h3><p><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p></div></div>` : ''}${contact.phone ? `<div class="info-item d-flex"><i class="bi bi-telephone flex-shrink-0"></i><div><h3>Call</h3><p><a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a></p></div></div>` : ''}</div></div></div></div></section>
  </main>
  <footer id="footer" class="footer"><div class="container"><div class="copyright text-center"><p>© <span>${new Date().getFullYear()}</span> <strong class="px-1 sitename">${escapeHtml(resume.name || 'Portfolio')}</strong></p></div></div></footer>
  <a href="#" class="scroll-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>
  <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="assets/vendor/aos/aos.js"></script>
  <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
  <script src="assets/vendor/isotope-layout/isotope.pkgd.min.js"></script>
  <script src="assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"></script>
  <script src="assets/vendor/purecounter/purecounter_vanilla.js"></script>
  <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>
  <script src="assets/vendor/typed.js/typed.umd.js"></script>
  <script src="assets/vendor/waypoints/noframework.waypoints.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>`;
}
