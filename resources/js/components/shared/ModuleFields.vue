<script setup lang="ts">
import type {ModuleRecord} from '@/mocks/modules';
defineProps<{kind:string;record:ModuleRecord}>();
</script>
<template>
  <template v-if="kind==='inventory'"><div><label class="label">Quantidade</label><input v-model.number="record.quantity" type="number" min="0" step="1" class="field"/></div><div><label class="label">Estoque mínimo</label><input v-model.number="record.minimum" type="number" min="0" step="1" class="field"/></div></template>
  <div v-if="kind==='inventory'||kind==='maintenance'"><label class="label">{{kind==='inventory'?'Custo unitário (R$)':'Custo (R$)'}}</label><input v-model.number="record.cost" type="number" min="0" step="0.01" class="field"/></div>
  <div v-if="kind==='maintenance'||kind==='loans'"><label class="label">Código do equipamento</label><input v-model="record.equipmentCode" class="field"/></div>
  <div v-if="kind==='maintenance'"><label class="label">Data programada</label><input v-model="record.scheduledAt" type="date" class="field"/></div>
  <template v-if="kind==='loans'"><div><label class="label">Data de retirada</label><input v-model="record.loanedAt" type="date" class="field"/></div><div><label class="label">Devolução prevista</label><input v-model="record.dueAt" type="date" class="field"/></div><div><label class="label">Devolução realizada</label><input v-model="record.returnedAt" type="date" class="field"/></div></template>
</template>
