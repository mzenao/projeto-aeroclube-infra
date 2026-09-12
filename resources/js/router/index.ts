import { createRouter, createWebHashHistory } from "vue-router";
import { storage } from "@/adapters/storage";
const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginView.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    component: () => import("@/components/layout/AppLayout.vue"),
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/DashboardView.vue"),
      },
      {
        path: "chamados",
        name: "Chamados",
        component: () => import("@/views/TicketsView.vue"),
      },
      {
        path: "chamados/:id",
        name: "Detalhes do chamado",
        component: () => import("@/views/TicketDetailView.vue"),
      },
      {
        path: "equipamentos",
        name: "Equipamentos",
        component: () => import("@/views/EquipmentView.vue"),
      },
      {
        path: "equipamentos/:id",
        name: "Detalhes do equipamento",
        component: () => import("@/views/EquipmentDetailView.vue"),
      },
      {
        path: "funcionarios",
        name: "Funcionários",
        component: () => import("@/views/GenericView.vue"),
        meta: { kind: "employees" },
      },
      {
        path: "manutencoes",
        name: "Manutenções",
        component: () => import("@/views/GenericView.vue"),
        meta: { kind: "maintenance" },
      },
      {
        path: "estoque",
        name: "Estoque",
        component: () => import("@/views/GenericView.vue"),
        meta: { kind: "inventory" },
      },
      {
        path: "emprestimos",
        name: "Empréstimos",
        component: () => import("@/views/GenericView.vue"),
        meta: { kind: "loans" },
      },
      {
        path: "fornecedores",
        name: "Fornecedores",
        component: () => import("@/views/GenericView.vue"),
        meta: { kind: "suppliers" },
      },
      {
        path: "infraestrutura",
        name: "Infraestrutura",
        component: () => import("@/views/GenericView.vue"),
        meta: { kind: "infrastructure" },
      },
      {
        path: "conhecimento",
        name: "Base de Conhecimento",
        component: () => import("@/views/GenericView.vue"),
        meta: { kind: "knowledge" },
      },
      {path: ":module(funcionarios|manutencoes|estoque|emprestimos|fornecedores|infraestrutura|conhecimento)/:id",name:"Detalhes do módulo",component:()=>import("@/views/ModuleDetailView.vue")},
      {
        path: "configuracoes/perfil",
        name: "Meu perfil",
        component: () => import("@/views/SettingsView.vue"),
        meta:{settingsSection:'Meu perfil'},
      },
      {
        path: "configuracoes",
        name: "Configurações",
        component: () => import("@/views/SettingsView.vue"),
      },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];
const router = createRouter({ history: createWebHashHistory(), routes });
router.beforeEach((to) => {
  const logged = !!storage.get("session", null);
  if (!to.meta.public && !logged) return "/login";
  if (to.path === "/login" && logged) return "/";
});
export default router;
