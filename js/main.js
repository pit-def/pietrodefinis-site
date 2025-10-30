const mobileQuery = window.matchMedia('(max-width: 840px)');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const NAV_TEMPLATE = `
  <header class="navbar" data-navbar-root>
    <div class="container nav-inner">
      <div class="brand">
        <span class="dot"></span>
        <a href="/" class="brand-link">Pietro De Finis</a>
        <span class="role">Project Catalyst</span>
      </div>
      <nav class="navlinks" aria-label="Primary">
        <a href="/resume">Resume</a>
        <a href="/projects">Projects</a>
        <a href="/contact">Contact</a>
      </nav>
      <button class="hamburger" aria-label="Open menu" aria-controls="mobile-drawer" aria-expanded="false">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div id="backdrop" class="backdrop" hidden></div>
    <aside id="mobile-drawer" class="drawer" aria-hidden="true">
      <div class="drawer-inner">
        <div class="drawer-top">
        <div class="drawer-brand">
          <span class="dot"></span>
          <a href="/" class="brand-link">Pietro De Finis</a>
          <span class="role">Project Catalyst</span>
        </div>
          <button class="drawer-close" aria-label="Close menu">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <nav class="drawer-nav" aria-label="Mobile">
          <a href="/resume">Resume</a>
          <a href="/projects">Projects</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </aside>
  </header>
`;

const FOOTER_TEMPLATE = `
  <footer class="footer footer--dark">
    <div class="container footer__wrap">
      <nav class="footer__social" aria-label="Social links">
        <a class="social" href="https://instagram.com/pit.def" target="_blank" rel="noopener" aria-label="Instagram">
          <img src="/assets/img/icons/instagram.svg" alt="" width="24" height="24">
        </a>
        <a class="social" href="https://www.linkedin.com/in/pietro-de-finis-explorer/" target="_blank" rel="noopener" aria-label="LinkedIn">
          <img src="/assets/img/icons/linkedin.svg" alt="" width="24" height="24">
        </a>
        <a class="social" href="https://www.facebook.com/profile.php?id=61580486282690" target="_blank" rel="noopener" aria-label="Facebook">
          <img src="/assets/img/icons/facebook.svg" alt="" width="24" height="24">
        </a>
        <a class="social" href="https://explore.pietrodefinis.com" target="_blank" rel="noopener" aria-label="Personal site">
          <img src="/assets/img/icons/compass.svg" alt="" width="24" height="24">
        </a>
      </nav>
      <blockquote class="footer__quote">
        "In life everything is possible. The only limit is your imagination (and physics laws)."
      </blockquote>
      <div class="footer__contact">
        <a id="contact-email" class="footer__email" href="#" rel="nofollow">[email protected]</a>
      </div>
      <div class="footer__legal">
        Copyright 2025 Pietro De Finis. All rights reserved. Images, videos and content on this site remain property of their respective owners. I do not claim ownership unless stated.
      </div>
    </div>
  </footer>
`;

function cleanCurrentUrl(){
  if (!window.history || typeof window.history.replaceState !== 'function') return;

  const { pathname, search, hash } = window.location;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const trimmed = pathname.replace(/\/+$/, '');
    if (trimmed && trimmed !== pathname) {
      window.history.replaceState(null, '', `${trimmed}${search}${hash}`);
    }
  }
}

cleanCurrentUrl();

function normalizePath(path){
  if (!path || path.startsWith('#')) return null;
  try {
    const url = new URL(path, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    const trimmed = url.pathname.replace(/\/+$/, '');
    return trimmed === '' ? '/' : trimmed;
  } catch (err) {
    return null;
  }
}

function markActiveLinks(scope){
  if (!scope) return;
  const current = normalizePath(window.location.pathname) || '/';
  scope.querySelectorAll('a[href]').forEach(link => {
    const target = normalizePath(link.getAttribute('href'));
    if (!target) {
      link.removeAttribute('aria-current');
      return;
    }
    if (target === current || (target !== '/' && current.startsWith(target + '/'))) {
      link.setAttribute('aria-current','page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function setupNavigation(host){
  const navRoot = host.querySelector('[data-navbar-root]') || host;
  if (navRoot.dataset.navReady === 'true') return;

  const btn = navRoot.querySelector('.hamburger');
  const drawer = navRoot.querySelector('#mobile-drawer');
  const backdrop = navRoot.querySelector('#backdrop');
  const closeBtn = navRoot.querySelector('.drawer-close');
  if (!btn || !drawer || !backdrop) return;

  const isMobileNav = () => mobileQuery.matches;

  const open = () => {
    if (!isMobileNav()) return;
    const scrollArea = drawer.querySelector('.drawer-inner') || drawer;
    drawer.classList.add('is-open');
    backdrop.hidden = false;
    requestAnimationFrame(()=> backdrop.classList.add('is-open'));
    btn.setAttribute('aria-expanded','true');
    drawer.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
    scrollArea.scrollTop = 0;
    const firstLink = drawer.querySelector('a');
    firstLink && firstLink.focus({preventScroll:true});
  };

  const close = () => {
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    btn.setAttribute('aria-expanded','false');
    drawer.setAttribute('aria-hidden','true');
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
    setTimeout(()=> { backdrop.hidden = true; }, 200);
    if (document.activeElement && drawer.contains(document.activeElement)) {
      btn.focus({preventScroll:true});
    }
  };

  btn.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  drawer.addEventListener('click', e => {
    if (e.target.closest('a')) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
  });

  const syncNavMode = () => {
    if (!isMobileNav()) close();
  };

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', syncNavMode);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(syncNavMode);
  }

  markActiveLinks(navRoot);
  markActiveLinks(navRoot.querySelector('.drawer-nav'));
  navRoot.dataset.navReady = 'true';
}

function loadNavbar(){
  const host = document.querySelector('[data-navbar]');
  if (!host) return Promise.resolve();

  return fetch('/partials/navbar.html')
    .then(res => (res.ok ? res.text() : Promise.reject()))
    .then(html => {
      host.innerHTML = html || NAV_TEMPLATE;
      setupNavigation(host);
    })
    .catch(() => {
      host.innerHTML = NAV_TEMPLATE;
      setupNavigation(host);
    });
}

function hydrateFooterEmail(scope = document){
  const el = scope.querySelector('#contact-email');
  if (!el) return;
  const user = 'pietrodefinis';
  const domain = 'gmail.com';
  const addr = `${user}@${domain}`;
  el.href = `mailto:${addr}`;
  el.textContent = addr;
}

function loadFooter(){
  const footerHost = document.querySelector('[data-footer]');
  if (!footerHost) {
    hydrateFooterEmail();
    return;
  }

  fetch('/partials/footer.html')
    .then(res => (res.ok ? res.text() : Promise.reject()))
    .then(html => {
      footerHost.innerHTML = html || FOOTER_TEMPLATE;
      hydrateFooterEmail(footerHost);
    })
    .catch(() => {
      footerHost.innerHTML = FOOTER_TEMPLATE;
      hydrateFooterEmail(footerHost);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadNavbar();
  loadFooter();
  setupProjectCards();
});

function getToggleLabelTarget(btn){
  return btn?.querySelector('.btn__label') || btn;
}

function setToggleState(btn, expanded){
  if (!btn) return;
  const target = getToggleLabelTarget(btn);
  const label = expanded
    ? btn.dataset.labelClose || 'Hide details'
    : btn.dataset.labelOpen || 'Read more';
  target.textContent = label;
  btn.setAttribute('aria-expanded', String(expanded));
}

function collapseProjectCard(card){
  if (!card) return;
  const details = card.querySelector('.project-card__details');
  if (!details) return;

  const btn = card.querySelector('.js-toggle');
  const currentHeight = details.scrollHeight;

  details.style.maxHeight = currentHeight + 'px';
  requestAnimationFrame(() => {
    details.style.maxHeight = '0px';
  });

  const handleTransitionEnd = (event) => {
    if (event.target !== details || event.propertyName !== 'max-height') return;
    details.hidden = true;
    details.style.maxHeight = '';
    details.removeEventListener('transitionend', handleTransitionEnd);
  };

  details.addEventListener('transitionend', handleTransitionEnd);

  card.classList.remove('is-open');
  setToggleState(btn, false);
}

function expandProjectCard(card, btn){
  if (!card) return;
  const details = card.querySelector('.project-card__details');
  if (!details) return;

  document.querySelectorAll('.project-card.is-open').forEach(other => {
    if (other !== card) collapseProjectCard(other);
  });

  if (details.hasAttribute('hidden')) details.removeAttribute('hidden');

  details.style.maxHeight = '0px';
  card.classList.add('is-open');
  requestAnimationFrame(() => {
    const contentHeight = details.scrollHeight;
    details.style.maxHeight = contentHeight + 'px';
  });

  setToggleState(btn, true);

  if (reduceMotionQuery.matches) {
    const top = card.getBoundingClientRect().top + window.pageYOffset - 24;
    window.scrollTo({ top, behavior: 'auto' });
  } else {
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }, 140);
  }
}

function setupProjectCards(){
  document.querySelectorAll('.project-card__details').forEach(details => {
    if (!details.id) {
      const card = details.closest('.project-card');
      if (card) {
        details.id = `${card.id || 'project'}-details`;
      }
    }
  });

  document.addEventListener('click', handleProjectToggleClick);
}

function handleProjectToggleClick(event){
  const btn = event.target.closest('.js-toggle');
  if (!btn) return;

  const card = btn.closest('.project-card');
  if (!card) return;

  const isOpen = card.classList.contains('is-open');
  if (isOpen) {
    collapseProjectCard(card);
  } else {
    expandProjectCard(card, btn);
  }
}

window.addEventListener('resize', () => {
  document.querySelectorAll('.project-card.is-open .project-card__details').forEach(details => {
    details.style.maxHeight = details.scrollHeight + 'px';
  });
});
