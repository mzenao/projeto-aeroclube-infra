<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useTicketStore } from "@/stores/tickets";
import { useAppStore } from "@/stores/app";
import { WhatsAppService, EmailService } from "@/services";
import {readAttachments} from '@/services/attachments';
import {formatDate} from '@/utils/dates';
import {useAuthStore} from '@/stores/auth';
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
    store.items.find((t) => t.id === Number(route.params.id)),
);
const reply=ref(''),internal=ref(false),reading=ref(false),auth=useAuthStore();
const externalChannel=computed(()=>['WhatsApp','E-mail'].includes(ticket.value?.channel||''));
const attachments=computed(()=>ticket.value?.attachments||[]);
watch(()=>route.params.id,()=>{reply.value='';internal.value=false});
async function attach(e:Event){const current=ticket.value;if(!current)return;reading.value=true;try{const files=await readAttachments(Array.from((e.target as HTMLInputElement).files||[]),current.attachments||[]);store.update(current.id,{attachments:[...(current.attachments||[]),...files]});app.toast('Anexos salvos','Os arquivos foram armazenados neste chamado.')}catch(error){app.toast('Falha no anexo',error instanceof Error?error.message:String(error),'error')}finally{reading.value=false;(e.target as HTMLInputElement).value=''}}
async function send(){const current=ticket.value;if(!current||!reply.value.trim())return;const at=new Date().toISOString(),isInternal=internal.value||!externalChannel.value;try{store.update(current.id,{messages:[...(current.messages||[]),{id:Date.now(),author:auth.user?.name||'Equipe de TI',text:reply.value.trim(),at,internal:isInternal}]});if(!isInternal){if(current.channel==='WhatsApp')await WhatsAppService.send('',reply.value);else await EmailService.send('',reply.value)}reply.value='';app.toast(isInternal?'Nota registrada':'Resposta registrada',isInternal?'A nota interna foi salva.':'Mensagem salva; o envio externo é simulado neste protótipo.')}catch(error){app.toast('Não foi possível salvar',error instanceof Error?error.message:String(error),'error')}}
function changeStatus(e:Event){if(!ticket.value)return;store.update(ticket.value.id,{status:(e.target as HTMLSelectElement).value as any});app.toast('Status atualizado','A alteração foi registrada no histórico.')}
function registerTime(){const current=ticket.value;if(!current)return;const answer=globalThis.prompt?.('Minutos gastos no atendimento:','30');if(answer==null)return;const minutes=Number(answer);if(!Number.isFinite(minutes)||minutes<=0){app.toast('Tempo inválido','Informe uma quantidade positiva de minutos.','error');return}try{store.update(current.id,{timeEntries:[...(current.timeEntries||[]),{id:crypto.randomUUID(),author:auth.user?.name||'Equipe de TI',minutes,at:new Date().toISOString()}]});app.toast('Tempo registrado',minutes+' minutos adicionados.')}catch(error){app.toast('Falha ao registrar tempo',error instanceof Error?error.message:String(error),'error')}}
</script>
<template>
  <div v-if="!ticket" class="card p-8"><h1 class="text-xl font-bold">Chamado não encontrado</h1><router-link to="/chamados" class="btn btn-secondary mt-4">Voltar para chamados</router-link></div>
  <template v-else>
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
          Aberto por {{ ticket.requester }} · {{ formatDate(ticket.openedAt) }}
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
      <section class="card">
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
                ><span class="text-slate-400">{{ formatDate(m.at) }}</span>
              </div>
              <p class="leading-5">{{ m.text }}</p>
            </div>
          </div>
        </div>
        <div class="border-t p-4 dark:border-slate-700">
          <div class="mb-2 flex gap-4 text-xs">
            <label
              ><input v-model="internal" type="radio" :value="false" :disabled="!externalChannel" />
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
            ><button class="btn btn-primary ml-auto" :disabled="reading" @click="send">
              <Send class="size-4" />Enviar
            </button>
          </div>
        </div>
      </section>
      <section v-if="attachments.length" class="card p-5"><h2 class="text-sm font-bold">Anexos</h2><a v-for="file in attachments" :key="file.id" :href="file.dataUrl" :download="file.name" class="mt-2 block rounded border p-2 text-xs text-blue-600 dark:border-slate-600">{{file.name}} · Baixar</a></section>
      <section class="card p-5">
        <h2 class="text-sm font-bold">Atividades e histórico</h2><p v-if="!ticket.history?.length" class="mt-3 text-xs text-slate-500">Nenhum evento registrado.</p><div v-for="entry in ticket.timeEntries || []" :key="entry.id" class="mt-3 text-xs">{{entry.minutes}} minutos · {{entry.author}} · {{formatDate(entry.at)}}</div>
        <div
          v-for="a in ticket.history || []"
          :key="a.id"
          class="mt-4 flex gap-3 text-xs"
        >
          <div
            class="mt-1 size-2 rounded-full bg-blue-500 ring-4 ring-blue-50"
          />
          <div>
            <b>{{ a.description }}</b>
            <div class="text-slate-400">
              {{ formatDate(a.at) }} · {{ a.author }}
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
            ['Prazo', ticket.deadline?formatDate(ticket.deadline):'Sem prazo definido'],
            ['Última atualização', formatDate(ticket.updatedAt)],
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
</template>
