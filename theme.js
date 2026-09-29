'use strict';
(() => {
  const KEY='ritmo-theme';
  const system=matchMedia('(prefers-color-scheme: dark)');
  let preference='system';
  try { const saved=localStorage.getItem(KEY); if(['light','dark','system'].includes(saved))preference=saved; } catch {}
  function resolved(){return preference==='system'?(system.matches?'dark':'light'):preference;}
  function apply(){
    const theme=resolved();
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#191c1b':'#f6f5f1');
    refreshControls();
    window.dispatchEvent(new CustomEvent('ritmo-theme-change',{detail:{preference,theme}}));
  }
  function refreshControls(){
    document.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===preference)));
    const toggle=document.querySelector('[data-theme-toggle]');
    if(toggle){const dark=resolved()==='dark';toggle.setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo escuro');toggle.setAttribute('title',dark?'Ativar modo claro':'Ativar modo escuro');toggle.dataset.activeTheme=resolved();}
  }
  function set(value){if(!['light','dark','system'].includes(value))return;preference=value;try{localStorage.setItem(KEY,value);}catch{}apply();}
  window.RitmoTheme={set,refreshControls,get preference(){return preference;},get current(){return resolved();}};
  apply();
  system.addEventListener('change',()=>{if(preference==='system')apply();});
  document.addEventListener('DOMContentLoaded',refreshControls);
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-theme-toggle]'))set(resolved()==='dark'?'light':'dark');
    const choice=event.target.closest('[data-theme-choice]');if(choice)set(choice.dataset.themeChoice);
  });
  window.addEventListener('storage',event=>{if(event.key===KEY&&['light','dark','system'].includes(event.newValue)){preference=event.newValue;apply();}});
})();
