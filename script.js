/* ═══════════════════════════════════════════════
   MALHAWI PORTFOLIO — script.js
   ═══════════════════════════════════════════════ */

/* ── Nav scroll shadow ────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Mobile menu toggle ───────────────────────── */
const toggle   = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

/* ── Reveal on scroll ─────────────────────────── */
const revealTargets = document.querySelectorAll(
  '.info-card, .skill-group, .contact-card, .section-title, ' +
  '.section-sub, .about-text, .hero-content, .filter-bar, ' +
  '.spotlight-card, .skills-category-title, .results-count'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  }),
  { threshold: 0.08 }
);
revealTargets.forEach(el => revealObs.observe(el));

/* ── Project cards: staggered reveal ─────────── */
function revealCard(card) {
  card.classList.add('reveal');
  setTimeout(() => {
    const cardObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); cardObs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    cardObs.observe(card);
  }, 20);
}

/* ── State ────────────────────────────────────── */
const projectCards = document.querySelectorAll('.project-card');
const countEl      = document.getElementById('resultsCount');
const emptyState   = document.getElementById('emptyState');
const footer       = document.getElementById('projectsFooter');
const expandBtn    = document.getElementById('expandBtn');
const resetBtn     = document.getElementById('resetFilters');

let activeCat   = 'all';
let activeLang  = 'all';
let isExpanded  = false;
let isFiltering = false;   // true when any filter != 'all'

/* ── Core render logic ────────────────────────── */
function applyFilters() {
  isFiltering = (activeCat !== 'all' || activeLang !== 'all');

  let visible = 0;

  projectCards.forEach(card => {
    const cats     = card.dataset.cat      || '';
    const langs    = card.dataset.lang     || '';
    const featured = card.dataset.featured === 'true';

    const catMatch  = activeCat  === 'all' || cats.includes(activeCat);
    const langMatch = activeLang === 'all' || langs.includes(activeLang);
    const passes    = catMatch && langMatch;

    // Visibility rules:
    //  - filtering active  → show all that match the filter
    //  - no filter, expanded → show all
    //  - no filter, collapsed → show only featured
    const show = passes && (isFiltering || isExpanded || featured);

    if (show) {
      if (card.classList.contains('hidden')) {
        card.classList.remove('hidden');
        revealCard(card);
      }
      visible++;
    } else {
      card.classList.add('hidden');
      card.classList.remove('visible', 'reveal');
    }
  });

  /* Count label */
  const total = projectCards.length;
  if (!isFiltering && !isExpanded) {
    countEl.textContent = `Showing ${visible} highlighted projects`;
  } else {
    countEl.textContent = `${visible} of ${total} projects`;
  }

  /* Show-more button vs empty state */
  const secondaryCount = [...projectCards].filter(c => c.dataset.featured === 'false').length;

  if (visible === 0) {
    emptyState.style.display = 'block';
    footer.style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    // Only show expand button when no filter is active and not yet expanded
    footer.style.display = (!isFiltering && !isExpanded) ? 'block' : 'none';
    expandBtn.textContent = `Show all ${secondaryCount} more projects ↓`;
  }
}

/* ── Expand button ────────────────────────────── */
expandBtn.addEventListener('click', () => {
  isExpanded = true;
  applyFilters();

  // Smooth scroll so user sees the newly added cards
  setTimeout(() => {
    const firstHidden = document.querySelector('.project-card[data-featured="false"]:not(.hidden)');
    if (firstHidden) firstHidden.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
});

/* ── Category filter ──────────────────────────── */
document.querySelectorAll('#catTabs .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#catTabs .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    applyFilters();
  });
});

/* ── Language filter ──────────────────────────── */
document.querySelectorAll('#langTabs .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#langTabs .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeLang = btn.dataset.lang;
    applyFilters();
  });
});

/* ── Reset ────────────────────────────────────── */
resetBtn.addEventListener('click', () => {
  document.querySelectorAll('#catTabs .filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === 'all'));
  document.querySelectorAll('#langTabs .filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === 'all'));
  activeCat  = 'all';
  activeLang = 'all';
  isExpanded = false;
  applyFilters();
});

/* ── Init ─────────────────────────────────────── */
applyFilters();

/* ── Contact form — Web3Forms ─────────────────── */
const contactForm  = document.getElementById('contactForm');
const formSubmit   = document.getElementById('formSubmit');
const formSuccess  = document.getElementById('formSuccess');
const formError    = document.getElementById('formError');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    formSubmit.disabled = true;
    formSubmit.textContent = 'Sending…';
    formSuccess.classList.remove('visible');
    formError.classList.remove('visible');

    const data = new FormData(contactForm);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      });
      const json = await res.json();

      if (json.success) {
        formSuccess.classList.add('visible');
        contactForm.reset();
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      formError.classList.add('visible');
      console.error(err);
    } finally {
      formSubmit.disabled = false;
      formSubmit.textContent = 'Send message →';
    }
  });
}

/* ── Active nav highlight on scroll ──────────── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${e.target.id}` ? 'var(--text)' : '';
      });
    }
  }),
  { rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach(s => sectionObs.observe(s));
