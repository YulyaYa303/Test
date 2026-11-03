/* Photographic motion: original foliage, downward water advection and drifting mist. */
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
  // Trace the actual water in the supplied photograph, including its cascades.
  const course=[ [.255,.750,.025],[.34,.737,.031],[.405,.720,.043],[.49,.718,.027],[.565,.713,.045],[.65,.696,.032],[.74,.683,.031],[.85,.675,.039],[.938,.662,.052] ];
  function river(y){
    let i=0;while(i<course.length-2&&y>course[i+1][0])i++;
    const a=course[i],b=course[i+1],f=Math.max(0,Math.min(1,(y-a[0])/(b[0]-a[0])));
    return {x:a[1]+(b[1]-a[1])*f,width:a[2]+(b[2]-a[2])*f};
  }
  const water=document.createElement('canvas');water.width=96;water.height=512;
  const wc=water.getContext('2d');let waterReady=false;
  function prepareWater(){
    // Unwrap only real water from the photograph into a flow texture.
    for(let y=0;y<512;y++){
      const v=.28+y/512*.61,ch=river(v),sw=photo.width*ch.width;
      wc.drawImage(photo,photo.width*ch.x-sw/2,photo.height*v,sw,1,0,y,96,1);
    }
    const pixels=wc.getImageData(0,0,96,512),data=pixels.data;
    for(let y=0;y<512;y++)for(let x=0;x<96;x++){
      const i=(y*96+x)*4,edge=Math.sin(Math.PI*x/95)**2;
      // Keep bright water and spray; exclude moss and dark rock from the flow.
      const light=(data[i]+data[i+1]+data[i+2])/3;
      const neutral=1-Math.min(1,Math.max(0,data[i+1]-data[i]-12)/40);
      data[i+3]=Math.round(255*edge*Math.min(1,Math.max(0,(light-25)/90))*neutral);
    }
    wc.putImageData(pixels,0,0);waterReady=true;
  }
  function draw(){
    ctx.clearRect(0,0,w,h); if(!ready)return;
    const scale=Math.max(w/photo.width,h/photo.height),dw=photo.width*scale,dh=photo.height*scale;
    // Keep the waterfall in view on narrow displays.
    const ox=(w-dw)*(w<760?.74:.5),oy=(h-dh)*.5;
    ctx.drawImage(photo,ox,oy,dw,dh);
    // Advect a continuous photographic water texture DOWN the curved channel.
    // Foliage is never displaced; the photographic rock ledges remain stationary.
    if (waterReady) {
      const start=.255,end=.938, step=1/Math.max(dh,1);
      for(let y=start;y<end;y+=step){
        const channel=river(y), x=ox+dw*channel.x, width=dw*channel.width;
        const progress=(y-start)/(end-start);
        const feather=Math.min(1,progress*18,(1-progress)*18);
        // Positive phase moves texture features down the page, with two speeds
        // for the main stream and finer surface foam.
        for(let layer=0;layer<2;layer++){
          const speed=layer? .49:.34;
          const v=((progress-t*speed+layer*.37)%1+1)%1;
          ctx.globalAlpha=feather*Math.min(1,v*30,(1-v)*30)*(layer?.18:.62);
          ctx.drawImage(water,0,v*(water.height-2),water.width,water.height*step/(end-start),x-width/2,oy+y*dh,width,1.01);
        }
      }
      ctx.globalAlpha=1;
    }
    ctx.save();ctx.globalAlpha=.55;
    const drift=Math.sin(t*.09)*w*.07;
    ctx.drawImage(mist,-w*.25+drift,h*.38,w*1.5,h*.6);
    ctx.globalAlpha=.3;ctx.drawImage(mist,w*.1-Math.sin(t*.065)*w*.1,h*.1,w*1.1,h*.65);ctx.restore();
  }
  function tick(now){frame=0;if(!visible||document.hidden){last=0;return}if(last&&!paused&&!reduce.matches)t+=Math.min((now-last)/1000,.05);last=now;draw();if(!paused&&!reduce.matches)frame=requestAnimationFrame(tick)}
  function wake(){last=0;draw();if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
  new ResizeObserver(()=>{const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);wake()}).observe(canvas);
  new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)wake()}).observe(canvas);
  photo.onload=()=>{ready=true;prepareWater();wake()};
  photo.onerror=()=>{canvas.hidden=true};
  function sync(){document.body.classList.toggle('motion-paused',paused||reduce.matches);if(toggle){toggle.hidden=reduce.matches;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Продолжить анимацию':'Приостановить анимацию');toggle.textContent=paused?'Продолжить':'Пауза'}wake()}
  toggle?.addEventListener('click',()=>{paused=!paused;sync()});reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',wake);sync();
})();
