'use strict';
(() => {
  let installPrompt=null;
  let installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const native=()=>!!window.Capacitor?.isNativePlatform?.();
  const info=document.createElement('dialog');info.className='install-dialog';info.setAttribute('aria-label','Instalar o Ritmo');
  info.innerHTML='<div class="dialog-heading"><h2>Seu ritmo, sempre por perto.</h2><button class="icon-button" type="button" data-install-close aria-label="Fechar instruções">×</button></div><p id="install-description" class="section-intro"></p><ol class="install-steps"><li><strong>No computador:</strong> abra o endereço publicado no Chrome ou Edge e use o ícone de instalação na barra de endereço ou a opção “Instalar este site como aplicativo” do menu.</li><li><strong>No Android:</strong> abra no Chrome e escolha “Instalar app” ou “Adicionar à tela inicial”. O APK pode ser instalado separadamente.</li><li><strong>No iPhone:</strong> abra no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.</li></ol><p class="hint">O aplicativo abre em uma janela própria. Para entrar na conta e sincronizar, conecte-se à internet. No computador, o navegador pode oferecer a criação de um atalho na área de trabalho.</p><div class="form-actions"><button class="btn primary" data-install-close>Entendi</button></div>';
  document.body.append(info);
  function refresh(){
    document.querySelectorAll('[data-install-app]').forEach(button=>{button.hidden=native();button.textContent=installed?'Aplicativo instalado':'Instalar aplicativo';button.disabled=installed;});
    const description=document.querySelector('[data-install-description]');
    if(description)description.textContent=native()?'Você está usando o aplicativo Android.':installed?'O Ritmo já está aberto como aplicativo.':'Adicione o Ritmo ao computador ou à tela inicial do celular. Ele abre em uma janela própria.';
  }
  function help(){document.querySelector('#install-description').textContent=installed?'Este dispositivo já está usando a versão instalada.':'Instale pelo navegador para abrir o Ritmo diretamente, como um aplicativo.';info.showModal();}
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;refresh();});
  window.addEventListener('appinstalled',()=>{installed=true;installPrompt=null;refresh();});
  document.addEventListener('click',async event=>{
    if(event.target.closest('[data-install-close]'))info.close();
    if(!event.target.closest('[data-install-app]'))return;
    if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted'){installed=true;refresh();}}catch{help();}}
    else help();
  });
  window.RitmoInstall={refresh};refresh();
  // Cache only the public application shell. Tokens, accounts and database
  // responses must never enter a service-worker cache.
  if('serviceWorker' in navigator&&window.isSecureContext&&!native()){
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(registration=>{
      const announce=()=>{
        if(!registration.waiting)return;
        const note=document.querySelector('[data-install-description]');
        if(note)note.textContent+=' Há uma atualização pronta. Feche todas as janelas e abas do Ritmo e abra novamente para recebê-la.';
      };
      const originalRefresh=window.RitmoInstall.refresh;
      window.RitmoInstall.refresh=()=>{originalRefresh();announce();};
      announce();
      registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',announce));
      return registration.update();
    }).catch(()=>{});
  }
})();
