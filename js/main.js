/* ============================================================
   The Unplug Collective — js/main.js
   Portfolio-style main script: basic stars fallback,
   IntersectionObserver, smooth scroll, highlight current page.
   ============================================================ */

(function () {
  'use strict';

  /* ── Basic star fallback (cursor-effects.js will reinit) ── */
  function createStars() {
    var container = document.querySelector('.stars-container');
    if (!container) return;

    var count = 100;
    for (var i = 0; i < count; i++) {
      var star = document.createElement('div');
      star.classList.add('star');

      var size = Math.random() * 3 + 1;
      star.style.cssText = [
        'width:'  + size + 'px',
        'height:' + size + 'px',
        'left:'   + Math.random() * 100 + '%',
        'top:'    + Math.random() * 100 + '%',
        'background: #f1c40f',
        'opacity:' + (Math.random() * 0.7 + 0.3),
        'animation-delay:' + Math.random() * 3 + 's',
        'animation-duration:' + (Math.random() * 3 + 2) + 's'
      ].join(';');

      container.appendChild(star);
    }
  }

  /* ── IntersectionObserver for .section-entry & .fade-in ── */
  function initIntersectionObserver() {
    var targets = document.querySelectorAll('.section-entry, .fade-in');
    if (!targets.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              entry.target.style.animationPlayState = 'running';
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );

      targets.forEach(function (el) {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
      });
    } else {
      // Fallback: show everything immediately
      targets.forEach(function (el) {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.animationPlayState = 'running';
      });
    }
  }

  /* ── Smooth scroll for anchor links ──────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Highlight current page nav link ─────────────────────── */
  function highlightCurrentPage() {
    var path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      // Exact match on filename portion
      var linkFile = href.split('#')[0].split('/').pop();
      var pageName = path.split('/').pop() || 'index.html';
      if (linkFile && linkFile !== '' && pageName.indexOf(linkFile) !== -1) {
        link.style.background = 'rgba(255,255,255,0.2)';
        link.style.color = '#ffffff';
      }
    });
  }

  /* ── Navbar glass effect on scroll ───────────────────────── */
  function initNavbarScroll() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        navbar.style.background = 'rgba(44, 62, 80, 0.95)';
        navbar.style.boxShadow  = '0 4px 20px rgba(0,0,0,0.4)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
        navbar.style.boxShadow  = '0 4px 15px rgba(0,0,0,0.2)';
      }
    }, { passive: true });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init() {
    createStars();
    initIntersectionObserver();
    initSmoothScroll();
    highlightCurrentPage();
    initNavbarScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
