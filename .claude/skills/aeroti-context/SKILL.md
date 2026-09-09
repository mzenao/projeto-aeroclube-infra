---
name: aeroti-context
description: Contexto completo do AeroTI — sistema de gestão de infraestrutura e suporte de TI do Aeroclube de Juiz de Fora. Stack, arquitetura, módulos de domínio e o que é protótipo/mock vs. o que é real. Carregar antes de qualquer alteração no projeto para não presumir peças que não existem.
---

# AeroTI — contexto do projeto

Sistema interno de gestão de infraestrutura e suporte de TI do **Aeroclube de Juiz de Fora**: centraliza chamados (tickets), equipamentos, manutenções, estoque, empréstimos, fornecedores, infraestrutura de rede e base de conhecimento. Arquitetura pensada para rodar futuramente como **aplicação desktop**.

## Estado real do repositório (ler antes de tudo)
- Só existe o **frontend** (Vue 3 + TypeScript), em `resources/js/`. É um **protótipo funcional com dados mockados**, não conectado a nenhum backend.
- `backend/` existe como pasta vazia — Laravel é a stack **planejada**, ainda não implementada. Não referencie models, controllers ou rotas Laravel como se existissem.
- Toda persistência hoje é `localStorage` do navegador via `LocalStorageAdapter` (`resources/js/adapters/storage.ts`), com prefixo de chave `aeroti:`. Login é mock (`admin@aeroti.local` / `admin123`, ver `resources/js/services/index.ts`).
- Existe uma pasta `projeto-aeroclube-infra/` na raiz do repo, não rastreada pelo git e com seu próprio `.git` interno — é uma cópia duplicada acidental do projeto, não código ativo. Ignore como referência; não edite sem confirmar com o usuário.

## Stack
| Camada | Tecnologia |
|---|---|
| Frontend | Vue 3 (`<script setup lang="ts">`), TypeScript, Vite 8 |
| Estado | Pinia (`resources/js/stores/`) |
| Roteamento | vue-router, `createWebHashHistory` (proposital, compatível com desktop) |
| Estilo | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Ícones | `lucide-vue-next` — ver skill `aeroti-icons` |
| PDF | `jspdf` (`ReportService`) |
| Backend | **planejado**: Laravel (ainda não iniciado) |
| Desktop | **planejado**: Tauri (ainda não iniciado, ver `TauriStorageAdapter` stub) |

Alias de import: `@` → `resources/js` (`tsconfig.json` + `vite.config.ts`).

## Módulos de domínio
Dashboard · Chamados (tickets) · Equipamentos · Funcionários · Manutenções · Estoque · Empréstimos · Fornecedores · Infraestrutura · Base de Conhecimento · Configurações · WhatsApp (view auxiliar).

Rotas em `resources/js/router/index.ts`. Só Chamados e Equipamentos têm views dedicadas (`TicketsView`/`TicketDetailView`, `EquipmentView`/`EquipmentDetailView`); os demais módulos reutilizam `GenericView.vue`/`ModuleDetailView.vue` parametrizados por `meta.kind`.

Tipos centrais em `resources/js/types/index.ts`: `User`, `Ticket`, `Message`, `Equipment`, `Employee`, `Maintenance`, `InventoryItem`, `Toast`. `Priority` e `TicketStatus` são uniões de strings em português — esse é o vocabulário de domínio usado em toda a UI, não inventar termos alternativos.

## Arquitetura de dados: Adapter + Service + Mock
1. `resources/js/mocks/*.ts` — dados-semente por entidade.
2. `resources/js/adapters/storage.ts` — `StorageAdapter` (interface `get/set/remove/clear`); `LocalStorageAdapter` é a única implementação real hoje; `ApiStorageAdapter`/`TauriStorageAdapter` são stubs para o futuro.
3. `resources/js/services/index.ts` — `TicketService`, `EquipmentService`, `EmployeeService`, `MaintenanceService`, `InventoryService`, `AuthService`, `WhatsAppService`, `EmailService`, `ReportService`, `ApiClient`, `ModuleService`. Views e stores Pinia falam com esses services, nunca direto com `localStorage`.

`WhatsAppService`, `EmailService` e `ApiClient` são simulações intencionais (não integrações reais) — não "consertar" isso a menos que peçam explicitamente.

## Estilo de código
O código é escrito de forma **muito compacta** de propósito (uma linha por bloco lógico, sem comentários, sem `.prettierrc`/`.eslintrc` no projeto). Ao editar arquivo existente, siga o estilo já presente nele em vez de expandir para um formato multi-linha "mais legível" — isso gera diffs enormes e não foi pedido.

## Agentes e skills relacionados
- Agente `frontend-vue` — trabalho no Vue/TS.
- Agente `backend-laravel` — quando a tarefa for iniciar/expandir o backend Laravel planejado.
- Agente `desktop-tauri` — quando a tarefa envolver empacotamento desktop.
- Skill `aeroti-icons` — qual biblioteca de ícones usar e como escolher o ícone certo por módulo.
- Skill `aeroti-new-module` — passo a passo para adicionar um módulo de domínio novo.
