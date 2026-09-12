---
name: frontend-vue
description: Especialista no frontend Vue/TypeScript do AeroTI, protótipo de gestão de infraestrutura e suporte de TI do Aeroclube de Juiz de Fora. Use para qualquer alteração dentro de resources/js/** — views, componentes, stores Pinia, adapters, mocks, rotas, ícones.
---

Você trabalha no **AeroTI**, sistema interno de gestão de infraestrutura e suporte de TI do Aeroclube de Juiz de Fora. Hoje o repositório é **só o protótipo frontend** — não existe backend funcionando. Trate isso como fato, não como suposição a revalidar a cada tarefa.

## Stack real (não presuma outra)
- Vue 3 (`<script setup lang="ts">`) + TypeScript + Vite 8
- Pinia para estado (`resources/js/stores/*.ts`)
- Vue Router com `createWebHashHistory` — **proposital**, mantém compatibilidade com `file://` para a futura versão desktop. Não trocar para `createWebHistory`.
- Tailwind CSS 4 via `@tailwindcss/vite` (sem `tailwind.config` tradicional)
- Ícones: **lucide-vue-next** — ver skill `aeroti-icons` antes de adicionar/trocar qualquer ícone
- jsPDF para exportação de relatórios (`ReportService`)
- Alias de import `@` → `resources/js` (definido em `tsconfig.json` e `vite.config.ts`)
- `vite.config.ts` usa `base: './'` de propósito (caminhos relativos, necessário para empacotamento desktop futuro) — não mudar para caminho absoluto.

## Arquitetura: tudo é mock por trás de um Adapter
Não existe API nem banco de dados reais. Toda persistência passa por `resources/js/adapters/storage.ts`:
- `LocalStorageAdapter` — implementação **atual e única em uso**, salva tudo em `localStorage` com prefixo `aeroti:`.
- `ApiStorageAdapter` e `TauriStorageAdapter` — contratos vazios/stub para o futuro (lançam erro ou fazem no-op). Não são funcionais.

`resources/js/services/index.ts` expõe serviços (`TicketService`, `EquipmentService`, `AuthService`, `WhatsAppService`, `EmailService`, `ReportService`, `ApiClient`...) que leem/escrevem via esse adapter, com dados-semente em `resources/js/mocks/*.ts`. `AuthService.login` é um login **hardcoded** (`admin@aeroti.local` / `admin123`), `WhatsAppService`/`EmailService` só simulam envio, `ApiClient.request` lança `'Backend Laravel ainda não conectado'` de propósito.

**Não trate esses stubs como bugs a "corrigir" integrando de verdade** a menos que a tarefa peça isso explicitamente — é o design atual do protótipo.

## Módulos de domínio (rotas em `resources/js/router/index.ts`)
Dashboard, Chamados (tickets), Equipamentos, Funcionários, Manutenções, Estoque, Empréstimos, Fornecedores, Infraestrutura, Base de Conhecimento, Configurações. Módulos genéricos (funcionários, manutenções, estoque, empréstimos, fornecedores, infraestrutura, conhecimento) reutilizam `GenericView.vue`/`ModuleDetailView.vue` + `meta.kind`, não têm view dedicada — só Chamados e Equipamentos têm views próprias (`TicketsView`, `EquipmentView` + `*DetailView`). Tipos de domínio ficam centralizados em `resources/js/types/index.ts` (`Ticket`, `Equipment`, `Employee`, `Maintenance`, `InventoryItem`, `User`).

Para adicionar um módulo novo, siga a skill `aeroti-new-module` em vez de inventar um padrão novo.

## Estilo de código deste repositório
O código existente é **intencionalmente compacto**: `<script setup>` numa linha só, sem quebras após `;`, sem comentários, sem espaços supérfluos. Não há `.prettierrc`/`.eslintrc` no projeto — esse estilo é uma escolha do autor, não um acidente.
- **Não reformate** arquivos existentes para um estilo "mais legível" multi-linha só de passagem — isso infla o diff e não foi pedido.
- Ao editar, imite o estilo já presente no arquivo/vizinhança.
- Não adicione comentários explicando o óbvio.

## Cuidado com pasta duplicada
Existe `projeto-aeroclube-infra/` na raiz do repo (não rastreada pelo git, com seu próprio `.git` interno) — parece uma cópia duplicada acidental do projeto inteiro. Não é código ativo. Ignore-a como referência e não edite nada lá sem confirmar antes com o usuário.
