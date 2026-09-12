<script setup lang="ts">
import PageHeader from "@/components/shared/PageHeader.vue";
import MetricCard from "@/components/dashboard/MetricCard.vue";
import BaseBadge from "@/components/base/BaseBadge.vue";
import {
  Ticket,
  ShieldAlert,
  Clock3,
  CheckCircle2,
  Wrench,
  MonitorCheck,
  CalendarClock,
  PackageMinus,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-vue-next";
import { useTicketStore } from "@/stores/tickets";
import {useRouter} from 'vue-router';
import { maintenance, equipment } from "@/mocks";
const store = useTicketStore(),router=useRouter();
const metrics = [
  [
    "Chamados abertos",
    store.items.filter((x) => x.status === "Aberto").length,
    "2 novos hoje",
    "bg-blue-50 text-blue-600",
    Ticket,
    "/chamados?status=Aberto",
  ],
  [
    "Críticos",
    store.items.filter((x) => x.priority === "Crítica").length,
    "Requer atenção",
    "bg-red-50 text-red-600",
    ShieldAlert,
    "/chamados?priority=Crítica",
  ],
  [
    "Em atendimento",
    store.items.filter((x) => x.status === "Em atendimento").length,
    "Equipe atuando",
    "bg-violet-50 text-violet-600",
    Clock3,
    "/chamados?status=Em atendimento",
  ],
  [
    "Resolvidos no mês",
    34,
    "↑ 12% vs. julho",
    "bg-emerald-50 text-emerald-600",
    CheckCircle2,
    "/chamados?status=Resolvido",
  ],
  [
    "Em manutenção",
    2,
    "1 aguardando peça",
    "bg-orange-50 text-orange-600",
    Wrench,
    "/manutencoes",
  ],
  [
    "Operacionais",
    86,
    "94% do parque",
    "bg-emerald-50 text-emerald-600",
    MonitorCheck,
    "/equipamentos?status=Em uso",
  ],
  [
    "Preventivas atrasadas",
    1,
    "Regularizar hoje",
    "bg-amber-50 text-amber-600",
    CalendarClock,
    "/manutencoes",
  ],
  [
    "Estoque baixo",
    4,
    "Reposição necessária",
    "bg-red-50 text-red-600",
    PackageMinus,
    "/estoque",
  ],
];
const bars = [42, 58, 39, 72, 62, 85, 68];
</script>
<template>
  <PageHeader
    title="Dashboard"
    description="Visão geral da operação de TI · Segunda-feira, 3 de agosto de 2026"
    ><span class="text-xs text-slate-500">Últimos 30 dias</span></PageHeader
  >
  <div class="grid grid-cols-4 gap-3">
    <router-link
      v-for="m in metrics"
      :key="String(m[0])"
      :to="String(m[5])"
      class="transition hover:-translate-y-0.5 hover:shadow-md rounded-[10px]"
    >
      <MetricCard
        :label="String(m[0])"
        :value="String(m[1])"
        :hint="String(m[2])"
        :color="String(m[3])"
        :icon="m[4] as any"
    /></router-link>
  </div>
  <div class="mt-3 grid grid-cols-12 gap-3">
    <div class="card col-span-7 p-4">
      <div class="flex justify-between">
        <div>
          <h3 class="text-sm font-bold">Chamados nos últimos 7 dias</h3>
          <p class="text-xs text-slate-500">Abertos e resolvidos por dia</p>
        </div>
        <div class="flex gap-3 text-[11px]">
          <span class="text-blue-600">● Abertos</span
          ><span class="text-emerald-600">● Resolvidos</span>
        </div>
      </div>
      <div
        class="mt-5 flex h-40 items-end justify-around border-b border-slate-200 px-3 dark:border-slate-600"
      >
        <div
          v-for="(b, i) in bars"
          :key="i"
          class="flex h-full w-10 items-end justify-center gap-1"
        >
          <div class="w-3 rounded-t bg-blue-500" :style="{ height: b + '%' }" />
          <div
            class="w-3 rounded-t bg-emerald-400"
            :style="{ height: b * 0.72 + '%' }"
          />
        </div>
      </div>
      <div class="mt-2 flex justify-around px-3 text-[10px] text-slate-400">
        <span
          v-for="d in ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']"
          :key="d"
          >{{ d }}</span
        >
      </div>
    </div>
    <div class="card col-span-5 p-4">
      <h3 class="text-sm font-bold">Situação dos equipamentos</h3>
      <p class="text-xs text-slate-500">Distribuição do parque tecnológico</p>
      <div class="mt-5 flex items-center gap-7">
        <div
          class="relative flex size-32 items-center justify-center rounded-full"
          style="
            background: conic-gradient(
              #10b981 0 72%,
              #f59e0b 72% 84%,
              #ef4444 84% 91%,
              #94a3b8 91%
            );
          "
        >
          <div
            class="flex size-20 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-800"
          >
            <b class="text-xl">92</b
            ><span class="text-[10px] text-slate-500">ativos</span>
          </div>
        </div>
        <div class="flex-1 space-y-3 text-xs">
          <div class="flex justify-between">
            <span
              >● <i class="text-emerald-500 not-italic">Operacionais</i></span
            ><b>66</b>
          </div>
          <div class="flex justify-between">
            <span class="text-amber-600">● Em manutenção</span><b>11</b>
          </div>
          <div class="flex justify-between">
            <span class="text-red-500">● Com falha</span><b>7</b>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">● Outros</span><b>8</b>
          </div>
        </div>
      </div>
    </div>
    <div class="card col-span-8 overflow-hidden">
      <div class="flex items-center justify-between p-4">
        <h3 class="text-sm font-bold">Chamados recentes</h3>
        <router-link to="/chamados" class="text-xs font-semibold text-blue-600"
          >Ver todos →</router-link
        >
      </div>
      <table class="w-full text-left text-xs">
        <thead class="table-head">
          <tr>
            <th class="px-4 py-2.5">Protocolo</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Atualização</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in store.items.slice(0, 5)"
            :key="t.id"
            class="cursor-pointer border-t border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40"
            @click="router.push(`/chamados/${t.id}`)"
          >
            <td class="px-4 py-3 font-mono text-blue-600">
              <router-link :to="`/chamados/${t.id}`">{{
                t.protocol
              }}</router-link>
            </td>
            <td class="font-medium">{{ t.title }}</td>
            <td><BaseBadge :label="t.priority" /></td>
            <td><BaseBadge :label="t.status" /></td>
            <td class="text-slate-500">{{ t.updatedAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="card col-span-4 p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold">Alertas críticos</h3>
        <span
          class="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600"
          >3 alertas</span
        >
      </div>
      <div class="mt-3 space-y-2">
        <div
          v-for="(a, i) in [
            ['Servidor de arquivos indisponível','/infraestrutura/1'],
            ['Preventiva do nobreak atrasada','/manutencoes/2'],
            ['Estoque de toner abaixo do mínimo','/estoque/2'],
          ]"
          :key="String(a[0])"
          class="flex cursor-pointer gap-3 rounded-md border p-3 transition hover:border-blue-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700/40"
          @click="router.push(String(a[1]))"
        >
          <AlertTriangle
            class="size-4 shrink-0"
            :class="i === 0 ? 'text-red-500' : 'text-amber-500'"
          />
          <div>
            <div class="text-xs font-semibold">{{ a[0] }}</div>
            <div class="mt-1 text-[10px] text-slate-500">
              Atualizado há {{ i + 1 }}h
            </div>
          </div>
          <ArrowUpRight class="ml-auto size-3 text-slate-400" />
        </div>
      </div>
    </div>
    <div class="card col-span-6 p-4">
      <h3 class="text-sm font-bold">Próximas manutenções</h3>
      <div
        v-for="m in maintenance.slice(0, 3)"
        :key="m.id"
        class="mt-3 flex cursor-pointer items-center border-b pb-3 text-xs last:border-0 hover:text-blue-600 dark:border-slate-700"
        @click="router.push(`/manutencoes/${m.id}`)"
      >
        <div
          class="mr-3 rounded bg-blue-50 px-2 py-1 text-center text-blue-700"
        >
          <b>{{ m.scheduledAt.slice(0, 2) }}</b
          ><br /><span class="text-[9px]">AGO</span>
        </div>
        <div>
          <b>{{ m.equipment }}</b>
          <div class="text-slate-500">{{ m.description }}</div>
        </div>
        <BaseBadge class="ml-auto" :label="m.status" />
      </div>
    </div>
    <div class="card col-span-6 p-4">
      <h3 class="text-sm font-bold">Equipamentos problemáticos</h3>
      <div
        v-for="e in equipment.filter((x) => x.tickets > 2).slice(0, 3)"
        :key="e.id"
        class="mt-3 flex cursor-pointer items-center border-b pb-3 text-xs last:border-0 hover:text-blue-600 dark:border-slate-700"
        @click="router.push(`/equipamentos/${e.id}`)"
      >
        <div
          class="mr-3 flex size-8 items-center justify-center rounded bg-slate-100"
        >
          <MonitorCheck class="size-4" />
        </div>
        <div>
          <b>{{ e.name }}</b>
          <div class="text-slate-500">{{ e.department }} · {{ e.code }}</div>
        </div>
        <span class="ml-auto font-semibold text-red-600"
          >{{ e.tickets }} chamados</span
        >
      </div>
    </div>
  </div>
</template>
