/* Living jungle. Procedural Canvas 2D, no dependencies or remote media. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  const replay = document.querySelector('.plant-replay');
  const phase = document.querySelector('.growth-phase');
  let paused = false;
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
  // Each blade has a folded transverse section, a lit ridge and branching veins.
  function leaf(c, x, y, length, width, angle, opening, hue, time, seed) {
    if (opening <= 0.001) return;
    c.save(); c.translate(x, y); c.rotate(angle + Math.sin(time * .65 + seed) * .026);
    c.scale(Math.max(.025, opening), .35 + opening * .65);
    const l = length, w = width;
    const outline = new Path2D();
    outline.moveTo(0, 0);
    outline.bezierCurveTo(-w * .6, l * .22, -w * 1.03, -l * .14, -w * .63, -l * .47);
    outline.bezierCurveTo(-w * .48, -l * .7, -w * .11, -l * .79, 0, -l);
    outline.bezierCurveTo(w * .13, -l * .79, w * .57, -l * .7, w * .69, -l * .42);
    outline.bezierCurveTo(w * 1.03, -l * .06, w * .47, l * .22, 0, 0);
    const fill = c.createLinearGradient(-w, -l * .3, w, -l * .5);
    fill.addColorStop(0, `hsl(${hue} 45% 11%)`); fill.addColorStop(.45, `hsl(${hue} 43% 29%)`);
    fill.addColorStop(.51, `hsl(${hue} 47% 19%)`); fill.addColorStop(1, `hsl(${hue} 50% 9%)`);
    c.shadowColor = '#001c19'; c.shadowBlur = 12; c.shadowOffsetY = 8;
    c.fillStyle = fill; c.fill(outline); c.shadowBlur = 0; c.shadowOffsetY = 0;
    c.save(); c.clip(outline);
    c.strokeStyle = 'rgba(197,224,163,.65)'; c.lineWidth = Math.max(.7, l * .006);
    c.beginPath(); c.moveTo(0, 3); c.quadraticCurveTo(-l * .025, -l * .48, 0, -l); c.stroke();
    for (let i = 1; i < 8; i++) {
      const f = i / 9, yy = -l * f, ww = w * Math.sin(Math.PI * f) * .8;
      for (const side of [-1, 1]) {
        c.lineWidth = Math.max(.5, l * .0035); c.strokeStyle = 'rgba(194,219,159,.45)';
        c.beginPath(); c.moveTo(0, yy); c.bezierCurveTo(side * ww * .3, yy - l * .04, side * ww * .8, yy - l * .13, side * ww, yy - l * .15); c.stroke();
        c.lineWidth = .45; c.strokeStyle = 'rgba(186,215,155,.16)';
        for (let j = 1; j < 4; j++) {
          c.beginPath(); c.moveTo(side * ww * j / 4, yy - l * .11 * j / 4);
          c.quadraticCurveTo(side * ww * (j / 4 + .12), yy - l * .14, side * ww * (j / 4 + .18), yy - l * .21); c.stroke();
        }
      }
    }
    for (let j = 0; j < 100; j++) {
      const xx = Math.sin(j * 127.1 + seed) * w, yy = -((j * 47.7) % l);
      c.fillStyle = j % 2 ? '#c1d5a10c' : '#00291d18'; c.beginPath(); c.ellipse(xx, yy, .7, 1.2, 0, 0, Math.PI * 2); c.fill();
    }
    const shine = c.createLinearGradient(0, -l, w * .7, 0);
    shine.addColorStop(0, '#e4efb81b'); shine.addColorStop(.55, '#dcebbe00'); shine.addColorStop(1, '#bddda20c');
    c.fillStyle = shine; c.fill(outline); c.restore();
    c.strokeStyle = '#b4cd8a55'; c.lineWidth = .65; c.stroke(outline); c.restore();
  }
  function mount(canvas, render) {
    if (!canvas) return null;
    const c = canvas.getContext('2d');
    if (!c) return null;
    let w = 1, h = 1, t = 0, frame = 0, last = 0, visible = false, dirty = true;
    function resize() {
      const box = canvas.getBoundingClientRect(); w = box.width; h = box.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0); dirty = true; wake();
    }
    function tick(now) {
      frame = 0;
      if (!visible || document.hidden) { last = 0; return; }
      const moving = !paused && !reduce.matches;
      if (last && moving) t += Math.min((now - last) / 1000, .05);
      last = now;
      if (moving || dirty) { c.clearRect(0, 0, w, h); render(c, w, h, t, reduce.matches); dirty = false; }
      if (moving) frame = requestAnimationFrame(tick);
    }
    function wake() { last = 0; dirty = true; if (!frame) frame = requestAnimationFrame(tick); }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); }, { rootMargin: '80px' });
    observer.observe(canvas); new ResizeObserver(resize).observe(canvas);
    document.addEventListener('visibilitychange', wake); reduce.addEventListener('change', wake);
    canvas.addEventListener('jungle-wake', wake); resize();
    return { reset() { t = 0; wake(); }, wake };
  }
  const scenes = [];
  scenes.push(mount(document.querySelector('.jungle-canvas'), (c, w, h, time) => {
    const sx = w / 700, sy = h / 760;
    c.save(); c.scale(sx, sy);
    const haze = c.createRadialGradient(430, 270, 15, 430, 300, 450);
    haze.addColorStop(0, '#8cbd9270'); haze.addColorStop(.5, '#28584f48'); haze.addColorStop(1, '#021f18d9');
    c.fillStyle = haze; c.fillRect(0, 0, 700, 760);
    // A distant cleft in the rock, broken water ribbons and drifting spray.
    const cleft = c.createLinearGradient(355, 0, 525, 0);
    cleft.addColorStop(0, '#062e2200'); cleft.addColorStop(.3, '#102e2bb0'); cleft.addColorStop(.65, '#102e2bdb'); cleft.addColorStop(1, '#062e2200');
    c.fillStyle = cleft; c.beginPath(); c.moveTo(385, 110); c.lineTo(422, 65); c.lineTo(455, 92); c.lineTo(480, 72); c.lineTo(490, 240); c.lineTo(480, 342); c.lineTo(510, 485); c.lineTo(525, 600); c.lineTo(355, 600); c.lineTo(379, 480); c.lineTo(368, 310); c.lineTo(390, 190); c.closePath(); c.fill();
    c.save();
    const water = c.createLinearGradient(0, 110, 0, 610);
    water.addColorStop(0, '#b6e3d000'); water.addColorStop(.18, '#a6d6cd6e'); water.addColorStop(.8, '#d6eee6b0'); water.addColorStop(1, '#cae8db00');
    for (let i = 0; i < 32; i++) {
      const x = 407 + i * 2.05 + Math.sin(i * 13) * 7;
      c.strokeStyle = water; c.lineWidth = 1.2 + (i % 4); c.globalAlpha = .22 + .3 * Math.sin(i * 3) ** 2;
      c.beginPath(); c.moveTo(x, 100); c.bezierCurveTo(x - 7, 290, x + 12, 440, x + Math.sin(time + i) * 15, 600); c.stroke();
      const y = 130 + ((time * (120 + i * 3) + i * 53) % 430);
      c.strokeStyle = '#d9f5e29c'; c.lineWidth = .7; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y + 20 + i % 23); c.stroke();
    }
    c.restore();
    for (let i = 0; i < 6; i++) {
      const x = 420 + Math.sin(time * .19 + i * 2.1) * 65;
      const mist = c.createRadialGradient(x, 590 + i * 6, 0, x, 590 + i * 6, 100 + i * 12);
      mist.addColorStop(0, '#c2d9c90d'); mist.addColorStop(1, '#c2d9c900'); c.fillStyle = mist; c.fillRect(180, 410, 520, 350);
    }
    c.strokeStyle = '#afcec72b'; c.lineWidth = .8;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(440, 626, 25 + ((time * 13 + i * 23) % 90), 3 + i * 3, 0, 0, Math.PI * 2); c.stroke(); }
    // Background leaves and foreground leaves move with different wind phases.
    const blades = [[58,390,240,90,-.8,157],[655,390,270,100,.7,159],[120,180,220,80,-1.45,153],[590,140,220,80,1.3,155],[65,690,330,128,-.22,148],[230,790,340,142,-.55,145],[685,760,365,138,.38,154],[530,810,280,108,.75,148],[45,800,210,95,-1.2,149],[708,580,240,90,1.2,150]];
    blades.forEach((a,i) => leaf(c, a[0], a[1], a[2], a[3], a[4] + Math.sin(time * .35 + i) * .035, 1, a[5], time, i));
    // Warm particles drift through the humid air rather than flashing.
    for (let i = 0; i < 16; i++) {
      const x = (i * 137.2 + Math.sin(time * .2 + i) * 25) % 700;
      const y = 100 + ((i * 71 - time * (3 + i % 4)) % 580 + 580) % 580;
      c.globalAlpha = .15 + .2 * (1 + Math.sin(time * .5 + i)) / 2; c.fillStyle = '#dceeb4'; c.beginPath(); c.arc(x, y, i % 3 === 0 ? 1.6 : .8, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1; c.restore();
  }));
  const stems = [
    {x:185,y:415,l:145,w:67,a:-.97,start:.5,hue:150},
    {x:341,y:408,l:160,w:75,a:.92,start:1.4,hue:155},
    {x:133,y:300,l:205,w:86,a:-.6,start:2.5,hue:150},
    {x:379,y:275,l:218,w:91,a:.55,start:3.6,hue:151},
    {x:238,y:219,l:204,w:89,a:-.15,start:4.8,hue:147},
    {x:310,y:155,l:155,w:67,a:.22,start:6,hue:145},
    {x:279,y:358,l:130,w:59,a:.18,start:6.8,hue:141}
  ];
  let lastPhase = '';
  const growth = mount(document.querySelector('.growth-canvas'), (c, w, h, time, reduced) => {
    c.save(); c.scale(w / 520, h / 620);
    const t = reduced ? 15 : time;
    const halo = c.createRadialGradient(260, 300, 30, 260, 300, 275);
    halo.addColorStop(0, '#8cbf6421'); halo.addColorStop(1, '#83b76c00'); c.fillStyle = halo; c.fillRect(0, 0, 520, 620);
    c.strokeStyle = '#bfdba521'; c.lineWidth = .7; c.beginPath(); c.ellipse(260, 300, 231, 262, 0, .1, 4.8); c.stroke();
    c.fillStyle = '#001e1c90'; c.beginPath(); c.ellipse(260, 565, 94, 11, 0, 0, Math.PI * 2); c.fill();
    for (const [i, s] of stems.entries()) {
      const g = ease((t - s.start) / 2.8);
      const breeze = Math.sin(time * .55 + i * .7) * 3 * g;
      const x = 260 + (s.x - 260) * g + breeze, y = 557 + (s.y - 557) * g;
      const stem = c.createLinearGradient(255, 560, x, y); stem.addColorStop(0, '#526442'); stem.addColorStop(.5, '#86a974'); stem.addColorStop(1, '#c1ce8a');
      c.strokeStyle = stem; c.lineWidth = 2 + 2 * g; c.lineCap = 'round';
      c.beginPath(); c.moveTo(260, 558); c.bezierCurveTo(254 + (x - 260) * .3, 532 - 50 * g, x - (x - 260) * .13, y + 55 * g, x, y); c.stroke();
      const open = ease((t - s.start - 1.5) / 3.3);
      leaf(c, x, y, s.l, s.w, s.a + (1 - open) * .5, open, s.hue, time, i);
      if (g > .05 && open < .7) {
        c.save(); c.translate(x, y); c.rotate(s.a); c.fillStyle = '#b2c581'; c.beginPath(); c.ellipse(0, -18 * g, 3 * (1 - open), 23 * g, -.12, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }
    c.fillStyle = '#8a9860'; c.beginPath(); c.moveTo(255, 560); c.quadraticCurveTo(240, 531, 254, 515); c.quadraticCurveTo(265, 536, 270, 560); c.fill();
    c.restore();
    const label = t < 2 ? 'Пробуждение' : t < 5 ? 'Первые листья' : t < 10.8 ? 'Раскрытие кроны' : 'Жизнь в каждом листе';
    if (phase && lastPhase !== label) { phase.textContent = label; lastPhase = label; }
  });
  scenes.push(growth);
  if (replay && growth) {
    replay.hidden = reduce.matches;
    replay.addEventListener('click', () => { if (!reduce.matches) { paused = false; sync(); growth.reset(); } });
  }
  function sync() {
    document.body.classList.toggle('motion-paused', paused || reduce.matches);
    if (toggle) { toggle.setAttribute('aria-pressed', String(paused)); toggle.setAttribute('aria-label', paused ? 'Продолжить анимацию' : 'Приостановить анимацию'); toggle.innerHTML = paused ? '▷ <span>Продолжить</span>' : 'Ⅱ <span>Пауза</span>'; toggle.hidden = reduce.matches; }
    if (replay) replay.hidden = reduce.matches;
    scenes.forEach(s => s?.wake());
  }
  toggle?.addEventListener('click', () => { paused = !paused; sync(); });
  reduce.addEventListener('change', sync); sync();
})();
