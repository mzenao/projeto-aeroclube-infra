<script setup lang="ts">
import {computed,ref,onMounted,onUnmounted} from 'vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import MetricCard from '@/components/dashboard/MetricCard.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import {Ticket,ShieldAlert,Clock3,CheckCircle2,Wrench,MonitorCheck,CalendarClock,PackageMinus,AlertTriangle} from 'lucide-vue-next';
import {useTicketStore} from '@/stores/tickets';
import {EquipmentService,ModuleService} from '@/services';
import {parseDate,formatDate,sameDay} from '@/utils/dates';
const store=useTicketStore(),now=ref(new Date());let timer:ReturnType<typeof setInterval>;
onMounted(()=>{timer=setInterval(()=>{now.value=new Date()},60000)});onUnmounted(()=>clearInterval(timer));
const equipment=computed(()=>EquipmentService.list()),maintenance=computed(()=>ModuleService.list('maintenance')),inventory=computed(()=>ModuleService.list('inventory')),infrastructure=computed(()=>ModuleService.list('infrastructure'));
const overdue=computed(()=>maintenance.value.filter(m=>!['Concluída','Cancelada'].includes(m.status)&&(m.status==='Atrasada'||(parseDate(m.scheduledAt)?.getTime()??Infinity)<now.value.getTime())));
const lowStock=computed(()=>inventory.value.filter(m=>m.status==='Estoque baixo'));
const metrics=computed(()=>[
  {label:'Chamados abertos',value:store.items.filter(t=>t.status==='Aberto').length,color:'bg-blue-50 text-blue-600',icon:Ticket,to:'/chamados?status=Aberto'},
  {label:'Críticos pendentes',value:store.items.filter(t=>t.priority==='Crítica'&&!['Resolvido','Cancelado'].includes(t.status)).length,color:'bg-red-50 text-red-600',icon:ShieldAlert,to:'/chamados?priority=Crítica&pending=1'},
  {label:'Em atendimento',value:store.items.filter(t=>t.status==='Em atendimento').length,color:'bg-violet-50 text-violet-600',icon:Clock3,to:'/chamados?status=Em atendimento'},
  {label:'Resolvidos no mês',value:store.items.filter(t=>{const date=parseDate(t.resolvedAt);return t.status==='Resolvido'&&date?.getMonth()===now.value.getMonth()&&date?.getFullYear()===now.value.getFullYear()}).length,color:'bg-emerald-50 text-emerald-600',icon:CheckCircle2,to:'/chamados?status=Resolvido&month=1'},
  {label:'Em manutenção',value:equipment.value.filter(e=>['Em manutenção','Aguardando peça'].includes(e.status)).length,color:'bg-orange-50 text-orange-600',icon:Wrench,to:'/equipamentos?maintenance=1'},
  {label:'Em uso',value:equipment.value.filter(e=>e.status==='Em uso').length,color:'bg-emerald-50 text-emerald-600',icon:MonitorCheck,to:'/equipamentos?status=Em uso'},
  {label:'Manutenções atrasadas',value:overdue.value.length,color:'bg-amber-50 text-amber-600',icon:CalendarClock,to:'/manutencoes?overdue=1'},
  {label:'Estoque baixo',value:lowStock.value.length,color:'bg-red-50 text-red-600',icon:PackageMinus,to:'/estoque?status=Estoque baixo'},
]);
const series=computed(()=>Array.from({length:7},(_,index)=>{const day=new Date(now.value);day.setDate(day.getDate()-6+index);return{day:day.toLocaleDateString('pt-BR',{weekday:'short'}),opened:store.items.filter(t=>sameDay(t.openedAt,day)).length,resolved:store.items.filter(t=>sameDay(t.resolvedAt||'',day)).length}}));
const chartMax=computed(()=>Math.max(1,...series.value.flatMap(day=>[day.opened,day.resolved])));
const equipmentStatuses=computed(()=>[...new Set(equipment.value.map(e=>e.status))].map(status=>({status,count:equipment.value.filter(e=>e.status===status).length})));
const recent=computed(()=>[...store.items].sort((a,b)=>(parseDate(b.updatedAt)?.getTime()??0)-(parseDate(a.updatedAt)?.getTime()??0)).slice(0,5));
const alerts=computed(()=>[
  ...infrastructure.value.filter(r=>['Indisponível','Alerta'].includes(r.status)).map(r=>({id:'infra:'+r.id,title:r.name+' · '+r.status,to:'/infraestrutura/'+r.id})),
  ...overdue.value.map(r=>({id:'maintenance:'+r.id,title:'Manutenção atrasada: '+r.name,to:'/manutencoes/'+r.id})),
  ...lowStock.value.map(r=>({id:'inventory:'+r.id,title:'Estoque baixo: '+r.name,to:'/estoque/'+r.id})),
]);
const upcoming=computed(()=>maintenance.value.filter(m=>!['Concluída','Cancelada'].includes(m.status)).sort((a,b)=>(parseDate(a.scheduledAt)?.getTime()??Infinity)-(parseDate(b.scheduledAt)?.getTime()??Infinity)).slice(0,3));
const problematic=computed(()=>equipment.value.map(e=>({...e,tickets:store.items.filter(t=>t.equipment===e.code).length})).filter(e=>e.tickets>0).sort((a,b)=>b.tickets-a.tickets).slice(0,3));
</script>
<template>
  <PageHeader title="Dashboard" :description="'Visão geral da operação de TI · '+now.toLocaleDateString('pt-BR')"/>
  <div class="grid grid-cols-4 gap-3"><router-link v-for="metric in metrics" :key="metric.label" :to="metric.to" class="rounded-[10px] transition hover:-translate-y-0.5 hover:shadow-md"><MetricCard :label="metric.label" :value="String(metric.value)" hint="Dados dos cadastros" :color="metric.color" :icon="metric.icon"/></router-link></div>
  <div class="mt-3 grid grid-cols-12 gap-3">
    <section class="card col-span-7 p-4"><h2 class="text-sm font-bold">Chamados nos últimos 7 dias</h2><p class="mt-1 text-xs text-slate-500">Abertos e resolvidos por dia</p><div class="mt-3 flex gap-4 text-xs"><span class="text-blue-600">● Abertos</span><span class="text-emerald-600">● Resolvidos</span></div><div class="mt-5 flex h-40 items-end justify-around border-b dark:border-slate-700"><div v-for="day in series" :key="day.day" class="flex h-full w-10 items-end justify-center gap-1"><div class="w-3 rounded-t bg-blue-500" :style="{height:day.opened/chartMax*100+'%'}" :title="day.opened+' abertos'"/><div class="w-3 rounded-t bg-emerald-400" :style="{height:day.resolved/chartMax*100+'%'}" :title="day.resolved+' resolvidos'"/></div></div><div class="mt-2 flex justify-around text-[10px] text-slate-500"><span v-for="day in series" :key="day.day">{{day.day}}</span></div></section>
    <section class="card col-span-5 p-4"><h2 class="text-sm font-bold">Situação dos equipamentos</h2><p class="mt-1 text-xs text-slate-500">{{equipment.length}} ativos cadastrados</p><div class="mt-5 space-y-3"><div v-for="item in equipmentStatuses" :key="item.status"><div class="flex justify-between text-xs"><span>{{item.status}}</span><b>{{item.count}}</b></div><div class="mt-1 h-2 rounded bg-slate-100 dark:bg-slate-700"><div class="h-2 rounded bg-blue-500" :style="{width:item.count/Math.max(1,equipment.length)*100+'%'}"/></div></div><p v-if="!equipment.length" class="text-xs text-slate-500">Nenhum equipamento cadastrado.</p></div></section>
    <section class="card col-span-8 overflow-hidden"><div class="flex items-center justify-between p-4"><h2 class="text-sm font-bold">Chamados recentes</h2><router-link to="/chamados" class="text-xs text-blue-600">Ver todos →</router-link></div><table class="w-full text-left text-xs"><thead class="table-head"><tr><th class="px-4 py-2.5">Protocolo</th><th>Título</th><th>Prioridade</th><th>Status</th><th>Atualização</th></tr></thead><tbody><tr v-for="ticket in recent" :key="ticket.id" class="border-t border-slate-100 dark:border-slate-700"><td class="px-4 py-3"><router-link :to="'/chamados/'+ticket.id" class="font-mono text-blue-600">{{ticket.protocol}}</router-link></td><td><router-link :to="'/chamados/'+ticket.id">{{ticket.title}}</router-link></td><td><BaseBadge :label="ticket.priority"/></td><td><BaseBadge :label="ticket.status"/></td><td>{{formatDate(ticket.updatedAt)}}</td></tr></tbody></table><p v-if="!recent.length" class="p-4 text-xs text-slate-500">Nenhum chamado cadastrado.</p></section>
    <section class="card col-span-4 p-4"><div class="flex justify-between"><h2 class="text-sm font-bold">Alertas</h2><span class="text-xs text-slate-500">{{alerts.length}} alertas</span></div><router-link v-for="alert in alerts" :key="alert.id" :to="alert.to" class="mt-3 flex gap-3 rounded border border-slate-200 p-3 text-xs hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"><AlertTriangle class="size-4 shrink-0 text-amber-500"/>{{alert.title}}</router-link><p v-if="!alerts.length" class="mt-4 text-xs text-slate-500">Nenhum alerta nos cadastros.</p></section>
    <section class="card col-span-6 p-4"><h2 class="text-sm font-bold">Manutenções pendentes</h2><router-link v-for="item in upcoming" :key="item.id" :to="'/manutencoes/'+item.id" class="mt-3 flex items-center justify-between border-b pb-3 text-xs dark:border-slate-700"><div><b>{{item.name}}</b><p class="text-slate-500">{{item.scheduledAt?formatDate(item.scheduledAt):'Sem data programada'}}</p></div><BaseBadge :label="item.status"/></router-link><p v-if="!upcoming.length" class="mt-4 text-xs text-slate-500">Nenhuma manutenção pendente.</p></section>
    <section class="card col-span-6 p-4"><h2 class="text-sm font-bold">Equipamentos com chamados</h2><router-link v-for="item in problematic" :key="item.id" :to="'/equipamentos/'+item.id" class="mt-3 flex justify-between border-b pb-3 text-xs dark:border-slate-700"><div><b>{{item.name}}</b><p class="text-slate-500">{{item.code}} · {{item.department}}</p></div><span>{{item.tickets}} chamado(s)</span></router-link><p v-if="!problematic.length" class="mt-4 text-xs text-slate-500">Nenhum chamado vinculado.</p></section>
  </div>
</template>
