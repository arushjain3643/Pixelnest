/* ═══════════════════════════════════════════
   PIXELNEST — SCRIPT.JS
   GSAP + Lenis + VanillaTilt + Custom Logic
   ═══════════════════════════════════════════ */

/* ── GSAP Plugins ───────────────────────────── */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* ══════════════════════════════════════════════
   1. LOADER
══════════════════════════════════════════════ */
(function initLoader() {
  const loader    = document.getElementById('loader');
  const bar       = document.getElementById('loaderBar');
  const count     = document.getElementById('loaderCount');
  let progress    = 0;

  const tick = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 100) {
      progress = 100;
      clearInterval(tick);
      bar.style.width = '100%';
      count.textContent = '100';

      setTimeout(() => {
        gsap.to(loader, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            document.body.style.overflow = '';
            initHeroAnim();
          }
        });
      }, 400);
      return;
    }
    bar.style.width  = progress + '%';
    count.textContent = Math.floor(progress);
  }, 60);

  document.body.style.overflow = 'hidden';

  // Safety fallback — if GSAP or CDN loads slowly, unlock page after 5s max
  setTimeout(() => {
    if (loader && loader.style.display !== 'none') {
      loader.style.display = 'none';
      document.body.style.overflow = '';
      initHeroAnim();
    }
  }, 5000);
})();

/* ══════════════════════════════════════════════
   2. LENIS SMOOTH SCROLL
══════════════════════════════════════════════ */
// Native smooth scroll (no Lenis — browser-native is GPU accelerated and lag-free)
// GSAP ScrollTrigger synced via native scroll event
window.addEventListener('scroll', () => ScrollTrigger.update(), { passive: true });

// Anchor smooth scroll using native scrollIntoView
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════
   3. CUSTOM CURSOR
══════════════════════════════════════════════ */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
  });

  // Follower updated in unified RAF loop
  window._followerState = { follower, mx: () => mx, my: () => my, fx: 0, fy: 0 };

  const hoverEls = document.querySelectorAll('a, button, .service-card, .stat-card, .project-card, .testi-card, .why-card, .step-content, input, select, textarea');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
})();

/* ══════════════════════════════════════════════
   4. MOUSE GLOW
══════════════════════════════════════════════ */
(function initMouseGlow() {
  const glow = document.getElementById('mouseGlow');
  let tx = 0, ty = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  // Glow updated in unified RAF loop (see bottom of file)
  window._glowState = { glow, tx: () => tx, ty: () => ty, cx: 0, cy: 0 };
})();

/* ══════════════════════════════════════════════
   5. NAVBAR
══════════════════════════════════════════════ */
(function initNav() {
  const nav  = document.getElementById('nav');
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  ham.addEventListener('click', () => {
    menu.classList.toggle('open');
    const spans = ham.querySelectorAll('span');
    if (menu.classList.contains('open')) {
      gsap.to(spans[0], { rotate: 45, y: 6.5, duration: 0.3 });
      gsap.to(spans[1], { opacity: 0, duration: 0.3 });
      gsap.to(spans[2], { rotate: -45, y: -6.5, duration: 0.3 });
    } else {
      gsap.to(spans, { rotate: 0, y: 0, opacity: 1, duration: 0.3 });
    }
  });

  document.querySelectorAll('.mob-link, .mob-close').forEach(l => {
    l.addEventListener('click', () => {
      menu.classList.remove('open');
      const spans = ham.querySelectorAll('span');
      gsap.to(spans, { rotate: 0, y: 0, opacity: 1, duration: 0.3 });
    });
  });
})();

/* ══════════════════════════════════════════════
   6. HERO CANVAS PARTICLES
══════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.a  = Math.random() * 0.5 + 0.1;
      const hues = ['168,85,247', '96,165,250', '6,182,212'];
      this.c = hues[Math.floor(Math.random() * hues.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.c},${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 55; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.06 * (1 - dist/80)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();

  // Use transform for canvas position hints
  canvas.style.willChange = 'transform';
})();

/* ══════════════════════════════════════════════
   7. HERO ENTRANCE ANIMATION
══════════════════════════════════════════════ */
function initHeroAnim() {
  gsap.set('.hero-badge', { opacity: 0, y: 30 });
  gsap.set('.hero-sub',   { opacity: 0, y: 30 });
  gsap.set('.hero-btns',  { opacity: 0, y: 30 });
  gsap.set('.hero-scroll-cue', { opacity: 0, y: 20 });
  gsap.set('.reveal-line', { clipPath: 'inset(0 0 100% 0)' });

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.1 })
    .to('.reveal-line', { clipPath: 'inset(0 0 0% 0)', duration: 1, stagger: 0.15, ease: 'power4.out' }, '-=0.4')
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
    .to('.hero-btns', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
    .to('.hero-scroll-cue', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
}

/* ══════════════════════════════════════════════
   8. SCROLL REVEAL — GSAP + ScrollTrigger
══════════════════════════════════════════════ */
(function initScrollReveal() {
  // Generic reveal-up
  gsap.utils.toArray('.reveal-up').forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        delay: (i % 4) * 0.07
      }
    );
  });

  // Process line draw
  gsap.fromTo('#processLine',
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.process-timeline',
        start: 'top 65%',
        end: 'bottom 70%',
        scrub: 1,
      }
    }
  );
})();

/* ══════════════════════════════════════════════
   9. ANIMATED COUNTERS
══════════════════════════════════════════════ */
(function initCounters() {
  document.querySelectorAll('.stat-num[data-count]').forEach(el => {
    const target = +el.getAttribute('data-count');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el,
          { textContent: 0 },
          {
            textContent: target,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            onUpdate() {
              el.textContent = Math.floor(+el.textContent);
            }
          }
        );
      }
    });
  });
})();

/* ══════════════════════════════════════════════
   10. MAGNETIC BUTTONS
══════════════════════════════════════════════ */
(function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.35;
      const dy   = (e.clientY - cy) * 0.35;
      gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
})();

/* ══════════════════════════════════════════════
   11. SERVICE CARD GLOW (mouse position)
══════════════════════════════════════════════ */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

/* ══════════════════════════════════════════════
   12. VANILLA TILT
══════════════════════════════════════════════ */
if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max: 8, speed: 400, glare: true,
    'max-glare': 0.08, perspective: 1000
  });
}

/* ══════════════════════════════════════════════
   13. TESTIMONIALS SLIDER
══════════════════════════════════════════════ */
(function initTestiSlider() {
  const track  = document.getElementById('testiTrack');
  const dotsEl = document.getElementById('testiDots');
  const prev   = document.getElementById('testiPrev');
  const next   = document.getElementById('testiNext');
  if (!track) return;

  const cards  = track.querySelectorAll('.testi-card');
  let current  = 0;

  function getVisible() {
    if (window.innerWidth >= 992) return 3;
    if (window.innerWidth >= 600) return 2;
    return 1;
  }

  function totalSlides() { return cards.length - getVisible() + 1; }

  // Build dots
  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const d = document.createElement('div');
      d.className = 'testi-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goto(i));
      dotsEl.appendChild(d);
    }
  }

  function goto(idx) {
    current = Math.max(0, Math.min(idx, totalSlides() - 1));
    const cardW = cards[0].offsetWidth;
    const gap   = 24;
    gsap.to(track, {
      x: -(current * (cardW + gap)),
      duration: 0.6,
      ease: 'power3.out'
    });
    document.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prev.addEventListener('click', () => {
    if (current <= 0) {
      current = totalSlides() - 1;
      const cardW = cards[0].offsetWidth;
      const gap = 24;
      gsap.to(track, { x: -(current * (cardW + gap)), duration: 0.6, ease: 'power3.out' });
      document.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    } else {
      goto(current - 1);
    }
  });
  next.addEventListener('click', () => {
    if (current >= totalSlides() - 1) {
      current = 0;
      gsap.to(track, { x: 0, duration: 0.6, ease: 'power3.out' });
      document.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === 0));
    } else {
      goto(current + 1);
    }
  });
  window.addEventListener('resize', () => {
    // Reset transform instantly before recalculating
    gsap.set(track, { x: 0 });
    current = 0;
    buildDots();
    // Small delay so layout repaints before we measure card width
    setTimeout(() => goto(0), 50);
  });

  buildDots();

  // Auto-play with infinite loop
  setInterval(() => {
    if (current >= totalSlides() - 1) {
      // At last slide — jump back to start smoothly
      current = 0;
      gsap.to(track, { x: 0, duration: 0.6, ease: 'power3.out' });
      document.querySelectorAll('.testi-dot').forEach((d, i) => {
        d.classList.toggle('active', i === 0);
      });
    } else {
      current++;
      goto(current);
    }
  }, 5000);
})();

/* ══════════════════════════════════════════════
   14. CONTACT FORM
══════════════════════════════════════════════ */
(function initForm() {
  const form  = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  if (!form) return;

  // Form submit is now handled by EmailJS (see index.html)
  // form.addEventListener('submit', ...) removed

  // Input focus glow
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('focus', () => {
      gsap.to(el, { scale: 1.01, duration: 0.3 });
    });
    el.addEventListener('blur', () => {
      gsap.to(el, { scale: 1, duration: 0.3 });
    });
  });
})();

/* ══════════════════════════════════════════════
   15. PARALLAX HERO ORBS on scroll
══════════════════════════════════════════════ */
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: 'bottom top',
  scrub: true,
  onUpdate: self => {
    const p = self.progress;
    gsap.set('.hero-orb-1', { y: p * -80 });
    gsap.set('.hero-orb-2', { y: p * -50 });
    gsap.set('.hero-orb-3', { y: p * -30 });
  }
});

/* ══════════════════════════════════════════════
   16. SECTION TITLE GRADIENT ANIMATION
   — handled purely in CSS (no JS interval needed)
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   17. WHY CARDS — stagger on scroll
══════════════════════════════════════════════ */
ScrollTrigger.create({
  trigger: '.why-grid',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    gsap.fromTo('.why-card',
      { opacity: 0, y: 40, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }
    );
  }
});


/* ══════════════════════════════════════════════
   19. PROJECT CARDS entrance
══════════════════════════════════════════════ */
gsap.utils.toArray('.project-card').forEach((card, i) => {
  gsap.fromTo(card,
    { opacity: 0, y: 60 },
    {
      opacity: 1, y: 0, duration: 1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 82%',
        toggleActions: 'play none none none'
      },
      delay: i * 0.15
    }
  );
});

/* ══════════════════════════════════════════════
   20. ABOUT STATS entrance
══════════════════════════════════════════════ */
ScrollTrigger.create({
  trigger: '.stats-grid',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    gsap.fromTo('.stat-card',
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'back.out(1.5)' }
    );
  }
});


/* ══════════════════════════════════════════════
   UNIFIED RAF — cursor follower + mouse glow
   (single loop replaces two separate rAFs)
══════════════════════════════════════════════ */
(function unifiedRAF() {
  function tick() {
    if (window._followerState) {
      const s = window._followerState;
      s.fx += (s.mx() - s.fx) * 0.12;
      s.fy += (s.my() - s.fy) * 0.12;
      s.follower.style.transform = `translate(calc(${s.fx}px - 50%), calc(${s.fy}px - 50%))`;
    }
    if (window._glowState) {
      const g = window._glowState;
      g.cx += (g.tx() - g.cx) * 0.06;
      g.cy += (g.ty() - g.cy) * 0.06;
      g.glow.style.transform = `translate(calc(${g.cx}px - 50%), calc(${g.cy}px - 50%))`;
    }
    requestAnimationFrame(tick);
  }
  tick();
})();
