<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ModuleService } from "@/services";
import type { ModuleRecord } from "@/mocks/modules";
import { useAppStore } from "@/stores/app";
import BaseBadge from "@/components/base/BaseBadge.vue";
import ModuleFields from '@/components/shared/ModuleFields.vue';
import {moduleStatuses} from '@/services/modules';
import {formatDate} from '@/utils/dates';
import KnowledgeEditor from '@/components/shared/KnowledgeEditor.vue';
import { ArrowLeft, Save, Trash2 } from "lucide-vue-next";
const route = useRoute(),
  router = useRouter(),
  app = useAppStore(),
  kind = computed(()=>({funcionarios:'employees',manutencoes:'maintenance',estoque:'inventory',emprestimos:'loans',fornecedores:'suppliers',infraestrutura:'infrastructure',conhecimento:'knowledge'} as Record<string,string>)[String(route.params.module)]);
const record=ref<ModuleRecord|null>(null);
watch(()=>[kind.value,route.params.id],()=>{const item=ModuleService.find(kind.value,Number(route.params.id));record.value=item?{...item}:null},{immediate:true});
const title = computed(
  () =>
    (
      ({
        employees: "Funcionário",
        maintenance: "Manutenção",
        inventory: "Item de estoque",
        loans: "Empréstimo",
        suppliers: "Fornecedor",
        infrastructure: "Infraestrutura",
        knowledge: "Artigo",
      }) as any
    )[kind.value],
);
function save(){if(!record.value)return;if(!record.value.name.trim()||!record.value.category.trim()){app.toast('Dados incompletos','Informe nome e categoria.','error');return}try{const updated={...record.value,updatedAt:new Date().toISOString()};ModuleService.save(kind.value,ModuleService.list(kind.value).map(x=>x.id===updated.id?updated:x));record.value=ModuleService.find(kind.value,updated.id)||null;app.toast('Alterações salvas','O registro foi atualizado localmente.')}catch(error){app.toast('Falha ao salvar',error instanceof Error?error.message:String(error),'error')}}
function remove(){if(record.value&&confirm('Excluir este registro?')){ModuleService.save(kind.value,ModuleService.list(kind.value).filter(x=>x.id!==record.value!.id));router.push('/'+route.params.module)}}
</script>
<template>
  <div v-if="!record" class="card p-8"><h1 class="text-xl font-bold">Registro não encontrado</h1><router-link :to="'/'+route.params.module" class="btn btn-secondary mt-4">Voltar para a listagem</router-link></div>
  <template v-else>
  <button
    class="flex items-center gap-1 text-xs text-slate-500"
    @click="router.back"
  >
    <ArrowLeft class="size-3" />Voltar
  </button>
  <div class="mt-3 flex items-center">
    <div>
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-bold">{{ record.name }}</h1>
        <BaseBadge :label="record.status" />
      </div>
      <p class="mt-1 text-xs text-slate-500">
        Detalhes e edição de {{ title.toLowerCase() }}
      </p>
    </div>
    <div v-if="kind!=='knowledge'" class="ml-auto flex gap-2">
      <button class="btn btn-secondary text-red-600" @click="remove">
        <Trash2 class="size-4" />Excluir</button
      ><button class="btn btn-primary" @click="save">
        <Save class="size-4" />Salvar alterações
      </button>
    </div>
  </div>
  <KnowledgeEditor v-if="kind==='knowledge'" :key="kind+record.id" :record="record" @saved="record=$event"/>
  <div v-else class="mt-4 grid grid-cols-[1fr_300px] gap-4">
    <section class="card grid grid-cols-2 gap-4 p-6">
      <div class="col-span-2">
        <label class="label">Nome / identificação</label
        ><input v-model="record.name" class="field" />
      </div>
      <div>
        <label class="label">Categoria / cargo / tipo</label
        ><input v-model="record.category" class="field" />
      </div>
      <div>
        <label class="label">Status</label
        ><select v-model="record.status" class="field"><option v-for="value in [...new Set([record.status,...(moduleStatuses[kind]||[])])]" :key="value">{{value}}</option></select>
      </div>
      <div>
        <label class="label">Responsável / localização</label
        ><input v-model="record.owner" class="field" />
      </div>
      <div>
        <label class="label">Informação principal</label
        ><input v-model="record.info" class="field" />
      </div>
      <div>
        <label class="label">E-mail</label
        ><input v-model="record.email" class="field" />
      </div>
      <div>
        <label class="label">Telefone</label
        ><input v-model="record.phone" class="field" />
      </div>
      <ModuleFields :kind="kind" :record="record"/>
      <div class="col-span-2">
        <label class="label">Observações</label
        ><textarea v-model="record.notes" class="field h-32 py-2" />
      </div>
    </section>
    <aside class="space-y-4">
      <div class="card p-4">
        <h3 class="text-sm font-bold">Resumo</h3>
        <div class="mt-4 text-xs text-slate-500">Última atualização</div>
        <b class="text-xs">{{ formatDate(record.updatedAt) }}</b>
        <div class="mt-4 text-xs text-slate-500">Identificador local</div>
        <b class="font-mono text-xs">#{{ record.id }}</b>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-bold">Histórico</h3>
        <div class="mt-3 border-l-2 border-blue-200 pl-3 text-xs">
          <b>Registro consultado</b>
          <div class="text-slate-400">Agora · Lucas Almeida</div>
        </div>
      </div>
    </aside>
  </div>
  </template>
</template>
