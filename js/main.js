/* =============================================
   WEB WEAVER TECHNOLOGIES — MAIN JAVASCRIPT
   ============================================= */

// ─── CANVAS HERO ANIMATION ───────────────────
class Particle {
  constructor(w, h) {
    this.reset(w, h);
  }

  reset(w, h) {
    this.x  = Math.random() * w;
    this.y  = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.28;
    this.vy = (Math.random() - 0.5) * 0.28;
    this.r  = Math.random() * 1.8 + 0.8;
  }

  update(w, h) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0)  this.x = w;
    if (this.x > w)  this.x = 0;
    if (this.y < 0)  this.y = h;
    if (this.y > h)  this.y = 0;
  }
}

function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  let particles = [];
  let mouse     = { x: -9999, y: -9999 };
  let raf;

  const CONNECT  = 155;
  const MOUSE_R  = 210;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 17000), 85);
    particles = Array.from({ length: count }, () => new Particle(canvas.width, canvas.height));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update
    particles.forEach(p => p.update(canvas.width, canvas.height));

    // Connections
    for (let i = 0; i < particles.length; i++) {
      const pi = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const pj  = particles[j];
        const dx  = pi.x - pj.x;
        const dy  = pi.y - pj.y;
        const d   = Math.sqrt(dx * dx + dy * dy);
        if (d >= CONNECT) continue;

        const mx = (pi.x + pj.x) / 2;
        const my = (pi.y + pj.y) / 2;
        const md = Math.sqrt((mx - mouse.x) ** 2 + (my - mouse.y) ** 2);
        const mw = Math.max(0, 1 - md / MOUSE_R);

        const baseOpacity = (1 - d / CONNECT) * 0.11;
        const totalOpacity = baseOpacity + mw * 0.45;

        if (mw > 0.05) {
          ctx.strokeStyle = `rgba(212,160,74,${totalOpacity})`;
          ctx.lineWidth   = 0.6 + mw * 1.0;
        } else {
          ctx.strokeStyle = `rgba(80,75,65,${totalOpacity})`;
          ctx.lineWidth   = 0.5;
        }

        ctx.beginPath();
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
        ctx.stroke();
      }
    }

    // Particles
    particles.forEach(p => {
      const md = Math.sqrt((p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2);
      const mw = Math.max(0, 1 - md / MOUSE_R);

      if (mw > 0.08) {
        ctx.fillStyle  = `rgba(212,160,74,${0.25 + mw * 0.65})`;
        ctx.shadowBlur = mw * 12;
        ctx.shadowColor = 'rgba(212,160,74,0.7)';
      } else {
        ctx.fillStyle  = 'rgba(80,75,65,0.45)';
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(drawFrame);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Also track touch
  canvas.addEventListener('touchmove', e => {
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
  }, { passive: true });

  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    drawFrame();
  });

  resize();
  drawFrame();
}

// ─── NAVIGATION ──────────────────────────────
function initNav() {
  const nav        = document.querySelector('.nav');
  const toggle     = document.querySelector('.nav__toggle');
  const links      = document.querySelector('.nav__links');
  const spans      = toggle ? toggle.querySelectorAll('span') : [];

  if (!nav) return;

  // Scroll effect
  const onScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('nav__links--open');
      toggle.setAttribute('aria-expanded', open);
      // Animate hamburger → X
      if (open) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });
  }

  // Close on nav link click
  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('nav__links--open');
      toggle && toggle.setAttribute('aria-expanded', 'false');
      spans[0] && (spans[0].style.transform = '');
      spans[1] && (spans[1].style.opacity   = '');
      spans[2] && (spans[2] && (spans[2].style.transform = ''));
    });
  });

  // Active link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link[href]').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });
}

// ─── SCROLL REVEAL ───────────────────────────
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: reveal everything
    document.querySelectorAll('[data-reveal], [data-stagger]').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('revealed');

      // Stagger direct [data-stagger] children
      el.querySelectorAll('[data-stagger]').forEach((child, i) => {
        child.style.transitionDelay = `${i * 85}ms`;
        child.classList.add('revealed');
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

// ─── PRICING CARD GLOW ON HOVER ──────────────
function initPricingHover() {
  document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      document.querySelectorAll('.pricing-card').forEach(c => {
        if (c !== card) c.style.opacity = '0.75';
      });
    });
    card.addEventListener('mouseleave', () => {
      document.querySelectorAll('.pricing-card').forEach(c => {
        c.style.opacity = '';
      });
    });
  });
}

// ─── PROCESS STEPS STAGGER ───────────────────
function initProcessStagger() {
  const timeline = document.querySelector('.process__timeline');
  if (!timeline) return;

  const steps = timeline.querySelectorAll('.process__step');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      steps.forEach((step, i) => {
        step.style.opacity           = '0';
        step.style.transform         = 'translateY(20px)';
        step.style.transition        = `opacity 550ms cubic-bezier(0.16,1,0.3,1) ${i * 90}ms,
                                        transform 550ms cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`;
        // Trigger
        requestAnimationFrame(() => requestAnimationFrame(() => {
          step.style.opacity   = '1';
          step.style.transform = 'translateY(0)';
        }));
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  observer.observe(timeline);
}

// ─── CONTACT FORM ────────────────────────────
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn  = form.querySelector('[type="submit"]');
    const orig = btn.innerHTML;

    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/></svg> Sent!`;
    btn.disabled = true;
    btn.classList.add('btn--success');

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled  = false;
      btn.classList.remove('btn--success');
      form.reset();
    }, 3500);
  });
}

// ─── SMOOTH SCROLL FOR ANCHORS ───────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ─── INIT ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initNav();
  initScrollReveal();
  initPricingHover();
  initProcessStagger();
  initContactForm();
  initSmoothScroll();
});
