(() => {
  'use strict';
  const map=window.MT_CITY_MAP,section=document.querySelector('#city-map');if(!map||!section)return;
  const {viewport,world}=map;
  const ns='http://www.w3.org/2000/svg';
  const symbols={
    tank:'<rect x="11" y="19" width="9" height="36" rx="4"/><rect x="44" y="19" width="9" height="36" rx="4"/><path d="M21 17h22v39H21z"/><path class="unit-lit" d="m25 27 7-5 7 5v17H25z"/><path d="M29 5h6v25h-6z"/><path class="unit-line" d="M13 25h5m-5 8h5m-5 8h5m-5 8h5m28-24h5m-5 8h5m-5 8h5m-5 8h5"/>',
    soldier:'<path d="m24 44-3 15h8l3-14 4 14h8l-4-19z"/><path class="unit-lit" d="m22 22 10-4 11 5 2 21H21z"/><path d="m21 24-7 8 6 9 5-4-4-5 5-6m17 0 7 7-2 10-7-2 2-6-5-7"/><circle cx="32" cy="12" r="8"/><path class="unit-lit" d="M24 12a8 8 0 0 1 16 0z"/><path class="unit-line" d="m22 39 25-17m-19 7 7 10"/>',
    helicopter:'<path d="m29 32-2 24-6 2v3h22v-3l-6-2-2-24z"/><path class="unit-lit" d="M32 8c-10 0-11 15-7 24l7 6 7-6c4-9 3-24-7-24z"/><path d="m25 20 7-5 7 5-2 7H27z"/><path class="unit-line" d="M5 17h54M32 3v34M19 22v17m26-17v17M14 49l31 13"/><circle cx="32" cy="17" r="3"/>',
    f16:'<path class="unit-lit" d="M32 2 37 23 57 43 57 48 38 41 38 51 45 58 45 62 32 57 19 62 19 58 26 51 26 41 7 48 7 43 27 23z"/><path d="m32 13 3 13-3 10-3-10z"/><path class="unit-line" d="M32 36v21M16 45l10-7m12 0 10 7"/>'
  };
  const names={tank:'دبابة',soldier:'جندي',helicopter:'هيليكوبتر',f16:'F-16'};
  const icon=type=>`<svg viewBox="0 0 64 64" aria-hidden="true">${symbols[type]}</svg>`;
  const tools=document.createElement('div');tools.className='tactical-tools';tools.dir='rtl';tools.setAttribute('role','toolbar');tools.setAttribute('aria-label','أدوات غرفة العمليات');
  const toolIcons={pan:'<path d="M12 3v18M3 12h18m-12-6 3-3 3 3m-9 3-3 3 3 3m12-6 3 3-3 3m-9 3 3 3 3-3"/>',pen:'<path d="m4 16-1 5 5-1L20 8l-4-4zM13 7l4 4M4 16l4 4"/>',eraser:'<path d="m4 13 9-9a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3L10 21H7l-3-4a3 3 0 0 1 0-4ZM9 8l8 8M10 21h11"/>'};
  const lineIcon=path=>`<svg class="board-line-icon" viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
  tools.innerHTML=`<div class="tactical-workbench-head"><span>لوحة العمليات <small>MISSION CONTROL</small></span><span class="board-local-label"><i></i>مساحة تخطيطك</span></div><div class="tactical-draw-panel"><span class="tactical-panel-label">01 / أدوات الرسم</span><div class="tactical-group tactical-modes">${Object.keys(toolIcons).map(type=>`<button type="button" data-tool="${type}" aria-pressed="${type==='pan'}">${lineIcon(toolIcons[type])}<span>${{pan:'تحريك',pen:'قلم',eraser:'ممحاة'}[type]}</span></button>`).join('')}</div><div class="tactical-pen-settings"><div class="tactical-group tactical-colors" role="group" aria-label="لون القلم">${['#ff9b3a','#f0e9d4','#67d3e8','#8be198','#f16472'].map((color,i)=>`<button type="button" data-color="${color}" style="--pen-color:${color}" aria-label="${['برتقالي','أبيض','أزرق','أخضر','أحمر'][i]}" title="${['برتقالي','أبيض','أزرق','أخضر','أحمر'][i]}" aria-pressed="${i===0}"></button>`).join('')}</div><div class="tactical-group tactical-widths" role="group" aria-label="سمك القلم">${[2,4,8].map(n=>`<button type="button" data-width="${n}" style="--stroke-size:${n}px" aria-label="سمك القلم ${n}" aria-pressed="${n===4}"><i aria-hidden="true"></i><small>${n}</small></button>`).join('')}</div></div></div><div class="tactical-unit-panel"><div class="tactical-unit-heading"><span class="tactical-panel-label">02 / وحدات الميدان</span><div class="tactical-group tactical-teams" role="group" aria-label="جهة المعدات"><button type="button" data-team="friendly" aria-pressed="true"><i></i>معدات صديقة</button><button type="button" data-team="enemy" aria-pressed="false"><i></i>معدات العدو</button></div></div><div class="tactical-group tactical-pieces">${Object.keys(symbols).map(type=>`<button type="button" data-tool="${type}" draggable="true" aria-pressed="false" title="${names[type]} — اختر ثم اضغط على الخريطة، أو اسحب إليها">${icon(type)}<span>${names[type]}</span></button>`).join('')}</div></div><div class="tactical-board-actions"><span>ارسم الخطة. وزّع وحداتك.</span><div class="tactical-group"><button type="button" data-board="undo" aria-label="تراجع" title="تراجع">${lineIcon('<path d="m9 4-5 5 5 5M4 9h9a7 7 0 0 1 0 14"/>')}</button><button type="button" data-board="redo" aria-label="إعادة" title="إعادة">${lineIcon('<path d="m15 4 5 5-5 5m5-5h-9a7 7 0 0 0 0 14"/>')}</button><button type="button" data-board="clear">مسح اللوحة</button></div></div>`;
  viewport.append(tools);
  const canvas=document.createElement('canvas');canvas.className='tactical-ink';canvas.width=1240;canvas.height=1269;canvas.setAttribute('aria-hidden','true');world.append(canvas);
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const unitsLayer=document.createElement('div');unitsLayer.className='tactical-units';world.append(unitsLayer);
  const status=document.createElement('div');status.className='tactical-status';status.dir='rtl';status.innerHTML='<span class="tactical-hint">اسحب الخريطة للاستكشاف، أو اختر أداة لبدء التخطيط.</span><span class="tactical-selection" hidden><b></b><button type="button" data-board="rotate-back" aria-label="تدوير لليسار">↶</button><label class="unit-direction"><span>الاتجاه</span><input type="range" min="0" max="359" value="0" step="1" aria-label="اتجاه الوحدة بالدرجات"><output dir="ltr">000°</output></label><button type="button" data-board="rotate" aria-label="تدوير لليمين">↷</button><button type="button" data-board="delete">حذف الوحدة</button></span><span class="tactical-count" dir="ltr">0 UNITS</span>';
  viewport.append(status);
  const radar=document.createElement('div');radar.className='tactical-radar';radar.innerHTML='<div class="radar-screen" aria-hidden="true"><img data-src="assets/images/city-map-detail.webp" alt=""><div class="radar-grid"></div><div class="radar-sweep"></div><svg class="radar-contacts" viewBox="0 0 100 100"></svg><span class="radar-cursor" hidden></span></div><span>TACTICAL RADAR <b>BOARD SIGNALS</b></span>';
  viewport.append(radar);
  let state={strokes:[],units:[]},history=[],future=[],tool='pan',team='friendly',color='#ff9b3a',width=4,selected=null,gesture=null,paint=0,sequence=0,rotating=false;
  const unitNodes=new Map();
  const teamColor=side=>side==='enemy'?'#ff6575':'#65beff';
  const teamName=side=>side==='enemy'?'عدو':'صديق';
  const clone=()=>JSON.parse(JSON.stringify(state));
  const inside=p=>p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100;
  const limit=p=>({x:Math.max(0,Math.min(100,p.x)),y:Math.max(0,Math.min(100,p.y))});
  const snapshot=()=>{history.push(clone());if(history.length>40)history.shift();future=[];};
  function updateControls(){
    tools.querySelector('[data-board="undo"]').disabled=!history.length;tools.querySelector('[data-board="redo"]').disabled=!future.length;tools.querySelector('[data-board="clear"]').disabled=!state.strokes.length&&!state.units.length;
    const unit=state.units.find(unit=>unit.id===selected),bar=status.querySelector('.tactical-selection');bar.hidden=!unit;if(unit)bar.querySelector('b').textContent=`${names[unit.type]} / ${teamName(unit.team)}`;
    const direction=status.querySelector('.unit-direction');if(unit){direction.querySelector('input').value=String(unit.angle);direction.querySelector('output').textContent=`${String(Math.round(unit.angle)).padStart(3,'0')}°`;}
    status.querySelector('.tactical-count').textContent=`${state.units.length} UNITS`;
  }
  function drawInk(){
    paint=0;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineJoin='round';
    for(const stroke of state.strokes){
      ctx.globalCompositeOperation=stroke.erase?'destination-out':'source-over';ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;ctx.lineWidth=stroke.width/100*canvas.width;
      ctx.beginPath();const first=stroke.points[0];ctx.moveTo(first.x/100*canvas.width,first.y/100*canvas.height);
      if(stroke.points.length===1){ctx.arc(first.x/100*canvas.width,first.y/100*canvas.height,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}
      else{for(const point of stroke.points.slice(1))ctx.lineTo(point.x/100*canvas.width,point.y/100*canvas.height);ctx.stroke();}
    }
    ctx.globalCompositeOperation='source-over';updateControls();
  }
  function queueInk(){if(!paint)paint=requestAnimationFrame(drawInk);}
  function drawUnits(){
    for(const [id,node] of unitNodes)if(!state.units.some(unit=>unit.id===id)){node.remove();unitNodes.delete(id);}
    for(const unit of state.units){
      let node=unitNodes.get(unit.id);
      if(!node){node=document.createElement('button');node.type='button';node.className='tactical-unit';node.dataset.unit=unit.id;node.innerHTML=icon(unit.type);node.setAttribute('aria-label',`${names[unit.type]} — اسحب للتحريك، الأسهم للتحريك، R للتدوير، Delete للحذف`);unitsLayer.append(node);unitNodes.set(unit.id,node);}
      node.dataset.team=unit.team||'friendly';node.style.setProperty('--unit-color',teamColor(unit.team));node.setAttribute('aria-label',`${names[unit.type]} — ${teamName(unit.team)}. اسحب للتحريك، R للتدوير، Delete للحذف`);
      node.style.left=`${unit.x}%`;node.style.top=`${unit.y}%`;node.style.setProperty('--unit-angle',`${unit.angle}deg`);node.setAttribute('aria-pressed',String(selected===unit.id));
    }
    const contacts=radar.querySelector('.radar-contacts');contacts.replaceChildren();
    for(const unit of state.units){const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',unit.x);dot.setAttribute('cy',unit.y);dot.setAttribute('r',unit.id===selected?'2.4':'1.5');dot.setAttribute('fill',teamColor(unit.team));contacts.append(dot);}
    updateControls();
  }
  function setTool(next){tool=next;viewport.dataset.mode=next;tools.dataset.mode=next;tools.querySelectorAll('[data-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tool===next)));status.querySelector('.tactical-hint').textContent=next==='pan'?'اسحب الخريطة، أو اسحب أي وحدة لتحريكها.':next==='pen'?'اكتب أو ارسم فوق الخريطة.':next==='eraser'?'امسح الرسم أو مرّر الممحاة على وحدة لإزالتها.':`اضغط على الخريطة لوضع ${names[next]}.`;}
  function place(type,point){if(!inside(point)||!symbols[type])return;snapshot();const unit={id:`unit-${++sequence}`,type,team,...point,angle:0};state.units.push(unit);selected=unit.id;drawUnits();setTool('pan');}
  function eraseUnits(point){const radius=22/world.getBoundingClientRect().width*100;state.units=state.units.filter(unit=>Math.hypot(unit.x-point.x,unit.y-point.y)>radius);drawUnits();}
  tools.querySelectorAll('[data-tool]').forEach(button=>{
    const label=names[button.dataset.tool]||{pan:'تحريك الخريطة',pen:'القلم',eraser:'الممحاة'}[button.dataset.tool];button.setAttribute('aria-label',label);button.setAttribute('title',label);
    button.addEventListener('click',()=>setTool(button.dataset.tool));
    if(symbols[button.dataset.tool])button.addEventListener('dragstart',event=>{event.dataTransfer.setData('application/x-mt-unit',button.dataset.tool);event.dataTransfer.effectAllowed='copy';});
  });
  tools.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{color=button.dataset.color;tools.querySelectorAll('[data-color]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));setTool('pen');}));
  tools.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{width=Number(button.dataset.width);tools.querySelectorAll('[data-width]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));setTool('pen');}));
  tools.dataset.team=team;
  tools.querySelectorAll('[data-team]').forEach(button=>button.addEventListener('click',()=>{team=button.dataset.team;tools.dataset.team=team;tools.querySelectorAll('[data-team]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}));
  function action(name){
    if(gesture)return;
    if(name==='undo'&&history.length){future.push(clone());state=history.pop();}
    else if(name==='redo'&&future.length){history.push(clone());state=future.pop();}
    else if(name==='clear'&&(state.strokes.length||state.units.length)){snapshot();state={strokes:[],units:[]};}
    else if(name==='delete'&&selected){snapshot();state.units=state.units.filter(unit=>unit.id!==selected);selected=null;}
    else if((name==='rotate'||name==='rotate-back')&&selected){snapshot();const unit=state.units.find(unit=>unit.id===selected);if(unit)unit.angle=(unit.angle+(name==='rotate'?45:315))%360;}
    drawUnits();queueInk();
  }
  const directionInput=status.querySelector('.unit-direction').querySelector('input');
  directionInput.addEventListener('input',()=>{const unit=state.units.find(unit=>unit.id===selected);if(!unit)return;if(!rotating){snapshot();rotating=true;}unit.angle=Math.max(0,Math.min(359,Number(directionInput.value)||0));drawUnits();});
  ['change','blur'].forEach(type=>directionInput.addEventListener(type,()=>{rotating=false;}));
  [tools,status].forEach(parent=>parent.querySelectorAll('[data-board]').forEach(button=>button.addEventListener('click',()=>action(button.dataset.board))));
  viewport.addEventListener('dragover',event=>{if([...event.dataTransfer.types].includes('application/x-mt-unit')){event.preventDefault();event.dataTransfer.dropEffect='copy';}});
  viewport.addEventListener('drop',event=>{const type=event.dataTransfer.getData('application/x-mt-unit');if(!symbols[type])return;event.preventDefault();place(type,map.pointAt(event));});
  viewport.addEventListener('pointerdown',event=>{
    if(event.button!==0||gesture)return;
    const unitNode=event.target.closest('[data-unit]');
    if(event.target.closest('button,input,select,.tactical-tools,.tactical-status')&&!unitNode)return;
    const point=map.pointAt(event);if(!inside(point))return;
    if(symbols[tool]){viewport.focus({preventScroll:true});place(tool,point);return;}
    if(unitNode&&tool!=='eraser'){
      const unit=state.units.find(unit=>unit.id===unitNode.dataset.unit);if(!unit)return;
      snapshot();selected=unit.id;gesture={kind:'unit',id:event.pointerId,unit,offset:{x:unit.x-point.x,y:unit.y-point.y}};drawUnits();
    }else if(tool==='pen'||tool==='eraser'){
      snapshot();const stroke={erase:tool==='eraser',color,width:(tool==='eraser'?30:width)/world.getBoundingClientRect().width*100,points:[point]};state.strokes.push(stroke);gesture={kind:'ink',id:event.pointerId,stroke};if(stroke.erase)eraseUnits(point);queueInk();
    }else return;
    event.preventDefault();(unitNode||viewport).focus({preventScroll:true});viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove',event=>{
    if(!gesture||gesture.id!==event.pointerId)return;const point=limit(map.pointAt(event));
    if(gesture.kind==='unit'){Object.assign(gesture.unit,limit({x:point.x+gesture.offset.x,y:point.y+gesture.offset.y}));drawUnits();}
    else{const points=gesture.stroke.points,last=points.at(-1);if(Math.hypot(point.x-last.x,point.y-last.y)>.12){points.push(point);queueInk();}if(gesture.stroke.erase)eraseUnits(point);}
  });
  function finish(event){if(!gesture||gesture.id!==event.pointerId)return;if(event.type==='pointercancel'){state=history.pop();drawUnits();queueInk();}gesture=null;if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);updateControls();}
  viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',finish);viewport.addEventListener('lostpointercapture',event=>{if(gesture?.id===event.pointerId){gesture=null;updateControls();}});
  unitsLayer.addEventListener('focusin',event=>{const unit=event.target.closest('[data-unit]');if(unit){selected=unit.dataset.unit;drawUnits();}});
  unitsLayer.addEventListener('keydown',event=>{
    const unit=state.units.find(unit=>unit.id===event.target.dataset.unit);if(!unit)return;selected=unit.id;
    if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();action('delete');}
    else if(event.key.toLowerCase()==='r'){event.preventDefault();action('rotate');}
    else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();snapshot();const step=event.shiftKey?3:1;Object.assign(unit,limit({x:unit.x+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),y:unit.y+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0)}));drawUnits();}
  });
  section.addEventListener('mtrp:mapcursor',event=>{const point=event.detail,dot=radar.querySelector('.radar-cursor');dot.hidden=!point;if(point){dot.style.left=`${point.x}%`;dot.style.top=`${point.y}%`;}});
  section.addEventListener('keydown',event=>{if(event.target.matches('input,textarea,select'))return;if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();action(event.shiftKey?'redo':'undo');}else if(event.key==='Escape'){setTool('pan');}});
  addEventListener('pagehide',()=>{cancelAnimationFrame(paint);paint=0;gesture=null;});addEventListener('pageshow',()=>{queueInk();drawUnits();});
  setTool('pan');drawUnits();
})();
