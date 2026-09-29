const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
const validation=source.slice(source.indexOf('function validDate('),source.indexOf("document.addEventListener('click'"));
const ctx=vm.createContext({Date,Set,Number,JSON,Error});
vm.runInContext(`const dateKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const parseDate=s=>new Date(s+'T12:00:00');${validation}`,ctx);
const valid=()=>({schemaVersion:1,name:'Alex',tasks:[],events:[],habits:[],meals:{},water:{},waterGoal:8});
test('backup vazio preserva os formatos de coleções',()=>assert.equal(ctx.validateState(valid()).schemaVersion,1));
test('rejeita datas impossíveis e aceita ano bissexto',()=>{assert.equal(ctx.validDate('2026-02-30'),false);assert.equal(ctx.validDate('2024-02-29'),true);});
test('não permite campos de texto nos identificadores usados pelo DOM',()=>{const s=valid();s.tasks.push({id:'" onclick="alert(1)',title:'Tarefa',date:'2026-09-29',priority:'alta',category:'Pessoal',done:false});assert.throws(()=>ctx.validateState(s));});
test('rejeita horário invertido e identificadores duplicados',()=>{const s=valid();s.events.push({id:'e1',title:'Agenda',date:'2026-09-29',start:'15:00',end:'14:00',color:'green',category:'Pessoal',notes:''});assert.throws(()=>ctx.validateState(s));s.events[0].end='16:00';assert.doesNotThrow(()=>ctx.validateState(s));s.events.push({...s.events[0]});assert.throws(()=>ctx.validateState(s));});
test('rejeita metas fora dos limites e backups de outro formato',()=>{const s=valid();s.waterGoal=0;assert.throws(()=>ctx.validateState(s));assert.throws(()=>ctx.validateState({tasks:[]}));});
test('refeições e registros diários aceitam apenas datas e campos conhecidos',()=>{const s=valid();s.meals['2026-09-29']={0:'Fruta',1:'Almoço'};s.water['2026-09-29']=3;assert.doesNotThrow(()=>ctx.validateState(s));s.meals['2026-09-29'].admin='x';assert.throws(()=>ctx.validateState(s));});
test('regras negam acesso anônimo e condicionam os dados ao UID',()=>{const rules=JSON.parse(fs.readFileSync(path.join(__dirname,'../database.rules.json'),'utf8')).rules;assert.equal(rules['.read'],false);assert.equal(rules['.write'],false);const workspace=rules.ritmo.users.$uid.workspace;assert.match(workspace['.read'],/auth.uid === \$uid/);assert.match(workspace['.write'],/auth.uid === \$uid/);assert.ok(workspace['.validate'].includes("data.child('revision').val() + 1"));});

// A publicação deve incluir todos os recursos locais, inclusive o SDK de login.
test('pacote inclui módulos, ícones e todos os recursos do cache offline',()=>{
  const root=path.join(__dirname,'..');
  for(const file of ['vendor/firebase.js','vendor/native.js'])assert.ok(fs.statSync(path.join(root,file)).size>0,`Recurso ausente: ${file}`);
  const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  const files=JSON.parse(worker.match(/const FILES=(\[[^;]+\])\.map/)[1]);
  for(const file of files)assert.ok(fs.existsSync(path.join(root,file)),`Recurso offline ausente: ${file}`);
});
