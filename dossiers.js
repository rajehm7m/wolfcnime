(() => {
  'use strict';
  const hero=document.querySelector('#home'),stage=hero?.querySelector('.character-stage'),files=window.MT_DOSSIERS;
  if(!stage||!files?.length)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  stage.removeAttribute('aria-hidden');
  const trigger=document.createElement('button');trigger.className='dossier-trigger';trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','dossier-dialog');
  trigger.innerHTML='<span class="dossier-cue"><i aria-hidden="true">+</i><span>OPEN DOSSIER<small>كشف الملف</small></span><b aria-hidden="true">↗</b></span>';
  stage.append(trigger);
  const dialog=document.createElement('dialog');dialog.id='dossier-dialog';dialog.className='dossier-dialog';dialog.setAttribute('aria-labelledby','dossier-name');dialog.dir='ltr';
  dialog.innerHTML='<div class="dossier-sheet"><header class="dossier-top"><span><i aria-hidden="true"></i> MT — RESTRICTED ARCHIVE</span><button class="dossier-close" type="button" aria-label="إغلاق الملف">×</button></header><div class="dossier-body"></div><div class="dossier-bottom"><span>MYSTERY TOWN / PERSONNEL</span><span class="dossier-file-number"></span></div></div>';
  document.body.append(dialog);
  const sheet=dialog.querySelector('.dossier-sheet'),body=dialog.querySelector('.dossier-body'),closeButton=dialog.querySelector('.dossier-close');
  let closing=false,animation=null,version=0,held=false,sealedTargets=[];
  function unseal(){if(sealedTargets.length)document.dispatchEvent(new CustomEvent('mtrp:cipherseal',{detail:{targets:sealedTargets,enabled:false}}));sealedTargets=[];}
  function sync(){trigger.disabled=held||hero.dataset.transitioning==='true';trigger.setAttribute('aria-label',`فتح ملف ${files[Number(hero.dataset.scene)||0].name}`);}
  function open(){
    if(trigger.disabled||dialog.open||document.body.classList.contains('intro-active'))return;
    const file=files[Number(hero.dataset.scene)||0];if(!file)return;
    version++;closing=false;unseal();sheet.style.setProperty('--dossier-tone',file.tone);
    sheet.style.setProperty('--dossier-mask',`url("assets/images/${file.image}")`);
    const anonymous=file.name==='ANONYMOUS';dialog.classList.toggle('is-anonymous',anonymous);
    body.innerHTML=`<div class="dossier-portrait"><span class="dossier-ghost" aria-hidden="true">${escape(file.code)}</span><div class="dossier-target" aria-hidden="true"><i></i><i></i><i></i><i></i></div><img src="assets/images/${escape(file.image)}" alt="${escape(file.name)}" width="1024" height="1536"><div class="dossier-scan" aria-hidden="true"></div><span class="dossier-portrait-id">${escape(file.code)} / SUBJECT RECORD</span></div><div class="dossier-copy"><div class="dossier-classification">${escape(file.classification)}</div><h2 id="dossier-name">${escape(file.name)}</h2><div class="dossier-unit" dir="rtl"><span>الجهة</span><strong>${escape(file.unit)}</strong></div><h3 dir="rtl">${escape(file.title)}</h3><p class="dossier-intro" dir="rtl">${escape(file.intro)}</p>${anonymous?'':`<div class="dossier-redactions" dir="rtl" aria-label="مفاتيح الملف">${file.words.map((word,i)=>`<span style="--reveal-delay:${900+i*240}ms">${escape(word)}</span>`).join('')}</div>`}<ol class="dossier-brief" dir="rtl">${file.brief.map((line,i)=>`<li style="--row-delay:${220+i*100}ms"><small>${String(i+1).padStart(2,'0')}</small><span>${escape(line)}</span></li>`).join('')}</ol><div class="dossier-quote">${escape(file.quote)}</div></div>`;
    dialog.querySelector('.dossier-file-number').textContent=`FILE / ${file.code}`;
    document.body.classList.add('dossier-open');dialog.showModal();
    if(anonymous){
      dialog.setAttribute('aria-label','ملف مجهول الهوية — بيانات مشفرة');dialog.removeAttribute('aria-labelledby');body.setAttribute('aria-hidden','true');
      sealedTargets=[...dialog.querySelectorAll('.dossier-top>span,.dossier-ghost,.dossier-portrait-id,.dossier-classification,.dossier-copy h2,.dossier-unit>span,.dossier-unit>strong,.dossier-copy h3,.dossier-intro,.dossier-redactions>span,.dossier-brief li>small,.dossier-brief li>span,.dossier-quote,.dossier-bottom>span')];
      document.dispatchEvent(new CustomEvent('mtrp:cipherseal',{detail:{targets:sealedTargets,enabled:true}}));
    }else{dialog.removeAttribute('aria-label');dialog.setAttribute('aria-labelledby','dossier-name');body.removeAttribute('aria-hidden');}
    document.dispatchEvent(new CustomEvent('mtrp:dossierstate',{detail:{open:true}}));
    if(!reduced.matches){
      const from=trigger.getBoundingClientRect(),to=sheet.getBoundingClientRect();
      const dx=Math.max(-180,Math.min(180,from.left+from.width/2-to.left-to.width/2));
      animation=sheet.animate([{opacity:0,transform:`translate(${dx}px,24px) scale(.9)`},{opacity:1,transform:'translate(0,0) scale(1)'}],{duration:680,easing:'cubic-bezier(.16,1,.3,1)'});
    }
    closeButton.focus({preventScroll:true});
  }
  async function close(){
    if(!dialog.open||closing)return;
    closing=true;const token=++version;animation?.cancel();
    if(!reduced.matches){animation=sheet.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(16px)'}],{duration:210,easing:'ease-in'});await animation.finished.catch(()=>{});}
    if(token!==version)return;
    dialog.close();unseal();animation?.cancel();animation=null;document.body.classList.remove('dossier-open');closing=false;
    document.dispatchEvent(new CustomEvent('mtrp:dossierstate',{detail:{open:false}}));
    if(!trigger.disabled)trigger.focus({preventScroll:true});
  }
  trigger.addEventListener('click',open);closeButton.addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  // Native modal focus handling plus restoration on a programmatic close.
  dialog.addEventListener('close',()=>{unseal();document.body.classList.remove('dossier-open');});
  document.addEventListener('mtrp:scenewillchange',sync);document.addEventListener('mtrp:scenechange',sync);
  document.addEventListener('mtrp:chapterstate',event=>{held=event.detail.active;sync();});
  reduced.addEventListener('change',()=>animation?.cancel());
  addEventListener('pagehide',()=>{version++;animation?.cancel();if(dialog.open)dialog.close();document.body.classList.remove('dossier-open');closing=false;});
  sync();
})();
