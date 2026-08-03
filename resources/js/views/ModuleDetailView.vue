<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ModuleService } from "@/services";
import type { ModuleRecord } from "@/mocks/modules";
import { useAppStore } from "@/stores/app";
import BaseBadge from "@/components/base/BaseBadge.vue";
import KnowledgeEditor from '@/components/shared/KnowledgeEditor.vue';
import { ArrowLeft, Save, Trash2 } from "lucide-vue-next";
const route = useRoute(),
  router = useRouter(),
  app = useAppStore(),
  kind = ({funcionarios:'employees',manutencoes:'maintenance',estoque:'inventory',emprestimos:'loans',fornecedores:'suppliers',infraestrutura:'infrastructure',conhecimento:'knowledge'} as Record<string,string>)[String(route.params.module)],
  items = ref(ModuleService.list(kind));
const record = ref<ModuleRecord>({
  ...(items.value.find((x) => x.id === Number(route.params.id)) ||
    items.value[0]),
});
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
    )[kind],
);
function save() {
  record.value.updatedAt = "Agora";
  items.value = items.value.map((x) =>
    x.id === record.value.id ? record.value : x,
  );
  ModuleService.save(kind, items.value);
  app.toast("Alterações salvas", "O registro foi atualizado localmente.");
}
function remove() {
  if (confirm("Excluir este registro?")) {
    ModuleService.save(
      kind,
      items.value.filter((x) => x.id !== record.value.id),
    );
    router.back();
  }
}
</script>
<template>
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
  <KnowledgeEditor v-if="kind==='knowledge'" :record="record"/>
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
        ><input v-model="record.status" class="field" />
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
      <div class="col-span-2">
        <label class="label">Observações</label
        ><textarea v-model="record.notes" class="field h-32 py-2" />
      </div>
    </section>
    <aside class="space-y-4">
      <div class="card p-4">
        <h3 class="text-sm font-bold">Resumo</h3>
        <div class="mt-4 text-xs text-slate-500">Última atualização</div>
        <b class="text-xs">{{ record.updatedAt }}</b>
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
