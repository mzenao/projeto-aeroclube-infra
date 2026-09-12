---
name: aeroti-icons
description: Convenções de ícones do AeroTI — a biblioteca correta é lucide-vue-next (NÃO react-icons, NÃO heroicons, NÃO lucide-react). Tabela de ícone por módulo de domínio. Usar sempre antes de adicionar, trocar ou sugerir um ícone na UI.
---

# Ícones no AeroTI

O AeroTI é um projeto **Vue**, não React. A biblioteca de ícones em uso é **`lucide-vue-next`** (já é dependência no `package.json`) — é o mesmo conjunto de ícones "Lucide" popularizado no ecossistema React como `lucide-react`, só que na porta oficial para Vue. Erro comum a evitar: importar de `lucide-react`, `react-icons`, `@heroicons/vue` ou qualquer outra biblioteca — isso quebraria o build (dependência inexistente) e destoaria visualmente do resto do app.

```ts
import { Ticket, Monitor, Wrench } from 'lucide-vue-next'
```

Ícones são usados como componentes Vue (`<component :is="icon" class="size-[18px]" />`), ver `resources/js/components/layout/AppSidebar.vue`.

## Ícone já definido por módulo (não reinvente — reaproveite o mesmo em qualquer lugar do app que represente o módulo)

| Módulo | Ícone Lucide |
|---|---|
| Dashboard | `LayoutDashboard` |
| Chamados | `Ticket` |
| Equipamentos | `Monitor` |
| Funcionários | `Users` |
| Manutenções | `Wrench` |
| Estoque | `Package` |
| Empréstimos | `HandCoins` |
| Fornecedores | `Building2` |
| Infraestrutura | `Network` |
| Base de Conhecimento | `BookOpen` |
| Configurações | `Settings` |
| Marca/logo (AeroTI) | `Plane` |
| Recolher menu lateral | `PanelLeftClose` |

Fonte da verdade: `resources/js/components/layout/AppSidebar.vue`. Se precisar de um ícone para um módulo novo, escolha um nome semântico do catálogo Lucide (https://lucide.dev não precisa ser consultado por URL — os nomes de export do pacote seguem PascalCase do nome do ícone) e mantenha consistência com os já usados (mesmo peso visual `size-[18px]`/`size-4`/`size-5` conforme o contexto).

## Ao adicionar um ícone novo
1. Confirme que o nome existe em `lucide-vue-next` (é a mesma nomenclatura de `lucide-react`/lucide.dev).
2. Importe só o que for usar, nomeado, de `'lucide-vue-next'`.
3. Não crie SVGs inline nem baixe ícones de outro lugar — quebra a consistência visual do set.
