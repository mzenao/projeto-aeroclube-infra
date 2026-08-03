<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { EquipmentService } from "@/services";
import BaseBadge from "@/components/base/BaseBadge.vue";
import {useAppStore} from '@/stores/app';
import {
  ArrowLeft,
  Edit3,
  Ticket,
  Printer,
  Wrench,
  Monitor,
  Network,
  Save,
} from "lucide-vue-next";
const route = useRoute(),
  active = ref("Visão geral"),
  editing=ref(false),app=useAppStore(),
  e = computed(
    () =>
      EquipmentService.find(Number(route.params.id)) ||
      EquipmentService.list()[0],
  );
const tabs = [
  "Visão geral",
  "Especificações",
  "Chamados",
  "Manutenções",
  "Movimentações",
  "Documentos",
  "Softwares",
  "Rede",
];
function save(){EquipmentService.save(EquipmentService.list().map(x=>x.id===e.value.id?e.value:x));editing.value=false;app.toast('Equipamento atualizado','As alterações foram salvas localmente.')}
</script>
<template>
  <router-link
    to="/equipamentos"
    class="flex items-center gap-1 text-xs text-slate-500"
    ><ArrowLeft class="size-3" />Voltar para equipamentos</router-link
  >
  <div class="mt-3 flex items-center">
    <div
      class="mr-4 flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
    >
      <Monitor class="size-6" />
    </div>
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold">{{ e.name }}</h1>
        <BaseBadge :label="e.status" />
      </div>
      <p class="text-xs text-slate-500">
        {{ e.code }} · {{ e.asset }} · {{ e.category }}
      </p>
    </div>
    <div class="ml-auto flex gap-2">
      <button class="btn btn-secondary" @click="app.toast('Etiqueta preparada',`${e.code} enviado para impressão.`)">
        <Printer class="size-4" />Etiqueta</button
      ><button class="btn btn-secondary" @click="app.ticketModalOpen=true">
        <Ticket class="size-4" />Abrir chamado</button
      ><button class="btn btn-primary" @click="editing?save():editing=true"><Save v-if="editing" class="size-4"/><Edit3 v-else class="size-4" />{{editing?'Salvar':'Editar'}}</button>
    </div>
  </div>
  <div class="card mt-4 flex gap-1 p-1">
    <button
      v-for="t in tabs"
      :key="t"
      class="rounded-md px-4 py-2 text-xs font-semibold"
      :class="
        active === t
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950'
          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
      "
      @click="active = t"
    >
      {{ t }}
    </button>
  </div>
  <div class="mt-4 grid grid-cols-3 gap-4">
    <section class="card col-span-2 p-5">
      <h2 class="text-sm font-bold">{{ active }}</h2>
        <div v-if="editing" class="mt-4 grid grid-cols-2 gap-4"><div v-for="key in ['name','code','asset','brand','model','serial','department','location','owner','ip','os','warranty']" :key="key"><label class="label">{{key}}</label><input v-model="(e as any)[key]" class="field"/></div></div><div
          v-else-if="active === 'Visão geral'"
        class="mt-4 grid grid-cols-2 gap-x-8"
      >
        <div
          v-for="[k, v] in [
            ['Marca / Modelo', e.brand + ' ' + e.model],
            ['Número de série', e.serial],
            ['Setor', e.department],
            ['Localização', e.location],
            ['Responsável', e.owner],
            ['Data de compra', e.purchasedAt],
            ['Garantia', e.warranty],
            ['Última manutenção', e.lastMaintenance],
          ]"
          :key="k"
          class="border-b py-3 text-xs dark:border-slate-700"
        >
          <span class="text-slate-500">{{ k }}</span
          ><b class="float-right">{{ v }}</b>
        </div>
      </div>
      <div
        v-else
        class="mt-4 rounded-md border border-dashed p-12 text-center text-sm text-slate-400 dark:border-slate-600"
      >
        Conteúdo da aba {{ active }} preparado para integração com o cadastro
        completo.
      </div>
    </section>
    <aside class="space-y-4">
      <div class="card p-4">
        <h3 class="text-sm font-bold">Rede e sistema</h3>
        <div class="mt-3 flex gap-3">
          <Network class="size-5 text-blue-500" />
          <div class="text-xs">
            <b>{{ e.ip }}</b>
            <div class="text-slate-500">{{ e.os }}</div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-bold">Resumo de suporte</h3>
        <div class="mt-3 text-2xl font-bold">{{ e.tickets }}</div>
        <div class="text-xs text-slate-500">chamados vinculados</div>
        <button class="btn btn-secondary mt-3 w-full">
          <Wrench class="size-4" />Registrar manutenção
        </button>
      </div>
      <div class="card p-4 text-xs">
        <h3 class="mb-3 text-sm font-bold">Histórico recente</h3>
        <div class="border-l-2 border-blue-200 pl-3">
          <b>Inventário atualizado</b>
          <div class="text-slate-400">Hoje, 10:32 · Lucas Almeida</div>
        </div>
      </div>
    </aside>
  </div>
</template>
