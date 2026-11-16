import '../styles/tokens.css';
import '../styles/main.css';
import { initAntigravityBg } from './antigravity-bg';
import { FAQ_ENTRIES } from './data';
import { initLiquidDock } from './liquid-pill';
import { initMicroInteractions, triggerThemePulse } from './micro-interactions';
import { initScrambleReveals } from './scramble';
import { initScrollStages } from './scroll-stage';
import { initTeamSection } from './team-spotlight';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initPageLoader(): void {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  // Dismiss immediately after first paint so external fonts never stall LCP
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loader.classList.add('is-ready');
      loader.setAttribute('aria-hidden', 'true');
    });
  });
}

function initMobileMenu(): void {
  const toggleBtn = document.getElementById('mobile-menu-toggle') as HTMLButtonElement | null;
  const drawer = document.getElementById('mobile-nav-drawer');
  if (!toggleBtn || !drawer) return;

  const setOpen = (open: boolean, returnFocus = false) => {
    drawer.hidden = !open;
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (!open && returnFocus) {
      toggleBtn.focus();
    }
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });

  window.addEventListener(
    'resize',
    () => {
      if (window.innerWidth > 640 && toggleBtn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
      }
    },
    { passive: true }
  );
}

function initCoverScrollFade(): void {
  const coverStage = document.getElementById('cover-stage');
  if (!coverStage) return;

  let rafId = 0;

  const update = () => {
    rafId = 0;
    const vh = Math.max(480, window.innerHeight || 800);
    const isMobile = window.innerWidth <= 960;
    const fadeDistance = isMobile ? vh * 0.48 : vh * 0.65;
    const p = Math.max(0, Math.min(1, window.scrollY / fadeDistance));
    coverStage.style.setProperty('--cover-p', p.toFixed(3));
    coverStage.classList.toggle('is-faded', p >= 0.94);
  };

  const schedule = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}

function initThemeToggle(): void {
  const root = document.documentElement;
  const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]'));
  const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  const syncUi = (theme: 'light' | 'dark') => {
    root.setAttribute('data-theme', theme);
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#090D14' : '#F8FAFC');
    }
    toggles.forEach((toggle) => {
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });
    const adIframe = document.getElementById('adsterra-iframe') as HTMLIFrameElement | null;
    adIframe?.contentWindow?.postMessage({ theme }, '*');
  };

  const initial = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  syncUi(initial);

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      syncUi(next);
      triggerThemePulse(toggle, next, reducedMotion);
      try {
        localStorage.setItem('proximity-theme', next);
      } catch {
        // Ignore storage failures in restricted contexts
      }
    });
  });
}

function animateFaqOrganicStretch(
  item: HTMLElement,
  listEl: HTMLElement,
  isOpen: boolean,
  allItems: HTMLElement[],
  idx: number
): void {
  if (reducedMotion || typeof item.animate !== 'function') return;

  item.getAnimations().forEach((anim) => anim.cancel());

  if (isOpen) {
    item.animate(
      [
        { transform: 'scale(0.99, 0.972)', offset: 0 },
        { transform: 'scale(0.986, 1.046)', offset: 0.34 },
        { transform: 'scale(1.008, 0.989)', offset: 0.68 },
        { transform: 'scale(0.998, 1.004)', offset: 0.86 },
        { transform: 'scale(1, 1)', offset: 1 }
      ],
      { duration: 580, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  } else {
    item.animate(
      [
        { transform: 'scale(1, 1)', offset: 0 },
        { transform: 'scale(1.009, 0.968)', offset: 0.32 },
        { transform: 'scale(0.996, 1.012)', offset: 0.68 },
        { transform: 'scale(1, 1)', offset: 1 }
      ],
      { duration: 440, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  }

  // Click-only elastic flex across the FAQ question stack anchored near the clicked row
  if (typeof listEl.animate === 'function') {
    listEl.getAnimations().forEach((anim) => anim.cancel());
    const originPct = Math.round(((idx + 0.5) / Math.max(1, allItems.length)) * 100);
    listEl.style.transformOrigin = `50% ${originPct}%`;
    listEl.animate(
      isOpen
        ? [
            { transform: 'scale(1, 1)', offset: 0 },
            { transform: 'scale(0.997, 1.014)', offset: 0.36 },
            { transform: 'scale(1.002, 0.996)', offset: 0.74 },
            { transform: 'scale(1, 1)', offset: 1 }
          ]
        : [
            { transform: 'scale(1, 1)', offset: 0 },
            { transform: 'scale(1.002, 0.989)', offset: 0.34 },
            { transform: 'scale(0.999, 1.005)', offset: 0.72 },
            { transform: 'scale(1, 1)', offset: 1 }
          ],
      { duration: isOpen ? 520 : 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  }

  // Sympathetic organic ripple across nearby questions on click only
  const dir = isOpen ? 1 : -1;
  [
    { el: allItems[idx - 2], shift: -2 * dir, sy: isOpen ? '1.006' : '0.995' },
    { el: allItems[idx - 1], shift: -4.5 * dir, sy: isOpen ? '1.014' : '0.989' },
    { el: allItems[idx + 1], shift: 5 * dir, sy: isOpen ? '1.014' : '0.989' },
    { el: allItems[idx + 2], shift: 2.2 * dir, sy: isOpen ? '1.006' : '0.995' }
  ].forEach(({ el, shift, sy }, order) => {
    if (!el || typeof el.animate !== 'function') return;
    el.getAnimations().forEach((anim) => anim.cancel());
    el.animate(
      [
        { transform: 'translate3d(0, 0, 0) scale(1, 1)', offset: 0 },
        {
          transform: `translate3d(0, ${shift.toFixed(1)}px, 0) scale(0.996, ${sy})`,
          offset: 0.36
        },
        { transform: 'translate3d(0, 0, 0) scale(1, 1)', offset: 1 }
      ],
      {
        duration: 460 + (order === 0 || order === 3 ? 60 : 0),
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    );
  });
}

function initFaqAccordion(): void {
  const listEl = document.getElementById('faq-list');
  const searchInput = document.getElementById('faq-search') as HTMLInputElement | null;
  const statusRow = document.getElementById('faq-status-row');
  const resetBtn = document.getElementById('faq-reset');
  if (!listEl) return;

  const openQuestions = new Set<string>([FAQ_ENTRIES[0].question]);

  const render = (query: string, fromUserFilter = false) => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? FAQ_ENTRIES.filter(
          (entry) =>
            entry.question.toLowerCase().includes(q) || entry.answer.toLowerCase().includes(q)
        )
      : FAQ_ENTRIES;

    if (statusRow) {
      statusRow.hidden = q.length === 0;
    }

    if (resetBtn) {
      resetBtn.hidden = q.length === 0;
    }

    listEl.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'faq-empty';
      empty.textContent = 'No questions match that filter.';
      listEl.appendChild(empty);
      return;
    }

    const renderedItems: HTMLElement[] = [];

    filtered.forEach((entry, idx) => {
      const isOpen = openQuestions.has(entry.question);
      const item = document.createElement('div');
      item.className = isOpen ? 'faq-item is-open' : 'faq-item';
      if (fromUserFilter && !reducedMotion) {
        item.classList.add('is-entering');
        item.style.animationDelay = `${Math.min(idx * 26, 210)}ms`;
      }
      renderedItems.push(item);

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'faq-trigger';
      trigger.setAttribute('aria-expanded', String(isOpen));
      trigger.setAttribute('aria-controls', `faq-panel-${idx}`);

      const labelSpan = document.createElement('span');
      labelSpan.textContent = entry.question;

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 20 20');
      svg.setAttribute('width', '18');
      svg.setAttribute('height', '18');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.classList.add('faq-chevron');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M5 7.5l5 5 5-5');
      svg.appendChild(path);

      trigger.appendChild(labelSpan);
      trigger.appendChild(svg);

      const panel = document.createElement('div');
      panel.id = `faq-panel-${idx}`;
      panel.className = 'faq-panel';

      const inner = document.createElement('div');
      inner.className = 'faq-answer-inner';

      const p = document.createElement('p');
      p.textContent = entry.answer;
      inner.appendChild(p);
      panel.appendChild(inner);

      trigger.addEventListener('click', () => {
        const nextOpen = !item.classList.contains('is-open');
        if (nextOpen) {
          openQuestions.add(entry.question);
        } else {
          openQuestions.delete(entry.question);
        }
        item.classList.toggle('is-open', nextOpen);
        trigger.setAttribute('aria-expanded', String(nextOpen));
        animateFaqOrganicStretch(item, listEl, nextOpen, renderedItems, idx);
      });

      item.appendChild(trigger);
      item.appendChild(panel);
      listEl.appendChild(item);
    });
  };

  render('');

  const searchBox = searchInput?.closest<HTMLElement>('.faq-search-box') ?? null;

  if (searchBox && !reducedMotion) {
    searchBox.addEventListener('animationend', () => searchBox.classList.remove('is-stretching'));
  }

  searchInput?.addEventListener('input', () => {
    if (searchBox && !reducedMotion) {
      searchBox.classList.remove('is-stretching');
      void searchBox.offsetWidth;
      searchBox.classList.add('is-stretching');
    }
    render(searchInput.value, true);
  });

  resetBtn?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    render('', true);
  });
}

function initWaitlistModal(): void {
  const modal = document.getElementById('waitlist-modal') as HTMLDialogElement | null;
  const closeBtn = document.getElementById('modal-close');
  const doneBtn = document.getElementById('modal-done');
  const form = document.getElementById('waitlist-form') as HTMLFormElement | null;
  const emailInput = document.getElementById('waitlist-email') as HTMLInputElement | null;
  const carrierSelect = document.getElementById('waitlist-carrier') as HTMLSelectElement | null;
  const errorEl = document.getElementById('waitlist-error');
  const successBox = document.getElementById('waitlist-success');
  const confirmText = document.getElementById('waitlist-confirm-text');

  if (!modal || !form || !emailInput) return;

  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const openModal = () => {
    if (form && successBox) {
      form.hidden = false;
      successBox.hidden = true;
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Join Beta List';
    }
    if (errorEl) errorEl.hidden = true;
    modal.showModal();
    emailInput.focus();
  };

  document.querySelectorAll('[data-open-waitlist]').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });

  const closeModal = () => modal.close();
  closeBtn?.addEventListener('click', closeModal);
  doneBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      if (errorEl) {
        errorEl.textContent = 'Enter a valid email address to continue.';
        errorEl.hidden = false;
      }
      emailInput.focus();
      return;
    }

    if (errorEl) errorEl.hidden = true;
    const carrier = carrierSelect?.value || 'Airtel';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joining…';
    }

    const payload = new URLSearchParams({
      'form-name': 'proximity-beta-waitlist',
      email,
      carrier
    });

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload.toString()
      });
    } catch {
      // In offline or local preview, the local cache acts as a reliable fallback
    }

    try {
      localStorage.setItem('proximity-waitlist-request', JSON.stringify({ email, carrier, timestamp: Date.now() }));
    } catch {
      // Ignore storage errors in restricted contexts
    }

    if (confirmText) {
      confirmText.textContent = `Thank you for requesting early access for ${email} (${carrier}). Your request has been registered. You'll receive updates when Android test builds release, and you can track active progress on GitHub.`;
    }

    form.hidden = true;
    if (successBox) successBox.hidden = false;
  });
}

function initTermsModal(): void {
  const modal = document.getElementById('terms-modal') as HTMLDialogElement | null;
  const closeBtn = document.getElementById('terms-modal-close');
  const doneBtn = document.getElementById('terms-modal-done');
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-legal-tab]'));
  const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-legal-panel]'));
  if (!modal) return;

  const setActiveTab = (target: 'terms' | 'privacy') => {
    tabs.forEach((tab) => {
      const active = tab.dataset.legalTab === target;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.legalPanel !== target;
    });
  };

  const openLegal = (tab: 'terms' | 'privacy') => {
    setActiveTab(tab);
    modal.showModal();
    closeBtn?.focus();
  };

  const closeModal = () => modal.close();

  document.querySelectorAll('[data-open-terms]').forEach((btn) => {
    btn.addEventListener('click', () => openLegal('terms'));
  });

  document.querySelectorAll('[data-open-privacy]').forEach((btn) => {
    btn.addEventListener('click', () => openLegal('privacy'));
  });

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const next = tab.dataset.legalTab === 'privacy' ? 'privacy' : 'terms';
      setActiveTab(next);
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  doneBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function initActionAdModal(): void {
  const modal = document.getElementById('action-ad-modal') as HTMLDialogElement | null;
  if (!modal) return;

  const closeBtn = document.getElementById('action-ad-close');
  const doneBtn = document.getElementById('action-ad-done');
  const titleEl = document.getElementById('action-ad-title');
  const subtitleEl = document.getElementById('action-ad-subtitle');
  const msgEl = document.getElementById('action-ad-message');
  const fallbackEl = document.getElementById('action-ad-fallback-link') as HTMLAnchorElement | null;
  const iconWrap = document.getElementById('action-ad-icon');

  const closeModal = () => modal.close();
  closeBtn?.addEventListener('click', closeModal);
  doneBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  const downloadTriggers = document.querySelectorAll<HTMLElement>('[data-trigger-ad="download"]');
  const githubTriggers = document.querySelectorAll<HTMLElement>('[data-trigger-ad="github"]');

  downloadTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (titleEl) titleEl.textContent = 'Downloading Proximity APK';
      if (subtitleEl) subtitleEl.textContent = 'Build v1.0.0 · 15.3 MB · Android 10+';
      if (msgEl) msgEl.textContent = "Your download has started! Check your browser's download manager.";
      if (fallbackEl) {
        fallbackEl.href = 'https://github.com/ANSHUMAN23-maker/proximity/raw/main/proximity.apk';
        fallbackEl.textContent = 'Click here to download directly';
        fallbackEl.setAttribute('download', 'proximity.apk');
      }
      if (iconWrap) {
        iconWrap.innerHTML = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        `;
      }
      window.setTimeout(() => {
        try {
          if (!modal.open) {
            modal.showModal();
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const adIframe = document.getElementById('adsterra-iframe') as HTMLIFrameElement | null;
            adIframe?.contentWindow?.postMessage({ theme: currentTheme }, '*');
            window.dispatchEvent(new Event('resize'));
          }
        } catch {
          // Modal fallback
        }
      }, 120);
    });
  });

  githubTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (titleEl) titleEl.textContent = 'Opening GitHub Repository';
      if (subtitleEl) subtitleEl.textContent = 'ANSHUMAN23-maker/proximity · Source & Architecture';
      if (msgEl) msgEl.textContent = 'The Proximity GitHub repository is opening in a new tab.';
      if (fallbackEl) {
        fallbackEl.href = 'https://github.com/ANSHUMAN23-maker/proximity';
        fallbackEl.textContent = 'Click here to open GitHub';
        fallbackEl.removeAttribute('download');
      }
      if (iconWrap) {
        iconWrap.innerHTML = `
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        `;
      }
      window.setTimeout(() => {
        try {
          if (!modal.open) {
            modal.showModal();
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const adIframe = document.getElementById('adsterra-iframe') as HTMLIFrameElement | null;
            adIframe?.contentWindow?.postMessage({ theme: currentTheme }, '*');
            window.dispatchEvent(new Event('resize'));
          }
        } catch {
          // Modal fallback
        }
      }, 120);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initPageLoader();
  initCoverScrollFade();
  initAntigravityBg(reducedMotion);
  initLiquidDock(reducedMotion);
  initMicroInteractions(reducedMotion);
  initScrambleReveals(reducedMotion);
  initScrollStages(reducedMotion);
  initTeamSection(reducedMotion);
  initFaqAccordion();
  initWaitlistModal();
  initTermsModal();
  initActionAdModal();
});
