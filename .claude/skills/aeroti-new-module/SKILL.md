---
name: aeroti-new-module
description: Passo a passo para adicionar um novo módulo de domínio ao AeroTI (rota, item de menu, tipo, mock, service) seguindo os padrões já existentes no protótipo. Use quando a tarefa for "adicionar uma nova seção/tela/módulo" ao sistema.
---

# Adicionar um módulo de domínio novo ao AeroTI

Antes de seguir este passo a passo, carregue a skill `aeroti-context` se ainda não tiver o quadro geral do projeto.

Módulos "genéricos" (todos exceto Chamados e Equipamentos, que têm views próprias) seguem o mesmo padrão reutilizável — não crie uma view dedicada a menos que a tarefa peça uma UI realmente diferente do padrão de lista+detalhe genérico.

## Passos
1. **Tipo de domínio** — adicione a interface em `resources/js/types/index.ts`, no mesmo estilo compacto das existentes (uma linha, campos com `;`).
2. **Mock/seed** — crie `resources/js/mocks/<modulo>.ts` com um array de exemplo, e exporte via `resources/js/mocks/index.ts`. Módulos genéricos guardam seed em `resources/js/mocks/modules.ts` (`moduleSeeds`), chaveado por `kind`.
3. **Service** — se precisar de operações específicas além de listar, adicione em `resources/js/services/index.ts` seguindo o padrão `Repository<T>`/`XxxService` já usado (`list`, `save`, `find`...). Para módulos genéricos, `ModuleService` já cobre `list`/`save`/`find` por `kind`.
4. **Rota** — adicione em `resources/js/router/index.ts`, dentro do array `routes` filho de `/`. Para um módulo genérico, aponte para `GenericView.vue` com `meta: { kind: '<nome>' }` e inclua `<nome>` na regex do path `:module(...)` da rota de detalhe.
5. **Item de menu** — adicione em `resources/js/components/layout/AppSidebar.vue`, no array `items` (`[label, path, icon]`). Escolha o ícone seguindo a skill `aeroti-icons` — não use um ícone já atribuído a outro módulo.
6. **Store Pinia**, só se o módulo precisar de estado reativo compartilhado além do que `services`/`ModuleService` já resolvem (a maioria dos módulos genéricos não precisa de store própria — olhe como Chamados usa `stores/tickets.ts` só porque tem lógica própria, enquanto Estoque/Fornecedores/etc. não têm store dedicada).

## Manter consistência
- Siga o estilo de código compacto do arquivo que está editando (ver `aeroti-context`).
- Não crie endpoints de API nem chamadas HTTP — tudo passa pelo `StorageAdapter`/`localStorage` neste estágio do projeto.
- Nomes de campo e status em português, como já está em `types/index.ts` — não traduza para inglês nem misture idiomas dentro do mesmo domínio.
