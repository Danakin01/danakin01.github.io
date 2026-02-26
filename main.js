/* ═══════════════════════════════════════════════
   SHARED JS — DANIEL AKINWANDE GEORGE PORTFOLIO
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Custom Cursor ──
  const cursor = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');
  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  
  function animateCursor() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
    if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .card, [data-hover]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor?.classList.add('hover');
      cursorRing?.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor?.classList.remove('hover');
      cursorRing?.classList.remove('hover');
    });
  });

  // ── Sticky Nav ──
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  });

  // ── Active Nav Link ──
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ── Mobile Nav ──
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileNav?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── Scroll Reveal ──
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ── Stagger Children ──
  document.querySelectorAll('[data-stagger]').forEach(parent => {
    parent.querySelectorAll('.reveal').forEach((child, i) => {
      child.dataset.delay = i * 120;
    });
  });

  // ── Page Transitions ──
  const transition = document.querySelector('.page-transition');
  if (transition) {
    transition.classList.add('entering');
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
      a.addEventListener('click', e => {
        e.preventDefault();
        transition.classList.remove('entering');
        transition.classList.add('leaving');
        setTimeout(() => { window.location.href = href; }, 500);
      });
    });
  }

  // ── Counter Animation ──
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.unobserve(el);
      let start = 0, duration = 1800;
      const step = timestamp => {
        if (!step.start) step.start = timestamp;
        const progress = Math.min((timestamp - step.start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target) + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  // ── Tilt Effect on Cards ──
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

});

// --Submit Form--//
function submitForm() {
  const form = document.getElementById('contact-form');
  const successDiv = document.getElementById('form-success');
  const button = form.querySelector('.submit-btn');  // or document.querySelector('.submit-btn')
  const originalText = button.innerHTML;

  if (!form || !successDiv) {
    alert("Form or success div not found – check your HTML IDs.");
    return;
  }

  button.disabled = true;
  button.innerHTML = 'Sending... ↗';

  emailjs.sendForm('service_883k08l', 'template_cpwytsw', form)
    .then(() => {
      form.style.display = 'none';
      successDiv.style.display = 'block';
      console.log('SUCCESS! Email sent.');
    })
    .catch((error) => {
      console.error('EmailJS failed:', error);
      alert('Failed to send: ' + (error.text || 'Check console for details'));
    })
    .finally(() => {
      button.disabled = false;
      button.innerHTML = originalText;
    });
}

