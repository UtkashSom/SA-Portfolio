(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Contact: add or change the address here. */
  const EMAIL = 'sadiakbar9122@gmail.com';
  if (EMAIL) {
    $('#contact-actions').hidden = false;
    const a = $('#mail'); a.href = 'mailto:' + EMAIL; a.textContent = EMAIL;
  }

  /* toast + copy email */
  let toastT;
  const toast = msg => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2000);
  };
  $('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); toast('Email copied'); }
    catch (e) { toast(EMAIL); }
  });

  /* nav, progress bar */
  const nav = $('#nav'), bar = $('.progress');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 8);
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
  };
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

  /* highlights: filters */
  const fbtns = $$('.fbtn'), cards = $$('.hcard');
  const setFilter = f => {
    fbtns.forEach(b => { const on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.cat === f;
      c.hidden = !show;
      if (show) { c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
    });
  };
  fbtns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));

  /* highlights: card spotlight + details modal */
  const modal = $('#modal');
  const openCard = c => {
    $('#m-type').textContent = c.dataset.type;
    $('#m-title').textContent = c.dataset.title;
    $('#m-org').textContent = c.dataset.org;
    $('#m-role').textContent = c.dataset.role;
    $('#m-desc').textContent = c.dataset.desc;
    modal.showModal();
  };
  cards.forEach(c => {
    c.addEventListener('click', () => openCard(c));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(c); } });
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
  $('#m-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  /* approach pillars jump to a filtered view */
  $$('.pillars button').forEach(b => b.addEventListener('click', () => {
    setFilter(b.dataset.go);
    $('#highlights').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* languages: greeting */
  const gl = $('#greet-lang'), gt = $('#greet-text');
  $$('#langs button').forEach(b => b.addEventListener('click', () => {
    $$('#langs button').forEach(x => x.classList.toggle('on', x === b));
    gl.textContent = b.dataset.l; gt.textContent = b.dataset.g;
    gt.dir = b.dataset.d; gt.lang = { Hindi: 'hi', Malayalam: 'ml', Arabic: 'ar', Russian: 'ru', Urdu: 'ur' }[b.dataset.l] || 'en';
  }));

  /* ECG line: speeds up on hover and the BPM readout follows */
  (() => {
    const c = $('#ecg'), g = c.getContext('2d'), bpmEl = $('#bpm');
    let w, h, dpr, off = 0, running = true, speed = 1, target = 1;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const period = 360;
    const wave = x => {
      const t = ((x % period) + period) % period, b = h * .55;
      if (t < 60) return b;
      if (t < 90) return b - Math.sin((t - 60) / 30 * Math.PI) * 7;
      if (t < 120) return b;
      if (t < 130) return b + (t - 120) * .9;
      if (t < 145) return b + 9 - (t - 130) / 15 * (h * .55 + 6);
      if (t < 162) return b - h * .46 + (t - 145) / 17 * (h * .46 + 14);
      if (t < 175) return b + 14 - (t - 162) / 13 * 14;
      if (t < 215) return b;
      if (t < 265) return b - Math.sin((t - 215) / 50 * Math.PI) * 13;
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
    const loop = () => {
      if (!running) return;
      speed += (target - speed) * .08; off += .9 * speed; draw();
      bpmEl.textContent = Math.round(72 * speed);
      requestAnimationFrame(loop);
    };
    c.addEventListener('mouseenter', () => { target = 1.7; });
    c.addEventListener('mouseleave', () => { target = 1; });
    new ResizeObserver(size).observe(c);
    new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting && !reduce; if (running && !was) loop(); }).observe(c);
    size(); if (!reduce) loop();
  })();

  $('#yr').textContent = new Date().getFullYear();
})();
