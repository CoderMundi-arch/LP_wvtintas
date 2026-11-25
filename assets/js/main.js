/* WV Tintas — interações e animações (sem build) */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var animate = hasGsap && !reduce;
  var finePointer = matchMedia('(pointer: fine)').matches;
  var header = document.querySelector('.header');
  var lenis = null;

  if (!animate) root.classList.remove('anim');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis ---------- */
  if (animate && finePointer && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function headerH() { return header ? header.offsetHeight : 0; }
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'topo' ? 0 : -headerH() + 1, duration: 1.2 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.burger');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });
  matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ---------- Âncoras ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    if (root.classList.contains('menu-open')) setMenu(false);
    scrollToEl(el);
    history.replaceState(null, '', '#' + id);
  });

  /* ---------- Header: sólido ao rolar / esconde ao descer ---------- */
  var hero = document.querySelector('.hero');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-solid', y > 40);
    var hide = y > lastY && y > window.innerHeight * 0.9 && !root.classList.contains('menu-open');
    header.classList.toggle('is-hidden', hide);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- WhatsApp flutuante ---------- */
  var waFloat = document.querySelector('.wa-float');
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (en) {
      waFloat.classList.toggle('is-visible', !en[0].isIntersecting);
    }, { threshold: 0.05 }).observe(hero);
  } else waFloat.classList.add('is-visible');

  /* ---------- Abas de produtos ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (animate) {
      gsap.fromTo(panel.querySelectorAll('.pcard:not(.is-extra), .panel__more, .complements'),
        { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', clearProps: 'all' });
    }
    if (hasGsap) ScrollTrigger.refresh();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (k === 'Home') n = tabs[0];
      if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });
  document.querySelectorAll('[data-cat-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      var tab = document.getElementById('tab-' + a.dataset.catLink);
      if (tab) selectTab(tab);
    });
  });
  document.querySelectorAll('[data-more]').forEach(function (b) {
    var label = b.querySelector('span');
    var orig = label.textContent;
    b.addEventListener('click', function () {
      var panel = b.closest('.panel');
      var open = !panel.classList.contains('is-open');
      panel.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Mostrar menos' : orig;
      if (open && animate) {
        gsap.fromTo(panel.querySelectorAll('.pcard.is-extra'), { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', clearProps: 'all' });
      }
      if (!open) scrollToEl(document.getElementById('produtos'));
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  /* ---------- Modal de produto ---------- */
  var pmodal = document.getElementById('pmodal');
  function waLink(num, name) {
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent('Olá, WV Tintas! Gostaria de um orçamento do produto: ' + name);
  }
  function openProduct(card) {
    var d = card.dataset;
    var img = pmodal.querySelector('.pmodal__img img');
    img.src = d.img; img.alt = d.name + (d.brand ? ' – ' + d.brand : '');
    pmodal.querySelector('.pmodal__cat').textContent = d.cat;
    pmodal.querySelector('h3').textContent = d.name;
    pmodal.querySelector('.pmodal__brand').textContent = [d.brand ? 'Marca: ' + d.brand : '', d.tag || ''].filter(Boolean).join(' · ');
    pmodal.querySelectorAll('[data-wa]').forEach(function (a) { a.href = waLink(a.dataset.wa, d.name); });
    pmodal.showModal();
    if (lenis) lenis.stop();
  }
  document.querySelectorAll('.pcard').forEach(function (card) {
    card.querySelector('.pcard__open').addEventListener('click', function () { openProduct(card); });
    card.querySelector('.pcard__more').addEventListener('click', function () { openProduct(card); });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var cur = 0;
  function showLb(i) {
    cur = (i + items.length) % items.length;
    var src = items[cur].querySelector('img');
    var im = lb.querySelector('img');
    im.src = src.src; im.alt = src.alt;
    lb.querySelector('figcaption').textContent = (cur + 1) + ' / ' + items.length;
  }
  items.forEach(function (it, i) {
    it.addEventListener('click', function () { showLb(i); lb.showModal(); if (lenis) lenis.stop(); });
  });
  lb.querySelector('.lightbox__prev').addEventListener('click', function () { showLb(cur - 1); });
  lb.querySelector('.lightbox__next').addEventListener('click', function () { showLb(cur + 1); });
  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') showLb(cur - 1);
    if (e.key === 'ArrowRight') showLb(cur + 1);
  });

  [pmodal, lb, document.getElementById('vshort')].forEach(function (dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-close]')) { dlg.close(); if (lenis) lenis.start(); }
    });
    dlg.addEventListener('close', function () { if (lenis) lenis.start(); });
  });

  /* ---------- Formulário → WhatsApp da loja escolhida ---------- */
  var form = document.getElementById('form-orcamento');
  var err = form.querySelector('.form__error');
  var cel = form.querySelector('#f-cel');
  cel.addEventListener('input', function () {
    var v = cel.value.replace(/\D/g, '').slice(0, 11);
    var out = v;
    if (v.length > 2) out = '(' + v.slice(0, 2) + ') ' + v.slice(2);
    if (v.length > 7) out = '(' + v.slice(0, 2) + ') ' + v.slice(2, v.length - 4) + '-' + v.slice(v.length - 4);
    cel.value = out;
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var missing = [];
    form.querySelectorAll('.is-invalid').forEach(function (x) { x.classList.remove('is-invalid'); });
    if (!f.nome.value.trim()) { missing.push('nome'); f.nome.classList.add('is-invalid'); }
    if (cel.value.replace(/\D/g, '').length < 10) { missing.push('celular'); cel.classList.add('is-invalid'); }
    if (f.email.value && !f.email.checkValidity()) { missing.push('e-mail válido'); f.email.classList.add('is-invalid'); }
    var loja = form.querySelector('input[name="loja"]:checked');
    if (!loja) missing.push('loja');
    if (!f.mensagem.value.trim()) { missing.push('mensagem'); f.mensagem.classList.add('is-invalid'); }
    if (missing.length) {
      err.textContent = 'Preencha: ' + missing.join(', ') + '.';
      var first = form.querySelector('.is-invalid') || form.querySelector('input[name="loja"]');
      if (first) first.focus();
      return;
    }
    err.textContent = '';
    var txt = 'Olá, WV Tintas! Gostaria de solicitar um orçamento.\n\n' +
      '*Nome:* ' + f.nome.value.trim() + '\n' +
      '*Celular:* ' + cel.value + '\n' +
      (f.email.value ? '*E-mail:* ' + f.email.value.trim() + '\n' : '') +
      '*Loja:* ' + loja.value + '\n' +
      '*Mensagem:* ' + f.mensagem.value.trim();
    var go = document.createElement('a');
    go.href = 'https://wa.me/' + loja.dataset.wa + '?text=' + encodeURIComponent(txt);
    go.target = '_blank'; go.rel = 'noopener';
    document.body.appendChild(go); go.click(); go.remove();
  });

  /* ---------- Mapas sob demanda ---------- */
  var maps = document.querySelectorAll('[data-map]');
  function loadMap(box) {
    if (box.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = box.dataset.map; f.title = box.dataset.title; f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    box.appendChild(f);
  }
  if ('IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { loadMap(x.target); mo.unobserve(x.target); } });
    }, { rootMargin: '400px 0px' });
    maps.forEach(function (m) { mo.observe(m); });
  } else maps.forEach(loadMap);


  /* ---------- Bolha de vídeo (estilo iShorts) ---------- */
  var bubble = document.getElementById('vbubble');
  var vs = document.getElementById('vshort');
  if (bubble && vs) {
    var pv = bubble.querySelector('video');
    var vid = vs.querySelector('video');
    var bar = vs.querySelector('.vshort__bar');
    var fill = bar.querySelector('span');
    var muteBtn = vs.querySelector('.vshort__mute');
    var toggle = vs.querySelector('.vshort__toggle');
    var toast = vs.querySelector('.vshort__toast');
    var dismissed = false;
    try { dismissed = sessionStorage.getItem('wv-vbubble') === '0'; } catch (e) {}
    if (dismissed) bubble.classList.add('is-dismissed');

    // aparece pouco depois do carregamento; prévia muda em loop só quando visível
    // aparece depois da primeira dobra, para não cobrir o hero
    function bubbleVis() { bubble.classList.toggle('is-visible', window.scrollY > (hero ? hero.offsetHeight * 0.55 : 300)); }
    window.addEventListener('scroll', bubbleVis, { passive: true });
    bubbleVis();
    function startPreview() {
      if (reduce || !pv || document.hidden || bubble.classList.contains('is-dismissed') || vs.open) return;
      if (!pv.src) pv.src = pv.dataset.src;
      var pr = pv.play();
      if (pr && pr.then) pr.then(function () { pv.classList.add('is-playing'); }).catch(function () {});
    }
    function stopPreview() { if (pv && !pv.paused) pv.pause(); }
    window.addEventListener('load', function () { setTimeout(startPreview, 1500); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stopPreview() : startPreview(); });

    function setMuted(m) {
      vid.muted = m;
      muteBtn.setAttribute('aria-pressed', String(m));
      muteBtn.setAttribute('aria-label', m ? 'Ativar som' : 'Desativar som');
    }
    function setPaused(p) {
      vs.classList.toggle('is-paused', p);
      toggle.setAttribute('aria-label', p ? 'Reproduzir vídeo' : 'Pausar vídeo');
    }
    function play() {
      var pr = vid.play();
      if (pr && pr.catch) pr.catch(function () { setMuted(true); vid.play().catch(function () { setPaused(true); }); });
    }
    function openShort() {
      if (!vid.src) vid.src = vid.dataset.src;
      stopPreview();
      vs.showModal();
      if (lenis) lenis.stop();
      try { vid.currentTime = 0; } catch (e) {}
      setMuted(false); setPaused(false); play();
    }
    bubble.querySelector('.vbubble__open').addEventListener('click', openShort);
    bubble.querySelector('.vbubble__dismiss').addEventListener('click', function () {
      bubble.classList.add('is-dismissed'); stopPreview();
      try { sessionStorage.setItem('wv-vbubble', '0'); } catch (e) {}
    });

    toggle.addEventListener('click', function () { vid.paused ? play() : vid.pause(); });
    vid.addEventListener('play', function () { setPaused(false); });
    vid.addEventListener('pause', function () { setPaused(true); });
    vid.addEventListener('ended', function () { setPaused(true); });
    muteBtn.addEventListener('click', function () { setMuted(!vid.muted); if (vid.paused) play(); });

    function tick() {
      if (vid.duration) {
        var pct = vid.currentTime / vid.duration * 100;
        fill.style.width = pct + '%';
        bar.setAttribute('aria-valuenow', String(Math.round(pct)));
      }
      if (vs.open) requestAnimationFrame(tick);
    }
    vid.addEventListener('playing', function () { requestAnimationFrame(tick); });
    function seekTo(clientX) {
      var r = bar.getBoundingClientRect();
      if (vid.duration) vid.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * vid.duration;
    }
    bar.addEventListener('click', function (e) { seekTo(e.clientX); tick(); });
    bar.addEventListener('keydown', function (e) {
      if (!vid.duration) return;
      if (e.key === 'ArrowRight') { vid.currentTime = Math.min(vid.duration, vid.currentTime + 5); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { vid.currentTime = Math.max(0, vid.currentTime - 5); e.preventDefault(); }
      tick();
    });
    vs.addEventListener('keydown', function (e) {
      if (e.key === ' ' && e.target === vs) { e.preventDefault(); vid.paused ? play() : vid.pause(); }
      if (e.key === 'm' || e.key === 'M') setMuted(!vid.muted);
    });
    vs.addEventListener('close', function () { vid.pause(); startPreview(); });

    vs.querySelector('.vshort__share').addEventListener('click', function () {
      var url = location.href.split('#')[0];
      var data = { title: 'WV Tintas', text: 'Conheça a WV Tintas — tintas imobiliárias, automotivas e industriais em Salvador.', url: url };
      function msg(t) { toast.textContent = t; toast.classList.add('is-on'); setTimeout(function () { toast.classList.remove('is-on'); }, 2200); }
      if (navigator.share) { navigator.share(data).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { msg('Link copiado!'); }, function () { msg(url); });
      else msg(url);
    });
  }

  /* ---------- Ano ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  if (!animate) return;

  /* =================== ANIMAÇÕES =================== */
  gsap.defaults({ ease: 'power3.out' });

  // split em palavras preservando <em> e <br>
  function split(el) {
    var frag = document.createDocumentFragment();
    function walk(node, parent) {
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
            w.appendChild(wi); parent.appendChild(w);
          });
        } else if (n.nodeName === 'BR') parent.appendChild(document.createElement('br'));
        else { var c = n.cloneNode(false); parent.appendChild(c); walk(n, c); }
      });
    }
    walk(el, frag);
    el.innerHTML = ''; el.appendChild(frag);
    el.classList.add('is-split');
    return el.querySelectorAll('.wi');
  }

  // Hero
  var heroTitle = document.querySelector('.hero [data-split]');
  var hw = split(heroTitle);
  var tl = gsap.timeline({ delay: 0.15 });
  tl.fromTo('.hero__photo img', { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, 0)
    .from(hw, { yPercent: 115, duration: 1, stagger: 0.045, ease: 'expo.out' }, 0.2)
    .fromTo('.hero__in-el', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, clearProps: 'transform', onComplete: function () { document.querySelectorAll('.hero__in-el').forEach(function (x) { x.classList.add('is-in'); }); } }, 0.5)
    .from('.ticker', { opacity: 0, duration: 1 }, 0.8);

  gsap.to('.hero__photo', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__copy', { yPercent: 8, opacity: 0.4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true } });

  // Títulos de seção
  document.querySelectorAll('[data-split]').forEach(function (el) {
    if (el === heroTitle) return;
    var ws = split(el);
    gsap.from(ws, { yPercent: 115, duration: 1, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });

  // Reveal
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: function (els) {
      gsap.to(els, {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.08, ease: 'power3.out',
        onComplete: function () { els.forEach(function (e) { e.classList.add('is-in'); gsap.set(e, { clearProps: 'all' }); }); }
      });
    }
  });

  // Contador
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var end = +el.dataset.count, pre = el.dataset.prefix || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', onUpdate: function () { el.textContent = pre + Math.round(o.v).toLocaleString('pt-BR'); } });
    } });
  });

  // Imagens crescendo
  gsap.utils.toArray('.img-grow img').forEach(function (img) {
    gsap.fromTo(img, { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom 40%', scrub: true } });
  });
  gsap.from('.about__stamp', { scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.about__media', start: 'top 70%' } });

  // Cards de produto (aba inicial)
  ScrollTrigger.batch('#cat-imobiliaria .pcard:not(.is-extra)', {
    start: 'top 92%', once: true,
    onEnter: function (els) { gsap.from(els, { opacity: 0, y: 40, duration: 0.8, stagger: 0.06 }); }
  });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', function () {
    // Seção escura abrindo como cortina
    gsap.fromTo('.curtain', { clipPath: 'inset(0% 4% 0% 4% round 36px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.curtain', start: 'top bottom', end: 'top 30%', scrub: true }
    });
    // Botões magnéticos
    if (finePointer) {
      document.querySelectorAll('.magnetic').forEach(function (b) {
        var xTo = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
        var yTo = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
        b.addEventListener('mousemove', function (e) {
          var r = b.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35);
        });
        b.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
      });
    }
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
