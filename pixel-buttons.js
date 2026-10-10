(() => {
  'use strict';
  const selector = '.primary-button,.access-connect,.footer-discord,.story-apply,.pixel-button,[data-pixel-button]';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Two-row opacity fields sampled from the user's 30 fps reference clip.
  // Interpolate the fields continuously; paint integer pixel boundaries without overlap.
  const decode = rows => rows.map(row => row.match(/../g).map(v => parseInt(v,16)/255));
  const arrival = decode(["0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","0e000f000e00000000000000000000000000000000002800000e000000000000000000000000000000000000","0e000f000e00000000000000000000000000000000002800000e000000000000000000000000000000000000","4b253d18330e0e000e00000000000000000000000000802819410e0000000000000000000000000000000000","4b253d18330e0e000e00000000000000000000000000802819410e0000000000000000000000000000000000","b280a5719a414127333319000c000000000000000000d78871a54c27270c2600271900000000000000000000","d8b3cba5cb72754c5a5b330e1900000e000000000000f1beb3cb80415b274b0e4c320e0e00000e0000000000","d8b3cba5cb72754c5a5b330e1900000e000000000000f1beb3cb80415b274b0e4c320e0e00000e0000000000","fff3fff3f3d8d8c0c0c0993366273333190e000e0e00fff1f1fed8b3c080b24dc09932331919330c19190000","fff3fff3f3d8d8c0c0c0993366273333190e000e0e00fff1f1fed8b3c080b24dc09932331919330c19190000","fffffffffffffff1f1f1e599cb7299a55a33194c3200fffffffefff1f1d8f1c0f1e599995b65a54c725b180e","ffffffffffffffffffffffe5f3d8e5e5c09966b39927fffffffefffffffffff1ffffe5e5cbcde5c0d8c05a41","ffffffffffffffffffffffe5f3d8e5e5c09966b39927fffffffefffffffffff1ffffe5e5cbcde5c0d8c05a41","fffffffffffffffffffffffffffffffff3e5cbf1e58dfffffffefffffffffffffffffffff3f3fff3fff1c0a6","fffffffffffffffffffffffffffffffffffff3ffffe7fffffffffffffffffffffffffffffffffffffffff1e6","fffffffffffffffffffffffffffffffffffff3ffffe7fffffffffffffffffffffffffffffffffffffffff1e6","fffffffffffffffffffffffffffffffffffffffffff5ffffffffffffffffffffffffffffffffffffffffffff","fffffffffffffffffffffffffffffffffffffffffff5ffffffffffffffffffffffffffffffffffffffffffff","ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"]);
  const departure = decode(["ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","d8f3e9f1e9ffffffffffffffffffffffffffffffffffb3f1f1e9ffffffffffffffffffffffffffffffffffff","d8f3e9f1e9ffffffffffffffffffffffffffffffffffb3f1f1e9ffffffffffffffffffffffffffffffffffff","80b399c0a5d8d8f3e7e7f3ffffffffffffffffffffff4da7c098d8f3e5fff2fff3f3ffffffffffffffffffff","80b399c0a5d8d8f3e7e7f3ffffffffffffffffffffff4da7c098d8f3e5fff2fff3f3ffffffffffffffffffff","284c335c338d8db3a5a5cdf3e7fffff3ffffffffffff0e424d3380c0a5d7b2f3b3cbf3f3fffff3ffffffffff","000e000e0e282841414166cd99d8cdcde7f3fff3f3ff000e0e00284d41804bb34166cdcde7e7cdf4e7e7ffff","000e000e0e282841414166cd99d8cdcde7f3fff3f3ff000e0e00284d41804bb34166cdcde7e7cdf4e7e7ffff","000000000000000e0e0e1a66338d665ba5cde5b3cbff00000000000e0e280b3f0e1d6666a5985cb38da5e5f4","000000000000000000000e331a4d41336699cd80a5ea000000000000000e001d000e4133655b33804d65cde9","000000000000000000000e331a4d41336699cd80a5ea000000000000000e001d000e4133655b33804d65cde9","00000000000000000000000e000e0e0e1a335b2841a70000000000000000000000000e0e1a1a0e290e1a6590","00000000000000000000000e000e0e0e1a335b2841a70000000000000000000000000e0e1a1a0e290e1a6590","00000000000000000000000000000000000e1a000e4100000000000000000000000000000000000000001a28","0000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000","0000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000","0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"]);
  const installed = new WeakSet();
  function attach(button) {
    if (installed.has(button)) return;
    installed.add(button); button.classList.add('pixel-button');
    const canvas = document.createElement('canvas'); canvas.className='pixel-fill'; canvas.setAttribute('aria-hidden','true');button.append(canvas);
    const ctx = canvas.getContext('2d');
    let width=0,height=0,columns=1,cells=[],frame=0,start=0,target=0;
    function paint() {
      if (!ctx) return;
      ctx.clearRect(0,0,width,height);
      const cw=width/columns,ch=height/2;
      ctx.fillStyle='#ff7828';
      cells.forEach(cell=>{
        const left=Math.round(cell.x*cw),right=Math.round((cell.x+1)*cw);
        const top=Math.round(cell.y*ch),bottom=Math.round((cell.y+1)*ch);
        ctx.globalAlpha=cell.value;ctx.fillRect(left,top,right-left,bottom-top);
      });
      ctx.globalAlpha=1;
    }
    function resize() {
      width=button.clientWidth;height=button.clientHeight;
      const dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);
      columns=Math.max(1,Math.ceil(width/Math.max(12,height/2)));
      cells=Array.from({length:columns*2},(_,i)=>({x:i%columns,y:Math.floor(i/columns),value:target,from:target}));
      paint();
    }
    function tick(now) {
      const track=target?arrival:departure;
      const position=Math.min(track.length-1,Math.max(0,(now-start)*30/1000));
      const index=Math.floor(position),next=Math.min(index+1,track.length-1),mix=position-index;
      for (const cell of cells) {
        const sample=cell.y*22+Math.min(21,Math.floor((cell.x+.5)/columns*22));
        const opacity=track[index][sample]+(track[next][sample]-track[index][sample])*mix;
        cell.value=target?cell.from+(1-cell.from)*opacity:cell.from*opacity;
      }
      paint();frame=position===track.length-1?0:requestAnimationFrame(tick);
    }

    function change(value) {
      const next=Number(value);if(next===target)return;
      target=next;button.classList.toggle('is-pixel-active',Boolean(target));
      cancelAnimationFrame(frame);frame=0;
      button.classList.toggle('pixel-static',reduced.matches||!ctx);
      if(reduced.matches||!ctx){cells.forEach(cell=>cell.value=target);paint();return;}
      if(!width||!height)resize();
      cells.forEach(cell=>cell.from=cell.value);
      start=performance.now();frame=requestAnimationFrame(tick);
    }
    button.addEventListener('pointerenter',()=>change(true));
    button.addEventListener('pointerleave',()=>change(button.matches(':focus-visible')));
    button.addEventListener('focus',()=>change(true));
    button.addEventListener('blur',()=>change(button.matches(':hover')));
    reduced.addEventListener('change',()=>{
      cancelAnimationFrame(frame);frame=0;button.classList.toggle('pixel-static',reduced.matches||!ctx);
      cells.forEach(cell=>cell.value=target);paint();
    });
    new ResizeObserver(resize).observe(button);resize();
  }
  document.querySelectorAll(selector).forEach(attach);
  // New primary actions opt in with data-pixel-button or the shared pixel-button class.
  new MutationObserver(records=>{
    for(const record of records) for(const node of record.addedNodes) {
      if(!(node instanceof Element))continue;
      if(node.matches(selector))attach(node);
      node.querySelectorAll(selector).forEach(attach);
    }
  }).observe(document.body,{childList:true,subtree:true});
})();
