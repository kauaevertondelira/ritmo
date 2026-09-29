import { firebaseConfig } from './firebase-config.js';

// Firebase SDK modular, versão fixa. Nenhuma chave administrativa no cliente.

const messages = {
  'auth/invalid-credential':'E-mail ou senha incorretos.',
  'auth/invalid-login-credentials':'E-mail ou senha incorretos.',
  'auth/user-not-found':'E-mail ou senha incorretos.',
  'auth/wrong-password':'E-mail ou senha incorretos.',
  'auth/email-already-in-use':'Este e-mail já possui uma conta. Use Entrar.',
  'auth/invalid-email':'Informe um e-mail válido.',
  'auth/weak-password':'Escolha uma senha mais forte, com pelo menos 8 caracteres.',
  'auth/too-many-requests':'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/network-request-failed':'Não foi possível acessar o Firebase. Confira a conexão.',
  'auth/operation-not-allowed':'Ative E-mail/senha em Firebase Authentication → Sign-in method.',
  'auth/configuration-not-found':'Configure o Firebase Authentication e habilite E-mail/senha no console.',
  'auth/unauthorized-domain':'Adicione o domínio deste site em Authentication → Settings → Authorized domains.',
  'auth/requires-recent-login':'Entre novamente para continuar.',
  'PERMISSION_DENIED':'O banco recusou o acesso. Confira as regras do Realtime Database.',
  'permission_denied':'O banco recusou o acesso. Confira as regras do Realtime Database.'
};
function friendly(error){const result=new Error(messages[error.code]||`Não foi possível concluir a operação no Firebase (${error.code||'conexão indisponível'}).`);result.code=error.code;return result;}
function emit(name){window.dispatchEvent(new Event(name));}
try {
  const {appSDK, authSDK, dbSDK} = await import('./vendor/firebase.js');
  const app = appSDK.initializeApp(firebaseConfig);
  const auth = authSDK.getAuth(app);
  const db = dbSDK.getDatabase(app);
  // Installed apps retain the session across launches; ordinary browser tabs
  // retain the existing session-only behavior. Logout clears either mode.
  const installed=matchMedia('(display-mode: standalone)').matches||window.Capacitor?.isNativePlatform?.();
  await authSDK.setPersistence(auth,installed?authSDK.indexedDBLocalPersistence:authSDK.browserSessionPersistence);
  let stopListening=null, cached=null, listenerError=null, manualAuth=false, connected=false;
  const workspaceRef=()=>{if(!auth.currentUser)throw new Error('Entre na sua conta para continuar.');return dbSDK.ref(db,`ritmo/users/${auth.currentUser.uid}/workspace`);};
  const decode=value=>value?{data:JSON.parse(value.payload),revision:value.revision}:null;
  dbSDK.onValue(dbSDK.ref(db,'.info/connected'), snap=>{connected=snap.val()===true;emit('ritmo-connection');});
  const cloud = {
    configured:true,
    get signedIn(){return !!auth.currentUser;},
    get email(){return auth.currentUser?.email||'';},
    get userId(){return auth.currentUser?.uid||null;},
    get connected(){return connected;},
    async login(email,password){manualAuth=true;try{await authSDK.signInWithEmailAndPassword(auth,email,password);}catch(e){throw friendly(e);}finally{manualAuth=false;}},
    async signup(email,password){manualAuth=true;try{await authSDK.createUserWithEmailAndPassword(auth,email,password);return true;}catch(e){throw friendly(e);}finally{manualAuth=false;}},
    async logout(){manualAuth=true;try{await authSDK.signOut(auth);}catch(e){throw friendly(e);}finally{manualAuth=false;}},
    async recover(email){try{await authSDK.sendPasswordResetEmail(auth,email);}catch(e){throw friendly(e);}},
    async load(){try{const snapshot=await dbSDK.get(workspaceRef());return decode(snapshot.val());}catch(e){throw friendly(e);}},
    async save(data,expectedRevision){
      if(!connected)throw new Error('Você está sem conexão com o banco. Sua alteração não foi enviada; tente novamente quando a conexão voltar.');
      const target=workspaceRef();
      try {
        // A transaction compares revisions atomically. Another device cannot
        // silently overwrite the version that this form was based on.
        const result=await dbSDK.runTransaction(target,current=>{
          if(current && current.revision!==expectedRevision)return;
          // Firebase may initially call this with null before its cache fills.
          // The server retries against the real value before accepting a write.
          return {payload:JSON.stringify(data),revision:expectedRevision+1,updatedAt:dbSDK.serverTimestamp()};
        },{applyLocally:false});
        if(!result.committed){const conflict=new Error('Há alterações de outro dispositivo. Seus dados foram atualizados; revise e tente novamente.');conflict.conflict=true;throw conflict;}
        cached=decode(result.snapshot.val());return cached;
      }catch(e){if(e.conflict)throw e;throw friendly(e);}
    },
    get latest(){return cached;},
    get listenerError(){return listenerError;}
  };
  window.RitmoCloud=cloud;
  authSDK.onAuthStateChanged(auth,user=>{
    stopListening?.();cached=null;listenerError=null;
    if(user){stopListening=dbSDK.onValue(workspaceRef(),snapshot=>{
      try{cached=decode(snapshot.val());listenerError=null;emit('ritmo-remote-change');}catch{listenerError=new Error('O formato dos dados da conta é inválido. Restaure um backup válido.');emit('ritmo-sync-error');}
    },error=>{listenerError=friendly(error);emit('ritmo-sync-error');});}
    else stopListening=null;
    if(!manualAuth)emit('ritmo-cloud-ready');
  });
} catch(error) {
  window.RitmoCloud={configured:false,signedIn:false,unavailable:true};
  emit('ritmo-cloud-ready');
  console.warn('Firebase indisponível. A demonstração continua acessível.',error.code||error.message);
}
