// script.js - full behaviors: SPA switcher, burger dropdown, carousel, form AJAX, ripples, improved scroll-to-top
(function () {
  /* ========== Page switcher ========== */
  function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (!page) return;
    page.classList.add('active');

    // update nav active state
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const link = Array.from(document.querySelectorAll('.nav-links a')).find(a => {
      return a.getAttribute('onclick') && a.getAttribute('onclick').includes(`'${pageId}'`);
    });
    if (link) link.classList.add('active');

    // move footer to active page
    const footer = document.getElementById('footer');
    if (footer && page) page.appendChild(footer);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.showPage = showPage;

  /* ========== DOMContentLoaded ========== */
  document.addEventListener('DOMContentLoaded', () => {
    // initial footer placement
    const footer = document.getElementById('footer');
    const home = document.getElementById('home');
    if (home && footer) home.appendChild(footer);

    // logo behaviour
    const logoBtn = document.getElementById('logoBtn');
    if (logoBtn) {
      logoBtn.addEventListener('click', () => showPage('home'));
      logoBtn.addEventListener('keypress', (e) => { if (e.key === 'Enter') showPage('home'); });
    }

    // Instagram CTAs
    document.querySelectorAll('#ctaContact, #instaBtn, #mobileInstaBtn').forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://instagram.com/business_web_studio1', '_blank', 'noopener');
      });
    });

    /* ========== Scroll to top improvements ========== */
    const scrollBtn = document.getElementById('scrollTopBtn');
    const mobileBar = document.getElementById('mobileSendBar');

    function updateScrollBtnPosition() {
      if (!scrollBtn) return;
      const baseBottom = 22;
      let extra = 0;
      if (mobileBar && mobileBar.classList.contains('visible')) {
        const rect = mobileBar.getBoundingClientRect();
        if (rect && rect.height) extra = rect.height + 12;
      }
      scrollBtn.style.bottom = (baseBottom + extra) + 'px';
    }

    function onScrollVisibility() {
      if (!scrollBtn) return;
      if (window.scrollY > 250) {
        scrollBtn.classList.add('visible');
        scrollBtn.classList.remove('hidden');
        scrollBtn.setAttribute('aria-hidden', 'false');
      } else {
        scrollBtn.classList.remove('visible');
        scrollBtn.classList.add('hidden');
        scrollBtn.setAttribute('aria-hidden', 'true');
      }
      updateScrollBtnPosition();
    }

    window.addEventListener('scroll', onScrollVisibility, { passive: true });
    window.addEventListener('resize', updateScrollBtnPosition);

    if (scrollBtn) {
      onScrollVisibility();
      scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollBtn.classList.remove('visible');
        scrollBtn.classList.add('hidden');
      });
    }

    if (mobileBar) {
      const obs = new MutationObserver(() => updateScrollBtnPosition());
      obs.observe(mobileBar, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    /* ========== Parallax shapes ========== */
    const shapes = document.querySelectorAll('.shape');
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      shapes.forEach((shape, i) => {
        const speed = (i + 1) * 6;
        shape.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(var(--start-rotation,0deg))`;
      });
    });

    /* ========== Ripple effect ========== */
    document.querySelectorAll('.glass').forEach(el => {
      el.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:rgba(255,255,255,0.18);border-radius:50%;transform:scale(0);pointer-events:none;z-index:9999;animation:ripple 0.6s linear;`;
        el.style.position = el.style.position || 'relative';
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `@keyframes ripple{to{transform:scale(3);opacity:0}}`;
      document.head.appendChild(style);
    }

    /* ========== Mobile dropdown (burger) ========== */
    const burger = document.getElementById('burgerBtn');
    const dropdown = document.getElementById('mobileMenuDropdown');

    function openDropdown() {
      if (!dropdown) return;
      dropdown.classList.add('open');
      dropdown.setAttribute('aria-hidden', 'false');
      if (burger) burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    }
    function closeDropdown() {
      if (!dropdown) return;
      dropdown.classList.remove('open');
      dropdown.setAttribute('aria-hidden', 'true');
      if (burger) burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
    function toggleDropdown() {
      if (!dropdown) return;
      if (dropdown.classList.contains('open')) closeDropdown();
      else openDropdown();
    }

    if (burger && dropdown) {
      closeDropdown();
      burger.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(); });
      dropdown.addEventListener('click', (e) => {
        const btn = e.target.closest('.m-btn');
        if (!btn) return;
        const target = btn.dataset.target;
        if (target) showPage(target);
        closeDropdown();
      });
      document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !burger.contains(e.target)) closeDropdown();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDropdown(); });
      window.addEventListener('resize', () => { if (window.innerWidth > 768) closeDropdown(); });
    }

    /* ========== Carousel initialization ========== */
    (function initCarousel() {
      const carousel = document.getElementById('portfolioCarousel');
      if (!carousel) return;

      const track = carousel.querySelector('.carousel-track');
      const slides = Array.from(track.children);
      const prevBtn = carousel.querySelector('.carousel-prev');
      const nextBtn = carousel.querySelector('.carousel-next');
      const dotsContainer = document.getElementById('carouselDots');

      let index = 0;
      const slideCount = slides.length;
      let autoplay = true;
      let autoplayInterval = 4000;
      let autoplayTimer = null;
      let isInteracting = false;

      // build dots
      dotsContainer.innerHTML = '';
      slides.forEach((s, i) => {
        const b = document.createElement('button');
        b.className = i === 0 ? 'active' : '';
        b.setAttribute('aria-label', `Go to image ${i + 1}`);
        b.setAttribute('role', 'tab');
        b.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(b);
      });
      const dots = Array.from(dotsContainer.children);

      function update() {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
        // set accessible attributes
        slides.forEach((s, i) => s.setAttribute('aria-hidden', i === index ? 'false' : 'true'));
      }

      function goTo(i) {
        index = (i + slideCount) % slideCount;
        update();
        resetAutoplay();
      }
      function next() { goTo(index + 1); }
      function prev() { goTo(index - 1); }

      if (nextBtn) nextBtn.addEventListener('click', next);
      if (prevBtn) prevBtn.addEventListener('click', prev);

      // keyboard navigation
      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      });

      // swipe support
      let startX = 0, deltaX = 0, isDown = false;
      track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDown = true;
        isInteracting = true;
      }, { passive: true });
      track.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        deltaX = e.touches[0].clientX - startX;
      }, { passive: true });
      track.addEventListener('touchend', () => {
        isDown = false;
        isInteracting = false;
        if (Math.abs(deltaX) > 50) {
          if (deltaX < 0) next();
          else prev();
        }
        deltaX = 0;
      });

      // mouse drag (desktop)
      let mouseStart = 0;
      track.addEventListener('mousedown', (e) => {
        mouseStart = e.clientX;
        isDown = true;
        isInteracting = true;
        track.classList.add('dragging');
      });
      window.addEventListener('mouseup', (e) => {
        if (!isDown) return;
        isDown = false;
        isInteracting = false;
        track.classList.remove('dragging');
        const diff = e.clientX - mouseStart;
        if (Math.abs(diff) > 100) {
          if (diff < 0) next();
          else prev();
        }
      });

      // autoplay
      function startAutoplay() {
        if (!autoplay) return;
        stopAutoplay();
        autoplayTimer = setInterval(() => {
          if (!isInteracting) next();
        }, autoplayInterval);
      }
      function stopAutoplay() {
        if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
      }
      function resetAutoplay() { stopAutoplay(); startAutoplay(); }

      // pause on hover/focus
      carousel.addEventListener('mouseenter', () => { isInteracting = true; stopAutoplay(); });
      carousel.addEventListener('mouseleave', () => { isInteracting = false; startAutoplay(); });
      carousel.addEventListener('focusin', () => { isInteracting = true; stopAutoplay(); });
      carousel.addEventListener('focusout', () => { isInteracting = false; startAutoplay(); });

      // init
      update();
      startAutoplay();

      // expose simple API if needed
      carousel.carouselGoTo = goTo;
      carousel.carouselNext = next;
      carousel.carouselPrev = prev;
    })();

    /* ========== Contact form (AJAX) ========== */
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;
        const prevText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
        const data = new FormData(form);
        try {
          const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
          if (res.ok) {
            showFloatingMessage('Message sent! I will reply as soon as possible.', 'success');
            form.reset();
          } else {
            showFloatingMessage('Oops—there was a problem submitting the form. Try DMing on Instagram.', 'error');
          }
        } catch (err) {
          showFloatingMessage('Network error. Try again or DM on Instagram.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = prevText || 'Send message';
        }
      });
    }

    /* ========== Floating message helper ========== */
    function showFloatingMessage(text, type = 'info') {
      const msg = document.createElement('div');
      msg.className = 'floating-msg ' + type;
      msg.innerHTML = text;
      Object.assign(msg.style, {
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '14px 22px',
        background: type === 'success' ? 'linear-gradient(90deg,#2ecc71,#27ae60)' : 'linear-gradient(90deg,#f59e0b,#ea580c)',
        color: '#fff',
        borderRadius: '12px',
        zIndex: 12000,
        boxShadow: '0 10px 40px rgba(0,0,0,0.35)'
      });
      document.body.appendChild(msg);
      setTimeout(() => msg.style.opacity = '0', 2400);
      setTimeout(() => msg.remove(), 2800);
    }
  });
})();
