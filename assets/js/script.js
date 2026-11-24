/**
 * Tasnim Farhan Fahim — Developer Portfolio
 * Vanilla JavaScript (ES6+)
 * 
 * Strict Vanilla implementation:
 * - Three-Option Theme Management (Light, Dark, Barça)
 * - Persistent Theme via localStorage with smooth image switching
 * - Theme-dependent Hero Profile Photo swap (zero flicker with cache preloading)
 * - Sticky Header with backdrop elevation
 * - Mobile Navigation Drawer with accessible ARIA management & outside click
 * - Active Section Scrollspy
 * - Resume PDF Modal Viewer with download integration & ESC key handling
 * - Video Autoplay & IntersectionObserver optimization
 * - Clipboard Copy for Email & Social handles with Toast feedback
 * - Floating Back to Top Button
 * - Subtle Scroll Reveal animations
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Theme Configuration & Hero Photo Mapping
  // =========================================================================
  const STORAGE_KEY = 'tasnim_portfolio_theme';
  const VALID_THEMES = ['light', 'dark', 'barca'];

  // Exact theme-dependent hero photographs mapped from assets/images
  const THEME_PHOTO_MAP = {
    light: 'assets/images/Hero_Light_Mode.png',
    dark: 'assets/images/Hero_Dark_Mode.png',
    barca: 'assets/images/Hero_Barca_Mode.png'
  };

  const THEME_DISPLAY_NAMES = {
    light: 'Light Theme',
    dark: 'Dark Theme',
    barca: 'Barça Theme'
  };

  // Preload all 3 images in the background so switching is instantaneous
  const preloadedImages = {};
  Object.keys(THEME_PHOTO_MAP).forEach(function (key) {
    const img = new Image();
    img.src = THEME_PHOTO_MAP[key];
    preloadedImages[key] = img;
  });

  const heroPhotoImg = document.getElementById('hero-profile-photo');
  const heroThemeIndicator = document.getElementById('hero-theme-name');
  const themeButtons = document.querySelectorAll('[data-theme-value]');

  /**
   * Determine preferred initial theme:
   * 1. Check localStorage for user preference
   * 2. Fall back to system color scheme (dark or light)
   */
  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_THEMES.includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('localStorage access failed:', e);
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Apply selected theme:
   * - Set data-theme on html root element
   * - Update theme selector button active states and aria-checked
   * - Switch hero profile image smoothly with subtle fade
   * - Update meta theme-color for mobile browsers
   */
  function applyTheme(theme, isInitialLoad) {
    if (!VALID_THEMES.includes(theme)) {
      theme = 'light';
    }

    document.documentElement.setAttribute('data-theme', theme);

    // Update buttons in both desktop and mobile headers
    themeButtons.forEach(function (btn) {
      const val = btn.getAttribute('data-theme-value');
      const isActive = val === theme;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Update Hero Photograph
    if (heroPhotoImg) {
      const targetSrc = THEME_PHOTO_MAP[theme];
      if (isInitialLoad) {
        heroPhotoImg.src = targetSrc;
      } else {
        // Soft crossfade to prevent image popping
        heroPhotoImg.classList.add('is-transitioning');
        setTimeout(function () {
          heroPhotoImg.src = targetSrc;
          heroPhotoImg.onload = function () {
            heroPhotoImg.classList.remove('is-transitioning');
          };
          // Fallback removal if image was cached already
          setTimeout(function () {
            heroPhotoImg.classList.remove('is-transitioning');
          }, 150);
        }, 80);
      }
    }

    // Update Hero Tag Badge
    if (heroThemeIndicator) {
      heroThemeIndicator.textContent = THEME_DISPLAY_NAMES[theme];
    }

    // Update browser theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: '#FAF9F6',
        dark: '#0F1115',
        barca: '#1D1F22'
      };
      metaThemeColor.setAttribute('content', colors[theme] || '#FAF9F6');
    }
  }

  // Set initial theme immediately
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme, true);

  // Bind clicks for all theme buttons (desktop & mobile)
  themeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const selectedTheme = btn.getAttribute('data-theme-value');
      if (selectedTheme) {
        applyTheme(selectedTheme, false);
        try {
          localStorage.setItem(STORAGE_KEY, selectedTheme);
        } catch (e) {
          console.warn('Unable to persist theme to localStorage:', e);
        }
      }
    });
  });

  // Listen for OS theme changes only if user hasn't chosen an explicit override
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      } catch (err) {}
    });
  }

  // =========================================================================
  // 2. Sticky Header Elevation
  // =========================================================================
  const siteHeader = document.querySelector('.site-header');
  function handleHeaderScroll() {
    if (!siteHeader) return;
    if (window.scrollY > 20) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // =========================================================================
  // 3. Mobile Navigation Drawer
  // =========================================================================
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavLinks = mobileNavDrawer ? mobileNavDrawer.querySelectorAll('.nav-link') : [];

  function openMobileNav() {
    if (!mobileNavDrawer || !mobileNavToggle) return;
    mobileNavDrawer.classList.add('is-open');
    mobileNavToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileNavDrawer || !mobileNavToggle) return;
    mobileNavDrawer.classList.remove('is-open');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', openMobileNav);
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  // Close when clicking outside drawer panel (on the backdrop overlay)
  if (mobileNavDrawer) {
    mobileNavDrawer.addEventListener('click', function (e) {
      if (e.target === mobileNavDrawer) {
        closeMobileNav();
      }
    });
  }

  // Close when clicking any nav link inside mobile drawer
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileNav();
    });
  });

  // =========================================================================
  // 4. Active Section Scrollspy
  // =========================================================================
  const trackedSections = document.querySelectorAll('section[id]');
  const allNavLinks = document.querySelectorAll('.desktop-nav .nav-link, .mobile-nav-links .nav-link');

  function updateScrollspy() {
    const scrollPos = window.scrollY + 140;
    let currentId = '';

    trackedSections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    allNavLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === '#' + currentId || (!currentId && href === '#home')) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }

  window.addEventListener('scroll', updateScrollspy, { passive: true });
  updateScrollspy();

  // =========================================================================
  // 5. Resume PDF Modal Viewer
  // =========================================================================
  const resumeModal = document.getElementById('resume-modal');
  const resumeOpenBtns = document.querySelectorAll('.js-open-resume');
  const resumeCloseBtn = document.getElementById('resume-modal-close');

  function openResumeModal(e) {
    if (e) e.preventDefault();
    if (!resumeModal) return;
    resumeModal.classList.add('is-active');
    resumeModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (resumeCloseBtn) {
      resumeCloseBtn.focus();
    }
  }

  function closeResumeModal() {
    if (!resumeModal) return;
    resumeModal.classList.remove('is-active');
    setTimeout(function () {
      resumeModal.setAttribute('hidden', '');
    }, 250);
    document.body.style.overflow = '';
  }

  resumeOpenBtns.forEach(function (btn) {
    btn.addEventListener('click', openResumeModal);
  });

  if (resumeCloseBtn) {
    resumeCloseBtn.addEventListener('click', closeResumeModal);
  }

  if (resumeModal) {
    resumeModal.addEventListener('click', function (e) {
      if (e.target === resumeModal) {
        closeResumeModal();
      }
    });
  }

  // Keyboard accessibility: Escape key closes both mobile nav and resume modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (resumeModal && resumeModal.classList.contains('is-active')) {
        closeResumeModal();
      }
      if (mobileNavDrawer && mobileNavDrawer.classList.contains('is-open')) {
        closeMobileNav();
      }
    }
  });

  // =========================================================================
  // 6. Project Video Autoplay & IntersectionObserver Optimization
  // =========================================================================
  const projectVideos = document.querySelectorAll('video');

  projectVideos.forEach(function (video) {
    // Enforce required muted attributes to ensure browser autoplay
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('loop', '');
    video.removeAttribute('controls');

    // Attempt initial muted play
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        // Autoplay may be delayed until scrolled into view
      });
    }
  });

  // IntersectionObserver to pause off-screen videos and play when visible
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const vid = entry.target;
          if (entry.isIntersecting) {
            vid.play().catch(function () {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    projectVideos.forEach(function (video) {
      videoObserver.observe(video);
    });
  }

  // =========================================================================
  // 7. Clipboard Copy with Feedback Toast
  // =========================================================================
  const toastNotification = document.getElementById('toast-notification');
  const toastText = toastNotification ? toastNotification.querySelector('.toast-text') : null;
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotification || !toastText) return;
    toastText.textContent = message;
    toastNotification.classList.add('is-visible');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toastNotification.classList.remove('is-visible');
    }, 3200);
  }

  function fallbackCopyText(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMessage);
    } catch (err) {
      showToast('Could not copy automatically.');
    }
    document.body.removeChild(textArea);
  }

  function copyTextToClipboard(text, successMessage, triggerButton) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          showToast(successMessage);
          if (triggerButton) {
            animateCopyButton(triggerButton);
          }
        },
        function () {
          fallbackCopyText(text, successMessage);
        }
      );
    } else {
      fallbackCopyText(text, successMessage);
    }
  }

  function animateCopyButton(button) {
    const icon = button.querySelector('i');
    if (!icon) return;
    const originalClass = icon.className;
    icon.className = 'fa-solid fa-check';
    button.style.color = '#10B981';
    setTimeout(function () {
      icon.className = originalClass;
      button.style.color = '';
    }, 1800);
  }

  // Bind all copy buttons
  const copyButtons = document.querySelectorAll('[data-copy-value]');
  copyButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      const val = button.getAttribute('data-copy-value');
      const label = button.getAttribute('data-copy-label') || 'Copied to clipboard!';
      if (val) {
        copyTextToClipboard(val, label, button);
      }
    });
  });

  // =========================================================================
  // 8. Floating Back to Top Button
  // =========================================================================
  const backToTopBtn = document.getElementById('back-to-top');

  function handleBackToTopVisibility() {
    if (!backToTopBtn) return;
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });
  handleBackToTopVisibility();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  // =========================================================================
  // 9. Scroll Reveal Animations (IntersectionObserver)
  // =========================================================================
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // If reduced motion is preferred, reveal all elements immediately
    document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  // =========================================================================
  // 10. Dynamic Copyright Year
  // =========================================================================
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
})();
