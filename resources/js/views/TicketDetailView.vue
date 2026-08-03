<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useTicketStore } from "@/stores/tickets";
import { useAppStore } from "@/stores/app";
import { WhatsAppService, EmailService } from "@/services";
import BaseBadge from "@/components/base/BaseBadge.vue";
import {
  ArrowLeft,
  Paperclip,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
  RotateCcw,
} from "lucide-vue-next";
const route = useRoute(),
  store = useTicketStore(),
  app = useAppStore();
const ticket = computed(
  () =>
    store.items.find((t) => t.id === Number(route.params.id)) || store.items[0],
);
const reply = ref(""),
  internal = ref(false), attachments=ref<string[]>([]);
const externalChannel=computed(()=>['WhatsApp','E-mail'].includes(ticket.value.channel));
function attach(e:Event){const files=Array.from((e.target as HTMLInputElement).files||[]);attachments.value.push(...files.map(f=>f.name));app.toast('Arquivo anexado',files.map(f=>f.name).join(', '))}
async function send() {
  if (!reply.value.trim()) return;
  const messages = [
    ...(ticket.value.messages || []),
    {
      id: Date.now(),
      author: "Lucas Almeida",
      text: reply.value,
      at: "Agora",
      internal: internal.value,
    },
  ];
  store.update(ticket.value.id, { messages, updatedAt: "Agora" });
  if(!internal.value){if(ticket.value.channel==='WhatsApp')await WhatsAppService.send('',reply.value);else await EmailService.send('',reply.value)}
  reply.value = "";
  app.toast(
    internal.value ? "Nota adicionada" : "Resposta enviada",
    internal.value
      ? "A nota interna foi registrada."
      : "O solicitante será notificado.",
  );
}
function changeStatus(e: Event) {
  store.update(ticket.value.id, {
    status: (e.target as HTMLSelectElement).value as any,
  });
  app.toast("Status atualizado", "A alteração foi registrada no histórico.");
}
function registerTime(){const minutes=globalThis.prompt?.('Minutos gastos no atendimento:','30')||'0';app.toast('Tempo registrado',`${minutes} minutos adicionados.`)}
</script>
<template>
  <div class="mb-4">
    <router-link
      to="/chamados"
      class="flex items-center gap-1 text-xs text-slate-500"
      ><ArrowLeft class="size-3" />Voltar para chamados</router-link
    >
    <div class="mt-3 flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-sm font-semibold text-blue-600">{{
            ticket.protocol
          }}</span
          ><BaseBadge :label="ticket.status" /><BaseBadge
            :label="ticket.priority"
          />
        </div>
        <h1 class="mt-2 text-xl font-bold">{{ ticket.title }}</h1>
        <p class="mt-1 text-xs text-slate-500">
          Aberto por {{ ticket.requester }} · {{ ticket.openedAt }}
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-secondary" @click="registerTime">
          <Clock class="size-4" />Registrar tempo</button
        ><button
          class="btn btn-primary"
          @click="
            store.update(ticket.id, { status: 'Resolvido' });
            app.toast('Chamado concluído', 'Solução registrada com sucesso.');
          "
        >
          <CheckCircle2 class="size-4" />Concluir
        </button>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-[1fr_310px] gap-4">
    <div class="space-y-4">
      <section class="card p-5">
        <h2 class="text-sm font-bold">Descrição</h2>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {{ ticket.description }}
        </p>
      </section>
      <section v-if="externalChannel" class="card">
        <div class="border-b px-5 py-4 dark:border-slate-700">
          <h2 class="text-sm font-bold">Conversa</h2>
          <p class="text-xs text-slate-500">
            Histórico de comunicação com o solicitante
          </p>
        </div>
        <div class="space-y-4 p-5">
          <div v-for="m in ticket.messages" :key="m.id" class="flex gap-3">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600"
            >
              {{
                m.author
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")
              }}
            </div>
            <div
              class="max-w-[80%] rounded-lg border p-3 text-xs dark:border-slate-600"
              :class="
                m.internal
                  ? 'border-amber-200 bg-amber-50 dark:bg-amber-950'
                  : 'bg-slate-50 dark:bg-slate-900'
              "
            >
              <div class="mb-1 flex gap-3">
                <b>{{ m.author }}</b
                ><span v-if="m.internal" class="text-amber-700"
                  >Nota interna</span
                ><span class="text-slate-400">{{ m.at }}</span>
              </div>
              <p class="leading-5">{{ m.text }}</p>
            </div>
          </div>
        </div>
        <div class="border-t p-4 dark:border-slate-700">
          <div class="mb-2 flex gap-4 text-xs">
            <label
              ><input v-model="internal" type="radio" :value="false" />
              Responder</label
            ><label
              ><input v-model="internal" type="radio" :value="true" /> Nota
              interna</label
            >
          </div>
          <textarea
            v-model="reply"
            class="field h-20 py-2"
            placeholder="Escreva uma resposta..."
          />
          <div class="mt-2 flex">
            <label class="btn btn-secondary cursor-pointer">
              <Paperclip class="size-4" />Anexar<input type="file" multiple class="hidden" @change="attach"/></label
            ><button class="btn btn-secondary ml-2" @click="app.toast('Canal externo',`A resposta será enviada por ${ticket.channel}.`,'info')">
              <MessageCircle class="size-4" />WhatsApp</button
            ><button class="btn btn-primary ml-auto" @click="send">
              <Send class="size-4" />Enviar
            </button>
          </div>
        </div>
      </section>
      <section v-else class="card p-5"><h2 class="text-sm font-bold">Comunicação</h2><p class="mt-2 text-sm text-slate-500">Este chamado foi aberto diretamente na plataforma. Não há conversa externa; use notas internas e o histórico para registrar o atendimento.</p><textarea v-model="reply" class="field mt-4 h-20 py-2" placeholder="Adicionar nota interna..."/><button class="btn btn-primary mt-2" @click="internal=true;send()">Registrar nota</button></section>
      <section v-if="attachments.length" class="card p-5"><h2 class="text-sm font-bold">Anexos</h2><div v-for="file in attachments" :key="file" class="mt-2 rounded border p-2 text-xs dark:border-slate-600">{{file}}</div></section>
      <section class="card p-5">
        <h2 class="text-sm font-bold">Atividades e histórico</h2>
        <div
          v-for="a in [
            'Lucas Almeida iniciou o atendimento',
            'Prioridade alterada de Média para Crítica',
            'Chamado criado via ' + ticket.channel,
          ]"
          :key="a"
          class="mt-4 flex gap-3 text-xs"
        >
          <div
            class="mt-1 size-2 rounded-full bg-blue-500 ring-4 ring-blue-50"
          />
          <div>
            <b>{{ a }}</b>
            <div class="text-slate-400">
              Hoje, 09:{{ 20 + Math.floor(Math.random() * 30) }}
            </div>
          </div>
        </div>
      </section>
    </div>
    <aside class="space-y-3">
      <div class="card p-4">
        <h3 class="mb-4 text-sm font-bold">Detalhes do chamado</h3>
        <label class="label">Status</label
        ><select
          class="field mb-4"
          :value="ticket.status"
          @change="changeStatus"
        >
          <option
            v-for="s in [
              'Aberto',
              'Aguardando triagem',
              'Em atendimento',
              'Aguardando funcionário',
              'Aguardando peça',
              'Agendado',
              'Resolvido',
              'Cancelado',
            ]"
            :key="s"
          >
            {{ s }}
          </option></select
        ><label class="label">Prioridade</label
        ><select
          class="field mb-4"
          :value="ticket.priority"
          @change="
            store.update(ticket.id, {
              priority: ($event.target as HTMLSelectElement).value as any,
            })
          "
        >
          <option>Baixa</option>
          <option>Média</option>
          <option>Alta</option>
          <option>Crítica</option></select
        ><label class="label">Técnico responsável</label
        ><select
          class="field"
          :value="ticket.technician"
          @change="
            store.update(ticket.id, {
              technician: ($event.target as HTMLSelectElement).value,
            })
          "
        >
          <option>Não atribuído</option>
          <option>Lucas Almeida</option>
          <option>Ana Souza</option>
          <option>Carlos Dias</option>
        </select>
      </div>
      <div class="card divide-y p-4 text-xs dark:divide-slate-700">
        <h3 class="mb-3 text-sm font-bold">Informações</h3>
        <div
          v-for="[k, v] in [
            ['Solicitante', ticket.requester],
            ['Setor', ticket.department],
            ['Equipamento', ticket.equipment],
            ['Categoria', ticket.category],
            ['Canal', ticket.channel],
            ['Prazo', ticket.deadline],
            ['Última atualização', ticket.updatedAt],
          ]"
          :key="String(k)"
          class="py-2"
        >
          <div class="text-[10px] uppercase text-slate-400">{{ k }}</div>
          <div class="mt-0.5 font-medium">{{ v }}</div>
        </div>
      </div>
      <button class="btn btn-secondary w-full" @click="store.update(ticket.id,{status:'Aberto'});app.toast('Chamado reaberto','O atendimento voltou para a fila.')">
        <RotateCcw class="size-4" />Reabrir chamado
      </button>
    </aside>
  </div>
</template>
