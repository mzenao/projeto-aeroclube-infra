<script setup lang="ts">
import {computed} from 'vue';import {useRoute} from 'vue-router';import PageHeader from '@/components/shared/PageHeader.vue';import {EquipmentService,ModuleService} from '@/services';import {useTicketStore} from '@/stores/tickets';
const route=useRoute(),tickets=useTicketStore(),query=computed(()=>String(route.query.q||'').trim()),matches=(value:string)=>!!query.value&&value.toLowerCase().includes(query.value.toLowerCase());
const results=computed(()=>[
  ...tickets.items.filter(t=>matches([t.protocol,t.title,t.requester,t.equipment].join(' '))).map(t=>({key:'ticket:'+t.id,title:t.protocol+' · '+t.title,kind:'Chamado',to:'/chamados/'+t.id})),
  ...EquipmentService.list().filter(e=>matches([e.code,e.name,e.asset,e.owner].join(' '))).map(e=>({key:'equipment:'+e.id,title:e.code+' · '+e.name,kind:'Equipamento',to:'/equipamentos/'+e.id})),
  ...ModuleService.list('employees').filter(e=>matches([e.name,e.email,e.owner,e.category].join(' '))).map(e=>({key:'employee:'+e.id,title:e.name,kind:'Funcionário',to:'/funcionarios/'+e.id})),
]);
</script>
<template><PageHeader title="Resultados da busca" :description="query ? 'Resultados para: '+query : 'Informe um termo na busca do cabeçalho'"/><div class="card divide-y dark:divide-slate-700"><router-link v-for="result in results" :key="result.key" :to="result.to" class="block p-4 hover:bg-slate-50 dark:hover:bg-slate-700"><span class="text-xs text-slate-500">{{result.kind}}</span><div class="text-sm font-semibold text-blue-600">{{result.title}}</div></router-link><p v-if="!results.length" class="p-8 text-center text-sm text-slate-500">Nenhum resultado encontrado.</p></div></template>
