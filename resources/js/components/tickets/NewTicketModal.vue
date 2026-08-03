<script setup lang="ts">
import { reactive, ref } from "vue";
import { X, Paperclip } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useTicketStore } from "@/stores/tickets";
const app = useAppStore(),
  store = useTicketStore(),
  errors = ref<Record<string, string>>({}), attachments=ref<string[]>([]);
function attach(e:Event){attachments.value=Array.from((e.target as HTMLInputElement).files||[]).map(f=>f.name)}
const form = reactive({
  requester: "Mariana Costa",
  department: "Secretaria",
  title: "",
  description: "",
  category: "Hardware",
  priority: "Média" as const,
  equipment: "Não informado",
  status: "Aberto" as const,
  technician: "Não atribuído",
  channel: "Portal",
  deadline: "07/08/2026 17:00",
  messages: [],
});
function save() {
  errors.value = {};
  if (!form.title) errors.value.title = "Informe um título.";
  if (form.description.length < 10)
    errors.value.description =
      "Descreva o problema com pelo menos 10 caracteres.";
  if (Object.keys(errors.value).length) return;
  const ticket = store.create({ ...form });
  app.ticketModalOpen = false;
  app.toast("Chamado criado", `${ticket.protocol} foi registrado com sucesso.`);
  form.title = "";
  form.description = "";
}
</script>
<template>
  <div
    v-if="app.ticketModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45"
    @mousedown.self="app.ticketModalOpen = false"
  >
    <div class="card max-h-[90vh] w-[820px] overflow-y-auto shadow-2xl">
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <div>
          <h2 class="text-lg font-bold">Novo chamado</h2>
          <p class="text-xs text-slate-500">
            Registre uma solicitação para a equipe de TI
          </p>
        </div>
        <button @click="app.ticketModalOpen = false">
          <X class="size-5" />
        </button>
      </div>
      <form class="grid grid-cols-2 gap-4 p-6" @submit.prevent="save">
        <div>
          <label class="label">Solicitante *</label
          ><select v-model="form.requester" class="field">
            <option>Mariana Costa</option>
            <option>Ricardo Nunes</option>
            <option>Paula Freitas</option>
          </select>
        </div>
        <div>
          <label class="label">Setor *</label
          ><select v-model="form.department" class="field">
            <option>Secretaria</option>
            <option>Administração</option>
            <option>Financeiro</option>
            <option>Hangar</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="label">Título *</label
          ><input
            v-model="form.title"
            class="field"
            placeholder="Resumo objetivo do problema"
          />
          <p v-if="errors.title" class="mt-1 text-xs text-red-600">
            {{ errors.title }}
          </p>
        </div>
        <div class="col-span-2">
          <label class="label">Descrição *</label
          ><textarea
            v-model="form.description"
            class="field h-24 py-2"
            placeholder="Descreva sintomas, tentativas realizadas e impacto..."
          />
          <p v-if="errors.description" class="mt-1 text-xs text-red-600">
            {{ errors.description }}
          </p>
        </div>
        <div>
          <label class="label">Categoria</label
          ><select v-model="form.category" class="field">
            <option>Hardware</option>
            <option>Software</option>
            <option>Rede</option>
            <option>Acesso</option>
            <option>Impressão</option>
          </select>
        </div>
        <div>
          <label class="label">Prioridade</label
          ><select v-model="form.priority" class="field">
            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
            <option>Crítica</option>
          </select>
        </div>
        <div>
          <label class="label">Equipamento</label
          ><select v-model="form.equipment" class="field">
            <option>Não informado</option>
            <option>DESK-034</option>
            <option>IMP-012</option>
            <option>NB-008</option>
          </select>
        </div>
        <div>
          <label class="label">Canal</label
          ><select v-model="form.channel" class="field">
            <option>Portal</option>
            <option>Telefone</option>
            <option>E-mail</option>
            <option>WhatsApp</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="label">Observações internas</label
          ><textarea
            class="field h-16 py-2"
            placeholder="Visível apenas para a equipe de TI"
          />
        </div>
        <div
          class="col-span-2 flex items-center justify-between border-t pt-4 dark:border-slate-700"
        >
          <div><label class="btn btn-secondary cursor-pointer"><Paperclip class="size-4" />Anexar arquivo<input type="file" multiple class="hidden" @change="attach"/></label><span v-if="attachments.length" class="ml-2 text-xs text-slate-500">{{attachments.length}} arquivo(s)</span></div>
          <div class="flex gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              @click="app.ticketModalOpen = false"
            >
              Cancelar</button
            ><button class="btn btn-primary">Criar chamado</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
