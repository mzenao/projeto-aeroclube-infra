const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');

function harness(){
  const entries=new Map(),cache=new Map();
  const localStorage={getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key)};
  function load(filename){
    if(cache.has(filename))return cache.get(filename);
    const module={exports:{}};
    const source=fs.readFileSync(filename,'utf8').replaceAll('import.meta.env','({})');
    const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
    function localRequire(name){if(!name.startsWith('@/')&&!name.startsWith('.'))return require(name);const base=name.startsWith('@/')?path.join(root,'resources/js',name.slice(2)):path.resolve(path.dirname(filename),name);return load([base+'.ts',path.join(base,'index.ts'),base].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile()))}
    vm.runInNewContext(output,{module,exports:module.exports,require:localRequire,localStorage,crypto:webcrypto,console},{filename});
    cache.set(filename,module.exports);return module.exports;
  }
  const services=load(path.join(root,'resources/js/services/index.ts'));
  return{...services,entries,load};
}

test('protocolos e IDs não são reutilizados após exclusão e recarga',()=>{
  const {TicketService:t}=harness();
  const base=t.list()[0];
  const create=()=>t.create({...base,...t.nextIdentity()});
  const a=create(),b=create();t.remove(a.id);const c=create();
  assert.notEqual(b.protocol,c.protocol);
  assert.equal(c.id,b.id+1);
  t.list().forEach(item=>t.remove(item.id));
  assert.equal(t.list().length,0);
  const d=create();assert(d.id>c.id);assert.notEqual(d.protocol,c.protocol);
});

test('serviços retornam undefined para IDs ausentes',()=>{
  const h=harness();assert.equal(h.TicketService.find(999999),undefined);assert.equal(h.EquipmentService.find(999999),undefined);assert.equal(h.ModuleService.find('inventory',999999),undefined);
  assert.throws(()=>h.TicketService.update(999999,{status:'Resolvido'}),/não encontrado/);
});

test('nota, anexo e tempo sobrevivem à leitura da persistência',()=>{
  const {TicketService:t}=harness();const id=t.list()[0].id;
  t.update(id,{messages:[{id:1,author:'Teste',text:'Nota interna',internal:true,at:new Date().toISOString()}],attachments:[{id:'a',name:'teste.txt',type:'text/plain',size:2,dataUrl:'data:text/plain;base64,b2k='}],timeEntries:[{id:'b',author:'Teste',minutes:45,at:new Date().toISOString()}]});
  const saved=t.find(id);assert.equal(saved.messages[0].text,'Nota interna');assert.equal(saved.attachments[0].dataUrl,'data:text/plain;base64,b2k=');assert.equal(saved.timeEntries[0].minutes,45);
});

test('mudanças de status registram autor, histórico e data de resolução',()=>{
  const {TicketService:t,StorageService:s}=harness();s.set('session',{name:'Técnico de teste'});const id=t.list()[0].id;
  t.update(id,{status:'Resolvido'});const resolved=t.find(id);assert(Number.isFinite(Date.parse(resolved.resolvedAt)));assert.equal(resolved.history.at(-1).author,'Técnico de teste');assert.match(resolved.history.at(-1).description,/Resolvido/);
  t.update(id,{status:'Aberto'});assert.equal(t.find(id).resolvedAt,undefined);assert.equal(t.find(id).history.length,2);
});

test('equipamentos rejeitam códigos duplicados sem gravar parcialmente',()=>{
  const {EquipmentService:e}=harness();const before=e.list();assert.throws(()=>e.save([...before,{...before[0],id:100,code:before[0].code.toLowerCase()}]),/já cadastrado/);assert.equal(e.list().length,before.length);
});

test('estoque usa quantidade tipada e atualiza o alerta pela mesma fonte',()=>{
  const {ModuleService:m,InventoryService:i}=harness();const items=m.list('inventory');assert.equal(items[1].quantity,3);items[1].quantity=20;m.save('inventory',items);assert.equal(m.find('inventory',2).status,'Normal');assert.equal(i.list()[1].quantity,20);
  items[1].quantity=-1;assert.throws(()=>m.save('inventory',items),/não negativos/);assert.equal(m.find('inventory',2).quantity,20);
});

test('empréstimo rejeita devolução anterior à retirada',()=>{
  const {ModuleService:m}=harness();const items=m.list('loans');items[0].loanedAt='2026-09-12';items[0].dueAt='2026-09-11';assert.throws(()=>m.save('loans',items),/anterior à retirada/);
});

test('editar um registro retornado não altera a semente nem salva implicitamente',()=>{
  const {EquipmentService:e,ModuleService:m}=harness();const item=e.list()[0],name=item.name;item.name='Rascunho';assert.equal(e.list()[0].name,name);const stock=m.list('inventory')[0];stock.quantity=999;assert.equal(m.list('inventory')[0].quantity,18);
});

test('perfil e preferências são persistidos independentemente da sessão',()=>{
  const h=harness(),settings=h.load(path.join(root,'resources/js/services/settings.ts')).SettingsService;
  const user=h.AuthService.login('admin@aeroti.local','admin123');h.StorageService.set('profile',{...user,name:'Nome atualizado',phone:'3232123456',extension:'123'});h.AuthService.logout();assert.equal(h.AuthService.login('admin@aeroti.local','admin123').extension,'123');
  const org=settings.organization();org.name='Aeroclube teste';settings.saveOrganization(org);assert.equal(settings.organization().name,'Aeroclube teste');settings.savePreferences({Notificações:{enabled:[false,true,false],userStatuses:[],value:'teste',mode:'Somente demonstração'}});assert.equal(settings.preferences().Notificações.enabled[0],false);
});

test('data sem horário mantém o dia no fuso local',()=>{
  const dates=harness().load(path.join(root,'resources/js/utils/dates.ts'));assert.equal(dates.parseDate('2026-09-12').getDate(),12);assert.equal(dates.parseDate('03/08/2026 010:20').getHours(),10);assert.equal(dates.parseDate('Expirada'),null);
});
