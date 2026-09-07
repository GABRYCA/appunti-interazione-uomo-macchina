// HMI Lab — main.js: theme, progress, TOC, search, copy, print, menu
(function(){
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('hmi-theme');
  if(saved) root.setAttribute('data-theme', saved);
  themeBtn?.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme') || 'auto';
    const next = cur === 'dark' ? 'light' : cur === 'light' ? 'auto' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('hmi-theme', next);
    themeBtn.textContent = 'Tema: ' + next;
  });
  if(saved && themeBtn) themeBtn.textContent = 'Tema: ' + saved;

  // progress + toc spy
  const bar = document.getElementById('progressBar');
  const links = [...document.querySelectorAll('[data-toc]')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll(){
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if(bar) bar.style.width = (p*100).toFixed(1) + '%';
  }
  document.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if(e.isIntersecting){
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, {rootMargin:'-40% 0px -55% 0px'});
  secs.forEach(s => io.observe(s));

  // mobile menu
  const menuBtn = document.getElementById('menuToggle');
  const toc = document.getElementById('toc');
  menuBtn?.addEventListener('click', () => {
    const open = toc.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  toc?.addEventListener('click', e => { if(e.target.closest('a')) toc.classList.remove('open'); });

  // search filter
  const input = document.getElementById('searchInput');
  const count = document.getElementById('searchCount');
  const noRes = document.getElementById('noResults');
  const blocks = [...document.querySelectorAll('[data-searchable]')];
  function applySearch(q){
    q = (q||'').trim().toLowerCase();
    if(!q){ blocks.forEach(b => b.hidden = false); if(noRes) noRes.hidden = true; if(count) count.textContent=''; return; }
    let shown = 0;
    blocks.forEach(b => {
      const hit = b.textContent.toLowerCase().includes(q);
      b.hidden = !hit; if(hit) shown++;
    });
    if(noRes) noRes.hidden = shown > 0;
    if(count) count.textContent = shown + ' sezioni corrispondono a “' + q + '”';
  }
  input?.addEventListener('input', () => applySearch(input.value));
  document.querySelectorAll('[data-suggest]').forEach(b => b.addEventListener('click', () => {
    if(input){ input.value = b.dataset.suggest; applySearch(input.value); input.focus(); }
  }));

  // copy buttons
  document.querySelectorAll('.btn-copy').forEach(btn => btn.addEventListener('click', async () => {
    const el = document.getElementById(btn.dataset.copy);
    const txt = el ? el.innerText : '';
    try{ await navigator.clipboard.writeText(txt); btn.textContent = 'Copiato'; }
    catch{ btn.textContent = 'Seleziona e copia manualmente'; }
    setTimeout(() => btn.textContent = 'Copia', 1600);
  }));

  document.getElementById('printBtn')?.addEventListener('click', () => window.print());
})();
