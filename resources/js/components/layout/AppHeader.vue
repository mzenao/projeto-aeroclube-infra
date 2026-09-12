<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  CheckCheck,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";
import {ModuleService,StorageService} from '@/services';
import {useTicketStore} from '@/stores/tickets';
import {parseDate} from '@/utils/dates';
import { useRouter } from "vue-router";
const app = useAppStore(),
  auth = useAuthStore(),
  router = useRouter(),
  query = ref(""),
  notificationsOpen = ref(false),
  profileOpen = ref(false),
  notificationsMenu = ref<HTMLElement | null>(null),
  profileMenu = ref<HTMLElement | null>(null);
const initials = computed(() =>
  (auth.user?.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "AT",
);
function onClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (
    notificationsOpen.value &&
    notificationsMenu.value &&
    !notificationsMenu.value.contains(target)
  )
    notificationsOpen.value = false;
  if (profileOpen.value && profileMenu.value && !profileMenu.value.contains(target))
    profileOpen.value = false;
}
function onEscape(e: KeyboardEvent) {
  if (e.key === "Escape") {
    notificationsOpen.value = false;
    profileOpen.value = false;
  }
}
onMounted(() => {
  document.addEventListener("click", onClickOutside);
  document.addEventListener("keydown", onEscape);
});
onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  document.removeEventListener("keydown", onEscape);
});
const ticketStore=useTicketStore(),readNotifications=ref<string[]>(StorageService.get('readNotifications',[]));
const notifications=computed(()=>[
  ...ticketStore.items.filter(t=>t.priority==='Crítica'&&!['Resolvido','Cancelado'].includes(t.status)).map(t=>({id:'ticket:'+t.id+':'+t.updatedAt,title:t.title,detail:t.protocol+' · '+t.status,to:'/chamados/'+t.id})),
  ...ModuleService.list('maintenance').filter(m=>!['Concluída','Cancelada'].includes(m.status)&&(m.status==='Atrasada'||(parseDate(m.scheduledAt)?.getTime()??Infinity)<Date.now())).map(m=>({id:'maintenance:'+m.id+':'+m.updatedAt,title:'Manutenção atrasada',detail:m.name,to:'/manutencoes/'+m.id})),
  ...ModuleService.list('inventory').filter(m=>m.status==='Estoque baixo').map(m=>({id:'inventory:'+m.id+':'+m.updatedAt,title:'Estoque abaixo do mínimo',detail:m.name,to:'/estoque/'+m.id})),
].map(n=>({...n,read:readNotifications.value.includes(n.id)})));
function markRead(ids:string[]){const next=[...new Set([...readNotifications.value,...ids])];StorageService.set('readNotifications',next);readNotifications.value=next}
function search() {
  if (!query.value.trim()) return;
  router.push({ path: "/busca", query: { q: query.value.trim() } });
}
function openNotification(n: any) {
  markRead([n.id]);
  notificationsOpen.value = false;
  router.push(n.to);
}
function logout() {
  auth.logout();
  router.push("/login");
}
</script>
<template>
  <header
    class="fixed right-0 top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-5 transition-all duration-200 dark:border-slate-700 dark:bg-slate-800"
    :class="app.sidebarCollapsed ? 'left-[68px]' : 'left-[232px]'"
  >
    <form class="relative w-[420px]" @submit.prevent="search">
      <Search class="absolute left-3 top-2.5 size-4 text-slate-400" /><input
        id="global-search"
        v-model="query"
        class="field pl-9"
        placeholder="Buscar chamados, equipamentos ou pessoas"
      />
    </form>
    <div class="ml-auto flex items-center gap-2">
      <div ref="notificationsMenu" class="relative">
        <button
          class="relative flex size-9 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Notificações"
          @click="
            notificationsOpen = !notificationsOpen;
            profileOpen = false;
          "
        >
          <Bell class="size-[18px]" /><span
            v-if="notifications.some((n) => !n.read)"
            class="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white"
          />
        </button>
        <div
          v-if="notificationsOpen"
          class="card absolute right-0 top-11 w-80 overflow-hidden shadow-xl"
        >
          <div
            class="flex items-center justify-between border-b px-4 py-3 dark:border-slate-700"
          >
            <b class="text-sm">Notificações</b
            ><button
              class="text-[11px] text-blue-600"
              @click="markRead(notifications.map(n=>n.id))"
            >
              <CheckCheck class="mr-1 inline size-3" />Marcar lidas
            </button>
          </div>
          <button
            v-for="n in notifications"
            :key="n.id"
            class="flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700"
            @click="openNotification(n)"
          >
            <span
              class="mt-1 size-2 shrink-0 rounded-full"
              :class="n.read ? 'bg-slate-300' : 'bg-blue-500'"
            /><span
              ><b class="block text-xs">{{ n.title }}</b
              ><span class="text-[11px] text-slate-500">{{
                n.detail
              }}</span></span
            >
          </button>
        </div>
      </div>
      <button
        class="flex size-9 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
        @click="app.setTheme(app.theme === 'light' ? 'dark' : 'light')"
      >
        <Moon v-if="app.theme === 'light'" class="size-[18px]" /><Sun
          v-else
          class="size-[18px]"
        />
      </button>
      <div class="mx-1 h-7 w-px bg-slate-200 dark:bg-slate-600" />
      <div ref="profileMenu" class="relative">
        <button
          class="flex items-center gap-2 rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
          @click="
            profileOpen = !profileOpen;
            notificationsOpen = false;
          "
        >
          <div
            class="flex size-8 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-bold text-blue-700"
          >
            <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="Foto do perfil" class="size-full object-cover"/><span v-else>{{ initials }}</span>
          </div>
          <div class="text-left">
            <div class="text-xs font-semibold">{{ auth.user?.name }}</div>
            <div class="text-[10px] text-slate-500">{{ auth.user?.role }}</div>
          </div>
          <ChevronDown class="size-3 text-slate-400" />
        </button>
        <div
          v-if="profileOpen"
          class="card absolute right-0 top-11 w-48 p-1 shadow-lg"
        >
          <button
            class="w-full rounded px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
            @click="
              router.push('/configuracoes/perfil');
              profileOpen = false;
            "
          >
            Meu perfil</button
          ><button
            class="w-full rounded px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
            @click="logout"
          >
            Sair do sistema
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
