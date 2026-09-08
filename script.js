(() => {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = preference.matches;
  const menu = $('.menu-toggle'), nav = $('#navigation');
  const closeMenu = () => { nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu'; };
  menu.addEventListener('click', () => {const open = nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close':'Menu';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('header'))closeMenu();});
  $$('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
    const target=document.getElementById(link.hash.slice(1));if(!target)return;e.preventDefault();closeMenu();
    target.scrollIntoView({behavior:reduced?'instant':'smooth'});history.pushState(null,'',link.hash);
    target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
  }));
  const tabs=$$('[role="tab"]'),panels=$$('[role="tabpanel"]');
  function select(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});if(focus)tabs[index].focus();}
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',e=>{let n;if(['ArrowDown','ArrowRight'].includes(e.key))n=(index+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))n=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(n,true);});
  });
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});$$('.reveal').forEach(e=>observer.observe(e));document.documentElement.classList.toggle('ready',!reduced);}
  const planes=$$('[data-parallax]');const navLinks=$$('#navigation a');let metrics=[],locations=[],frame=0,last=0;
  function measure(){metrics=planes.map(el=>{const host=el.closest('section');return{el,top:host.getBoundingClientRect().top+scrollY,height:host.offsetHeight,speed:Number(el.dataset.parallax),value:0};});locations=navLinks.map(link=>({link,top:document.querySelector(link.hash).getBoundingClientRect().top+scrollY}));schedule();}
  function update(time){frame=0;const dt=last?Math.min(64,time-last):16;last=time;let moving=false;const damping=1-Math.exp(-dt/100);
    metrics.forEach(m=>{const p=Math.min(1,Math.max(0,(scrollY-m.top)/Math.max(1,m.height-innerHeight)));const target=reduced?0:p*m.speed;m.value+=(target-m.value)*damping;if(Math.abs(target-m.value)>.1)moving=true;else m.value=target;m.el.style.transform=`translate3d(0,${m.value.toFixed(2)}px,0)`;});
    const active=locations.filter(x=>x.top<=scrollY+innerHeight*.35).at(-1)||locations[0];locations.forEach(x=>{if(x===active)x.link.setAttribute('aria-current','location');else x.link.removeAttribute('aria-current');});
    $('#runner').style.setProperty('--rotation',reduced?'0deg':`${Math.min(180,scrollY*.08)}deg`);
    if(moving)frame=requestAnimationFrame(update);else last=0;
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});addEventListener('load',measure);addEventListener('pageshow',measure);
  preference.addEventListener('change',e=>{reduced=e.matches;document.documentElement.classList.toggle('ready',!reduced);schedule();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else measure();});measure();
})();
