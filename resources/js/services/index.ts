import {storage} from '@/adapters/storage'; import {tickets,equipment,employees,maintenance,inventory} from '@/mocks'; import type {Ticket,Equipment,Employee,Maintenance,InventoryItem,User} from '@/types'
import {moduleSeeds,type ModuleRecord} from '@/mocks/modules'
export const StorageService=storage
export const ModuleService={list(kind:string){return storage.get<ModuleRecord[]>(`module:${kind}`,moduleSeeds[kind]||[])},save(kind:string,items:ModuleRecord[]){storage.set(`module:${kind}`,items)},find(kind:string,id:number){return this.list(kind).find(x=>x.id===id)}}
class Repository<T>{constructor(private key:string,private seed:T[]){} all(){return storage.get(this.key,this.seed)} save(items:T[]){storage.set(this.key,items);return items}}
export const TicketService={...new Repository<Ticket>('tickets',tickets),list(){return storage.get('tickets',tickets)},create(ticket:Ticket){const all=this.list();all.unshift(ticket);storage.set('tickets',all);return ticket},update(id:number,patch:Partial<Ticket>){const all=this.list().map(t=>t.id===id?{...t,...patch}:t);storage.set('tickets',all);return all.find(t=>t.id===id)!},find(id:number){return this.list().find(t=>t.id===id)}}
export const EquipmentService={list:()=>storage.get<Equipment[]>('equipment',equipment),save:(items:Equipment[])=>storage.set('equipment',items),find:(id:number)=>storage.get<Equipment[]>('equipment',equipment).find(e=>e.id===id)}
export const EmployeeService={list:()=>storage.get<Employee[]>('employees',employees)}
export const MaintenanceService={list:()=>storage.get<Maintenance[]>('maintenance',maintenance)}
export const InventoryService={list:()=>storage.get<InventoryItem[]>('inventory',inventory)}
export const AuthService={login(email:string,password:string):User{if(email!=='admin@aeroti.local'||password!=='admin123')throw new Error('E-mail ou senha inválidos. Confira as credenciais.');return{id:1,name:'Lucas Almeida',email,role:'Gestor de TI',department:'Tecnologia da Informação',unit:'Aeroclube de Juiz de Fora'}},logout(){storage.remove('session')}}
export const NotificationService={permission:()=>Promise.resolve('granted' as NotificationPermission)}
export const FileService={pick:()=>Promise.resolve([{name:'anexo-simulado.pdf',size:184000}]),openDataDirectory:()=>Promise.resolve('Ação disponível na versão desktop')}
export const WhatsAppService={send:async(_phone:string,_message:string)=>({id:`mock-${Date.now()}`,status:'sent'}),simulateProtocol:()=>`TI-${Math.floor(250+Math.random()*50)}`}
export const EmailService={send:async(_email:string,_message:string)=>({id:`email-${Date.now()}`,status:'sent'})}
export const ReportService={async exportPdf(title:string,headers:string[],rows:(string|number)[][]){const {jsPDF}=await import('jspdf');const pdf=new jsPDF();pdf.setFontSize(16);pdf.text(`AeroTI - ${title}`,14,18);pdf.setFontSize(9);pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`,14,25);let y=34;pdf.setFont('helvetica','bold');pdf.text(headers.join('  |  ').slice(0,110),14,y);pdf.setFont('helvetica','normal');for(const row of rows){y+=7;if(y>280){pdf.addPage();y=18}pdf.text(row.map(String).join('  |  ').slice(0,120),14,y)}pdf.save(`aeroti-${title.toLowerCase().replaceAll(' ','-')}.pdf`)}}
export const ApiClient={baseUrl:import.meta.env.VITE_API_BASE_URL||'/api',async request(){throw new Error('Backend Laravel ainda não conectado')}}
