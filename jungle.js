/* Photographic motion: original foliage, subtle water refraction and drifting mist. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.querySelector('.jungle-canvas');
  const toggle = document.querySelector('.motion-toggle');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const photo = new Image();
  photo.src = 'jungle-waterfall.webp';
  let ready=false, paused=false, visible=false, frame=0, last=0, t=0, w=1, h=1;
  const mist = document.createElement('canvas'); mist.width=900; mist.height=350;
  const mc=mist.getContext('2d');
  let seed=97; const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
  for(let i=0;i<80;i++){
    const x=rand()*900,y=100+rand()*160,r=35+rand()*140;
    const g=mc.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(203,222,212,.035)');g.addColorStop(1,'rgba(203,222,212,0)');mc.fillStyle=g;mc.fillRect(x-r,y-r,r*2,r*2);
  }
  function draw(){
    ctx.clearRect(0,0,w,h); if(!ready)return;
    const scale=Math.max(w/photo.width,h/photo.height),dw=photo.width*scale,dh=photo.height*scale;
    // Keep the waterfall in view on narrow displays.
    const ox=(w-dw)*(w<760?.74:.5),oy=(h-dh)*.5;
    ctx.drawImage(photo,ox,oy,dw,dh);
    // Refract the photographed water inside a soft mask, preserving the foliage.
    const wx=ox+dw*.72, wy=oy+dh*.57, ww=dw*.055, wh=dh*.59;
    ctx.save();ctx.beginPath();ctx.ellipse(wx,wy,ww/2,wh/2,0,0,Math.PI*2);ctx.clip();
    for(let y=wy-wh/2;y<wy+wh/2;y+=3){
      const f=(y-wy)/(wh/2),alpha=Math.max(0,1-f*f)*.28;
      ctx.globalAlpha=alpha;
      const offset=Math.sin((y-wy)*.075-t*3.7)*1.2;
      const sy=(y-oy)/scale;
      if(sy>=0&&sy+4/scale<photo.height)ctx.drawImage(photo,(wx-ww/2-ox)/scale,sy,ww/scale,4/scale,wx-ww/2+offset,y,ww,4);
    }
    ctx.restore();
    ctx.save();ctx.globalAlpha=.55;
    const drift=Math.sin(t*.09)*w*.07;
    ctx.drawImage(mist,-w*.25+drift,h*.38,w*1.5,h*.6);
    ctx.globalAlpha=.3;ctx.drawImage(mist,w*.1-Math.sin(t*.065)*w*.1,h*.1,w*1.1,h*.65);ctx.restore();
  }
  function tick(now){frame=0;if(!visible||document.hidden){last=0;return}if(last&&!paused&&!reduce.matches)t+=Math.min((now-last)/1000,.05);last=now;draw();if(!paused&&!reduce.matches)frame=requestAnimationFrame(tick)}
  function wake(){last=0;draw();if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
  new ResizeObserver(()=>{const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);wake()}).observe(canvas);
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)wake()}).observe(canvas);
  photo.onload=()=>{ready=true;wake()};
  photo.onerror=()=>{canvas.hidden=true};
  function sync(){document.body.classList.toggle('motion-paused',paused||reduce.matches);if(toggle){toggle.hidden=reduce.matches;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Продолжить анимацию':'Приостановить анимацию');toggle.textContent=paused?'Продолжить':'Пауза'}wake()}
  toggle?.addEventListener('click',()=>{paused=!paused;sync()});reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',wake);sync();
})();
