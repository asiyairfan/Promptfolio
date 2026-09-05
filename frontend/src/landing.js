import { el } from './dom.js';

const STEPS = [
  { number: '1', title: 'Upload', description: 'Get started effortlessly by uploading your resume as a PDF file or simply pasting your plain text directly into the designated area. The system quickly captures your professional history, setting the stage for a seamless review and optimization process.' },
  { number: '2', title: 'Review', description: 'Take a close look at the extracted details and effortlessly refine any sections the AI parser might have missed. This gives you full control to ensure every piece of your professional background is accurately represented before moving forward.' },
  { number: '3', title: 'Style', description: 'Personalize the visual presentation of your materials by selecting from a versatile range of 9 unique presets and 3 distinct layouts. Tailor the final design to match your personal aesthetic or professional brand standards with just a few clicks.' },
  { number: '4', title: 'Publish', description: 'Bring everything together by signing in to deploy a live, production-ready page in an instant. This final step takes your finished work online so you can easily share your professional presence with the world.' },
];

// Placeholder previews for the "Pick a template" picker. Swap for real screenshots.
const TEMPLATES = [
  { id: 'aurora', name: 'Aurora', img: '/src/styles/assets/port6.png' },
  { id: 'monolith', name: 'Monolith', img: '/src/styles/assets/port2.png' },
  { id: 'ledger', name: 'Ledger', img: '/src/styles/assets/port4.png' },
  { id: 'atlas', name: 'Atlas', img: '/src/styles/assets/port5.png' },

];

// Decorative hero collage cards. Positions are percentages of the hero section.
const HERO_CARDS = [
  { id: 'mark', img: '/src/styles/assets/port1.png', left: 12, top: 20, rotate: -8, width: 128, ratio: '4 / 5', z: 2 },
  { id: 'folio', img: '/src/styles/assets/port2.png', left: 84, top: 16, rotate: 9, width: 150, ratio: '1 / 1', z: 1 },
  { id: 'evans', img: '/src/styles/assets/port5.png', left: 8, top: 80, rotate: 6, width: 118, ratio: '3 / 4', z: 1 },
  { id: 'patrix', img: '/src/styles/assets/port4.png', left: 88, top: 76, rotate: -11, width: 142, ratio: '5 / 4', z: 2 },
  { id: 'iportfolio', img: '/src/styles/assets/port3.png', left: 50, top: 92, rotate: 4, width: 132, ratio: '4 / 3', z: 1 },
];

export function renderLanding(state, dispatch) {
  const root = el('div', { class: 'landing-page' }, [
    renderAmbientBackground(),
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
    renderHero(state, dispatch),
    renderHowItWorks(),
    renderTemplateShowcase(state, dispatch),
    renderFooter(),
  ]);

  // Runs after this tree is mounted. If your app mounts asynchronously,
  // call these yourself right after append instead of relying on this rAF.
  requestAnimationFrame(() => {
    setupScrollReveal(root);
    setupHeroSpiral(root);
    setupTemplateCardEntrance(root);
  });

  return root;
}

function renderAmbientBackground() {
  return el('div', { class: 'ambient-bg', 'aria-hidden': 'true' }, [
    el('span', { class: 'ambient-blob ambient-blob--a' }),
    el('span', { class: 'ambient-blob ambient-blob--b' }),
    el('span', { class: 'ambient-blob ambient-blob--c' }),
  ]);
}

function renderHero(state, dispatch) {
  return el('section', { class: 'hero-section' }, [
    el('div', { class: 'hero-collage' }, HERO_CARDS.map(renderHeroCard)),
    el('div', { class: 'hero-content' }, [
      el('h1', {}, 'Turn your resume into a polished portfolio site'),
      el('p', { class: 'hero-lead' }, 'Upload a PDF or paste your resume, review the AI-extracted details, pick a distinctive look, and publish. All in minutes.'),
      el('div', { class: 'hero-actions' }, [
        el('button', { class: 'btn btn-primary btn-lg', onclick: () => dispatch({ type: 'startBuilder' }) }, 'Build now'),
        state.user
          ? null
          : el('button', { class: 'btn btn-secondary btn-lg', onclick: () => dispatch({ type: 'setView', payload: 'auth' }) }, 'Sign in'),
      ]),
    ]),
  ]);
}

function renderHeroCard(card) {
  return el('div', {
    class: 'hero-card',
    'data-rotate': String(card.rotate),
    style: `--card-w:${card.width}px; --rotate:${card.rotate}deg; left:${card.left}%; top:${card.top}%; aspect-ratio:${card.ratio}; z-index:${card.z};`,
  }, [
    el('img', { src: card.img, alt: `${card.id} template preview`, loading: 'lazy' }),
  ]);
}

// Wraps each word in its own clipped span so it can slide up independently,
// staggered via the --i custom property. Used for section headings.
function renderAnimatedHeading(text, tag = 'h2') {
  const words = text.split(' ');
  return el(
    tag,
    { class: 'reveal-heading' },
    words.map((word, i) =>
      el('span', { class: 'reveal-word', style: `--i:${i}` }, [
        el('span', { class: 'reveal-word-inner' }, word),
      ])
    )
  );
}

function renderHowItWorks() {
  return el('section', { class: 'features-section' }, [
    renderAnimatedHeading('How it works'),
    ...STEPS.map((step, index) => renderStepSection(step, index)),
  ]);
}

function renderStepSection(step, index) {
  const reversed = index % 2 === 1;
  return el('div', { class: reversed ? 'step-section step-section--reverse' : 'step-section' }, [
    el('div', { class: 'step-section-inner' }, [
      el('div', { class: 'step-text' }, [
        el('span', { class: 'step-badge' }, step.number),
        el('h3', {}, step.title),
        el('p', {}, step.description),
      ]),
      el('div', { class: 'step-visual' }, [
        el('span', { class: 'step-visual-mark' }, '✦'),
      ]),
    ]),
  ]);
}

function renderTemplateShowcase(state, dispatch) {
  const selectedId = state.selectedTemplate ?? null;

  return el('section', { class: 'template-showcase' }, [
    renderAnimatedHeading('Pick a template'),
    el(
      'div',
      { class: 'template-select-row' },
      TEMPLATES.map((template) => renderTemplateCard(template, selectedId, dispatch))
    ),
  ]);
}

function renderTemplateCard(template, selectedId, dispatch) {
  const isSelected = template.id === selectedId;
  return el(
    'button',
    {
      class: isSelected ? 'template-select-card is-selected' : 'template-select-card',
      type: 'button',
      'aria-pressed': String(isSelected),
      onclick: () => dispatch({ type: 'selectTemplate', payload: template.id }),
    },
    [
      el('img', { src: template.img, alt: `${template.name} template preview` }),
      el('span', { class: 'template-select-name' }, template.name),
    ]
  );
}

function renderFooter() {
  return el('footer', { class: 'site-footer' }, [
    el('div', { class: 'site-footer-grid' }, [
      el('div', { class: 'site-footer-brand' }, [
        el('div', { class: 'brand' }, [
          el('span', { class: 'brand-mark' }, '✦'),
          el('span', { class: 'brand-title' }, 'AI Portfolio Builder'),
        ]),
        el('p', { class: 'site-footer-tagline' }, 'Turn a resume into a polished, published portfolio site in minutes.'),
      ]),
      el('div', {}, [
        el('h3', { class: 'site-footer-heading' }, 'Product'),
        el('ul', { class: 'site-footer-links' }, [
          el('li', {}, [el('a', { href: '#' }, 'How it works')]),
          el('li', {}, [el('a', { href: '#' }, 'Templates')]),
          el('li', {}, [el('a', { href: '#' }, 'Pricing')]),
        ]),
      ]),
      el('div', {}, [
        el('h3', { class: 'site-footer-heading' }, 'Project'),
        el('ul', { class: 'site-footer-links' }, [
          el('li', {}, [el('a', { href: '#' }, 'About the hackathon')]),
          el('li', {}, [el('a', { href: '#' }, 'Team')]),
          el('li', {}, [el('a', { href: '#' }, 'Contact')]),
        ]),
      ]),
    ]),
    el('div', { class: 'site-footer-bottom' }, [
      el('span', {}, '© 2026 AI Portfolio Builder. All rights reserved.'),
      el('span', {}, 'Built for the AI hackathon.'),
    ]),
  ]);
}

function setupScrollReveal(root) {
  const targets = root.querySelectorAll('.step-section, .template-showcase, .reveal-heading');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    targets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );

  targets.forEach((target) => observer.observe(target));
}

function setupHeroSpiral(root) {
  const cards = root.querySelectorAll('.hero-card');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    cards.forEach((card) => card.classList.add('is-settled'));
    return;
  }

  cards.forEach((card, index) => {
    const finalRotate = parseFloat(card.dataset.rotate) || 0;
    const keyframes = buildSpiralKeyframes(finalRotate, index);
    const animation = card.animate(keyframes, {
      duration: 1050,
      delay: index * 120,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards',
    });
    animation.onfinish = () => {
      card.classList.add('is-settled');
      animation.cancel();
    };
  });
}

function buildSpiralKeyframes(finalRotateDeg, seed) {
  const direction = seed % 2 === 0 ? 1 : -1;
  const baseAngle = (seed * 53) % 360;
  const maxRadius = 90 + (seed % 4) * 22;
  const totalTurns = 1.75 + (seed % 3) * 0.35;
  const steps = 8;
  const frames = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const radiusEase = 1 - Math.pow(1 - t, 3);
    const radius = maxRadius * (1 - radiusEase);
    const angleDeg = baseAngle + direction * totalTurns * 360 * (1 - t);
    const angleRad = (angleDeg * Math.PI) / 180;
    const dx = radius * Math.cos(angleRad);
    const dy = radius * Math.sin(angleRad);
    const extraSpin = direction * 220 * (1 - t);
    const scale = 0.35 + 0.65 * t;
    const opacity = Math.min(1, t / 0.4);

    frames.push({
      transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) rotate(${(finalRotateDeg + extraSpin).toFixed(1)}deg) scale(${scale.toFixed(3)})`,
      opacity: opacity.toFixed(2),
      offset: t,
    });
  }

  return frames;
}

// Fires once the template picker scrolls into view, then pops each
// card in with a stagger, powered by the Web Animations API rather
// than a CSS transition/animation, so hover interactions afterward
// stay fully independent of the entrance timing.
function setupTemplateCardEntrance(root) {
  const showcase = root.querySelector('.template-showcase');
  if (!showcase) return;
  const cards = showcase.querySelectorAll('.template-select-card');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        cards.forEach((card, index) => {
          const animation = card.animate(buildCardEnterKeyframes(), {
            duration: 520,
            delay: index * 90,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            fill: 'forwards',
          });
          animation.onfinish = () => {
            card.classList.add('is-visible');
            animation.cancel();
          };
        });
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(showcase);
}

function buildCardEnterKeyframes() {
  return [
    { opacity: 0, transform: 'translateY(28px) scale(0.92)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' },
  ];
}