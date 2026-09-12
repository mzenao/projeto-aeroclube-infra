<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { X, Paperclip } from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useTicketStore } from "@/stores/tickets";
import {EquipmentService,ModuleService} from '@/services';
import {readAttachments} from '@/services/attachments';
import {useAuthStore} from '@/stores/auth';
import type {Attachment,Priority} from '@/types';
const app = useAppStore(),
  store = useTicketStore(),
  errors = ref<Record<string, string>>({}), attachments=ref<Attachment[]>([]), internalNotes=ref(''), reading=ref(false);
const auth=useAuthStore(),employees=computed(()=>ModuleService.list('employees')),equipment=computed(()=>EquipmentService.list());
async function attach(e:Event){reading.value=true;try{attachments.value.push(...await readAttachments(Array.from((e.target as HTMLInputElement).files||[]),attachments.value))}catch(error){app.toast('Falha no anexo',String(error instanceof Error?error.message:error),'error')}finally{reading.value=false;(e.target as HTMLInputElement).value=''}}
const form = reactive({
  requester: "Mariana Costa",
  department: "Secretaria",
  title: "",
  description: "",
  category: "Hardware",
  priority: "Média" as Priority,
  equipment: "Não informado",
  status: "Aberto" as const,
  technician: "Não atribuído",
  channel: "Portal",
  deadline: "",
  messages: [],
});
watch(()=>app.ticketModalOpen,open=>{if(open){Object.assign(form,{requester:employees.value[0]?.name||'',department:employees.value[0]?.owner||'',title:'',description:'',category:'Hardware',priority:'Média',equipment:app.ticketEquipment||'Não informado',status:'Aberto',technician:'Não atribuído',channel:'Portal',deadline:'',messages:[]});attachments.value=[];internalNotes.value='';errors.value={};app.ticketEquipment=''}});
function save() {
  errors.value = {};
  if (!form.title.trim()) errors.value.title = "Informe um título.";
  if (form.description.trim().length < 10)
    errors.value.description =
      "Descreva o problema com pelo menos 10 caracteres.";
  if (Object.keys(errors.value).length) return;
  if(reading.value)return;
  if(!form.requester.trim()||!form.department.trim()){app.toast('Dados incompletos','Informe solicitante e setor.','error');return}
  try {
  const ticket = store.create({ ...form,title:form.title.trim(),description:form.description.trim(),deadline:form.deadline?new Date(form.deadline).toISOString():'',attachments:[...attachments.value],messages:internalNotes.value.trim()?[{id:Date.now(),author:auth.user?.name||'Equipe de TI',text:internalNotes.value.trim(),at:new Date().toISOString(),internal:true}]:[] });
  app.ticketModalOpen = false;
  app.toast("Chamado criado", `${ticket.protocol} foi registrado com sucesso.`);
  form.title = "";
  form.description = "";
  attachments.value=[];internalNotes.value='';
  }catch(error){app.toast('Não foi possível criar o chamado',error instanceof Error?error.message:String(error),'error')}
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
            <option v-for="person in employees" :key="person.id">{{person.name}}</option>
          </select>
        </div>
        <div>
          <label class="label">Setor *</label
          ><input v-model="form.department" class="field"/>
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
            <option v-for="item in equipment" :key="item.id">{{item.code}}</option>
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
            v-model="internalNotes"
            class="field h-16 py-2"
            placeholder="Visível apenas para a equipe de TI"
          />
        </div>
        <div class="col-span-2"><label class="label">Prazo (opcional)</label><input v-model="form.deadline" type="datetime-local" class="field"/><p class="mt-1 text-xs text-slate-500">Defina o prazo acordado para este atendimento.</p></div>
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
            ><button class="btn btn-primary" :disabled="reading">{{reading?'Lendo anexos...':'Criar chamado'}}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
