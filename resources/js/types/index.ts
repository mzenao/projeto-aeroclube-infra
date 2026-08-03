export type Priority='Baixa'|'Média'|'Alta'|'Crítica'
export type TicketStatus='Aberto'|'Aguardando triagem'|'Em atendimento'|'Aguardando funcionário'|'Aguardando peça'|'Agendado'|'Resolvido'|'Cancelado'
export interface User {id:number;name:string;email:string;role:string;department:string;unit:string;avatar?:string}
export interface Ticket {id:number;protocol:string;title:string;description:string;requester:string;department:string;equipment:string;category:string;priority:Priority;status:TicketStatus;technician:string;channel:string;openedAt:string;deadline:string;updatedAt:string;messages?:Message[]}
export interface Message {id:number;author:string;text:string;at:string;internal?:boolean}
export interface Equipment {id:number;code:string;asset:string;name:string;category:string;brand:string;model:string;serial:string;department:string;location:string;owner:string;ip:string;os:string;purchasedAt:string;warranty:string;status:string;tickets:number;lastMaintenance:string}
export interface Employee {id:number;name:string;role:string;department:string;phone:string;email:string;status:string;equipment:number;tickets:number;admission:string}
export interface Maintenance {id:number;equipment:string;type:string;description:string;owner:string;scheduledAt:string;completedAt?:string;cost:number;status:string;notes:string}
export interface InventoryItem {id:number;name:string;sku:string;category:string;quantity:number;minimum:number;unitCost:number;location:string;lastMovement:string}
export interface Toast {id:number;title:string;message:string;type:'success'|'error'|'info'|'warning'}
