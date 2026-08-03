<script setup lang="ts">
import { ref } from "vue";
import PageHeader from "@/components/shared/PageHeader.vue";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import {
  Building2,
  Users,
  Shield,
  Tags,
  Plug,
  MessageCircle,
  Bell,
  Database,
  Palette,
  MonitorCog,
  FolderOpen,
  Download,
  RefreshCw,
  Save,
} from "lucide-vue-next";
const app = useAppStore(),
  auth = useAuthStore(),
  section = ref("Organização");
const sections = [
  ["Organização", Building2],
  ["Usuários", Users],
  ["Permissões", Shield],
  ["Categorias e status", Tags],
  ["Integrações", Plug],
  ["WhatsApp", MessageCircle],
  ["Notificações", Bell],
  ["Armazenamento e backup", Database],
  ["Aparência", Palette],
  ["Aplicação Desktop", MonitorCog],
];
</script>
<template>
  <PageHeader
    title="Configurações"
    description="Administração do ambiente, preferências e integrações"
    ><button
      class="btn btn-primary"
      @click="
        app.toast('Configurações salvas', 'As preferências foram atualizadas.')
      "
    >
      <Save class="size-4" />Salvar alterações
    </button></PageHeader
  >
  <div class="grid grid-cols-[230px_1fr] gap-4">
    <nav class="card h-fit p-2">
      <button
        v-for="[s, icon] in sections"
        :key="String(s)"
        class="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-xs font-medium"
        :class="
          section === s
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950'
            : 'hover:bg-slate-50 dark:hover:bg-slate-700'
        "
        @click="section = String(s)"
      >
        <component :is="icon" class="size-4" />{{ s }}
      </button>
    </nav>
    <section class="card min-h-[540px] p-6">
      <template v-if="section === 'Organização'"
        ><h2 class="text-base font-bold">Dados da organização</h2>
        <p class="mt-1 text-xs text-slate-500">
          Identificação usada em relatórios e comunicações.
        </p>
        <div class="mt-6 grid max-w-2xl grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="label">Nome da organização</label
            ><input class="field" value="Aeroclube de Juiz de Fora" />
          </div>
          <div>
            <label class="label">Nome do sistema</label
            ><input class="field" value="AeroTI" />
          </div>
          <div>
            <label class="label">Unidade</label
            ><input class="field" :value="auth.user?.unit" />
          </div>
          <div>
            <label class="label">E-mail de suporte</label
            ><input class="field" value="ti@aeroclube.local" />
          </div>
          <div>
            <label class="label">Telefone</label
            ><input class="field" value="(32) 3233-1000" />
          </div></div></template
      ><template v-else-if="section === 'Aparência'"
        ><h2 class="text-base font-bold">Aparência</h2>
        <p class="mt-1 text-xs text-slate-500">
          Preferência salva neste computador.
        </p>
        <div class="mt-6 flex gap-4">
          <button
            v-for="t in ['light', 'dark']"
            :key="t"
            class="w-52 rounded-lg border-2 p-3 text-left"
            :class="
              app.theme === t
                ? 'border-blue-500'
                : 'border-slate-200 dark:border-slate-600'
            "
            @click="app.setTheme(t as any)"
          >
            <div
              class="h-24 rounded border p-2"
              :class="t === 'dark' ? 'bg-slate-800' : 'bg-slate-100'"
            >
              <div class="h-3 w-1/2 rounded bg-blue-500" />
              <div
                class="mt-2 h-14 rounded"
                :class="t === 'dark' ? 'bg-slate-700' : 'bg-white'"
              />
            </div>
            <b class="mt-2 block text-xs"
              >Tema {{ t === "dark" ? "escuro" : "claro" }}</b
            >
          </button>
        </div></template
      ><template v-else-if="section === 'Aplicação Desktop'"
        ><h2 class="text-base font-bold">Aplicação Desktop</h2>
        <p class="mt-1 text-xs text-slate-500">
          Informações do ambiente local e preparação para Tauri.
        </p>
        <div
          class="mt-6 max-w-2xl divide-y rounded-lg border px-4 text-xs dark:divide-slate-700 dark:border-slate-600"
        >
          <div
            v-for="[k, v, status] in [
              ['Versão instalada', '0.1.0', ''],
              ['Ambiente', 'Desenvolvimento local', ''],
              ['Diretório de dados', 'AeroTI/data (simulado)', ''],
              ['Backend local', 'Não configurado', 'warning'],
              ['Última sincronização', 'Dados somente locais', ''],
            ]"
            :key="k"
            class="flex justify-between py-3"
          >
            <span class="text-slate-500">{{ k }}</span
            ><b :class="status && 'text-amber-600'">{{ v }}</b>
          </div>
        </div>
        <div class="mt-5 flex flex-wrap gap-2">
          <button
            class="btn btn-secondary"
            @click="
              app.toast(
                'Atualizações',
                'Você está usando a versão mais recente.',
                'info',
              )
            "
          >
            <RefreshCw class="size-4" />Verificar atualizações</button
          ><button
            class="btn btn-secondary"
            @click="
              app.toast(
                'Ação simulada',
                'Disponível quando empacotado com Tauri.',
                'info',
              )
            "
          >
            <FolderOpen class="size-4" />Abrir pasta de dados</button
          ><button
            class="btn btn-secondary"
            @click="
              app.toast(
                'Backup exportado',
                'Arquivo de demonstração preparado.',
              )
            "
          >
            <Download class="size-4" />Exportar backup
          </button>
        </div></template
      ><template v-else
        ><h2 class="text-base font-bold">{{ section }}</h2>
        <p class="mt-1 text-xs text-slate-500">Preferências demonstrativas salvas ao usar o botão principal.</p>
        <div class="mt-6 max-w-2xl space-y-3">
          <div v-for="(item,i) in section==='Usuários'?['Lucas Almeida · Gestor de TI','Ana Souza · Técnica de TI','Carlos Dias · Técnico de TI']:section==='Permissões'?['Gestores podem administrar cadastros','Técnicos podem concluir chamados','Direção pode visualizar indicadores']:section==='Categorias e status'?['Hardware · ativo','Rede · ativo','Acesso · ativo','Impressão · ativo']:section==='Integrações'?['API Laravel local','Comandos Tauri','Servidor SMTP']:section==='WhatsApp'?['Canal de atendimento habilitado','Criar chamados automaticamente','Notificar técnico responsável']:section==='Notificações'?['Chamados críticos','Prazos próximos','Estoque abaixo do mínimo']:['Backup automático local','Manter histórico por 12 meses','Compactar anexos']" :key="item" class="card flex items-center gap-3 p-4 shadow-none"><input :id="`setting-${i}`" type="checkbox" :checked="i<2"/><label :for="`setting-${i}`" class="flex-1 text-sm font-medium">{{item}}</label><select v-if="section==='Usuários'" class="field w-40"><option>Ativo</option><option>Bloqueado</option></select><span v-else class="text-[11px] text-slate-400">Configurável</span></div>
          <div class="grid grid-cols-2 gap-4 pt-3"><div><label class="label">Valor padrão</label><input class="field" :value="section==='WhatsApp'?'(32) 99999-0000':section==='Armazenamento e backup'?'AeroTI/data':section"/></div><div><label class="label">Modo</label><select class="field"><option>Ativo</option><option>Somente demonstração</option><option>Desativado</option></select></div></div>
          <button class="btn btn-secondary" @click="app.toast('Teste concluído',`${section}: configuração simulada validada.`,'info')">Testar configuração</button>
        </div></template
      >
    </section>
  </div>
</template>
