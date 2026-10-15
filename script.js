(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Add contact details here to show the buttons. Left empty on purpose: the CV lists none. */
  const CONTACT = { email: 'sadiakbar9122@gmail.com', linkedin: '' };
  if (CONTACT.email || CONTACT.linkedin) {
    $('#contact-actions').hidden = false;
    if (CONTACT.email) { const a = $('#mail'); a.href = 'mailto:' + CONTACT.email; a.textContent = CONTACT.email; a.hidden = false; }
    if (CONTACT.linkedin) { const a = $('#linkedin'); a.href = CONTACT.linkedin; a.hidden = false; }
  }

  /* nav */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('.nav nav a');
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secObs.observe(s));

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* counters (final value is already in the markup) */
  if (!reduce) {
    const co = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, t0 = performance.now();
      const tick = t => {
        const p = Math.min((t - t0) / 1000, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: .8 });
    $$('[data-count]').forEach(el => co.observe(el));
  }

  /* ECG line */
  (() => {
    const c = $('#ecg'), g = c.getContext('2d');
    let w, h, dpr, off = 0, running = true;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const period = 360;
    const wave = x => {
      const t = ((x % period) + period) % period, b = h * .55;
      if (t < 60) return b;
      if (t < 90) return b - Math.sin((t - 60) / 30 * Math.PI) * 7;          /* P */
      if (t < 120) return b;
      if (t < 130) return b + (t - 120) * .9;                                /* Q */
      if (t < 145) return b + 9 - (t - 130) / 15 * (h * .55 + 6);            /* R up */
      if (t < 162) return b - h * .46 + (t - 145) / 17 * (h * .46 + 14);     /* S */
      if (t < 175) return b + 14 - (t - 162) / 13 * 14;
      if (t < 215) return b;
      if (t < 265) return b - Math.sin((t - 215) / 50 * Math.PI) * 13;       /* T */
      return b;
    };
    function draw() {
      g.clearRect(0, 0, w, h);
      g.lineWidth = 2; g.lineJoin = 'round'; g.strokeStyle = '#1f6f6a';
      g.beginPath();
      for (let x = 0; x <= w; x += 2) { const y = wave(x + off); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      const grad = g.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(251,250,247,1)'); grad.addColorStop(.18, 'rgba(251,250,247,0)');
      grad.addColorStop(.82, 'rgba(251,250,247,0)'); grad.addColorStop(1, 'rgba(251,250,247,1)');
      g.fillStyle = grad; g.fillRect(0, 0, w, h);
    }
    const loop = () => { if (!running) return; off += .9; draw(); requestAnimationFrame(loop); };
    new ResizeObserver(size).observe(c);
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting && !reduce; if (running && !was) loop(); }).observe(c);
    size(); if (!reduce) loop();
  })();

  $('#yr').textContent = new Date().getFullYear();
})();
