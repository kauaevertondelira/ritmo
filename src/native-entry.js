import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

if(Capacitor.isNativePlatform()){
  document.documentElement.dataset.platform='android';
  const applyTheme=async()=>{
    try{
      const dark=document.documentElement.dataset.theme==='dark';
      await StatusBar.setStyle({style:dark?Style.Dark:Style.Light});
      await StatusBar.setBackgroundColor({color:dark?'#191c1b':'#f6f5f1'});
    }catch{/* System bar styling varies by Android version. */}
  };
  window.addEventListener('ritmo-theme-change',applyTheme);
  void applyTheme();
  App.addListener('backButton',({canGoBack})=>{
    const dialog=document.querySelector('dialog[open]');
    if(dialog){if(dialog.id==='dialog')window.RitmoApp?.closeDialog();else dialog.close();return;}
    if(canGoBack)history.back();
    else if(location.hash&&location.hash!=='#inicio')location.hash='inicio';
    else App.minimizeApp();
  });
  App.addListener('appStateChange',({isActive})=>{if(isActive)window.dispatchEvent(new Event('focus'));});
  window.RitmoDevice={
    async exportBackup(data,name){
      // Keep files available after the share sheet closes: recipients may read
      // them later. Only expire old copies on a subsequent export.
      const previous=await Filesystem.readdir({path:'ritmo-backups',directory:Directory.Cache}).catch(()=>({files:[]}));
      for(const file of previous.files){
        if(file.type==='file'&&file.mtime<Date.now()-86400000)await Filesystem.deleteFile({path:`ritmo-backups/${file.name}`,directory:Directory.Cache}).catch(()=>{});
      }
      const safeName=name.replace(/[^a-zA-Z0-9._-]/g,'-');
      const result=await Filesystem.writeFile({path:`ritmo-backups/${safeName}`,data:JSON.stringify(data,null,2),directory:Directory.Cache,encoding:Encoding.UTF8,recursive:true});
      await Share.share({title:'Backup do Ritmo',files:[result.uri],dialogTitle:'Salvar ou compartilhar backup'});
    }
  };
  window.RitmoInstall?.refresh();
}
