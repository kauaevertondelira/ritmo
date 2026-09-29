'use strict';
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let context=null;
  window.RitmoMotion = {
    clear(){context?.revert();context=null;},
    enter(animate){
      if(!animate||reduce.matches||!window.gsap)return;
      context=gsap.context(()=>{
        const title=document.querySelector('.hero-title, .page-heading h1');
        const sections=document.querySelectorAll('.section-reveal, .toolbar, .habit-card, .meal-card, .blog-grid .article-card');
        const tl=gsap.timeline({defaults:{ease:'power3.out'}});
        if(title)tl.from(title,{y:36,opacity:0,duration:.65},0);
        tl.from('.eyebrow, .hero-side, .page-heading .subtitle, .page-heading > .btn',{y:15,opacity:0,duration:.5,stagger:.035},.09);
        if(sections.length)tl.from(sections,{y:20,opacity:0,duration:.5,stagger:.06},.16);
      },document.querySelector('#main'));
    },
    dialog(){if(!reduce.matches&&window.gsap)gsap.fromTo('#dialog',{y:18,opacity:0,scale:.985},{y:0,opacity:1,scale:1,duration:.28,ease:'power3.out',clearProps:'all'});}
  };
  reduce.addEventListener('change',()=>window.RitmoMotion.clear());
  document.addEventListener('pointerover',e=>{
    if(reduce.matches||!window.gsap||e.pointerType==='touch')return;
    const b=e.target.closest('.round-action');if(b&&!b.contains(e.relatedTarget))gsap.to(b,{rotation:-9,scale:1.04,duration:.3,ease:'power2.out'});
  });
  document.addEventListener('pointerout',e=>{
    if(reduce.matches||!window.gsap)return;
    const b=e.target.closest('.round-action');if(b&&!b.contains(e.relatedTarget))gsap.to(b,{rotation:0,scale:1,duration:.35,ease:'power2.out'});
  });
})();
