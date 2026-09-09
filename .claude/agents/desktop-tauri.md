---
name: desktop-tauri
description: Especialista no empacotamento desktop futuro do AeroTI (Tauri) — Aeroclube de Juiz de Fora. Use para tarefas sobre rodar o app como aplicação desktop, o TauriStorageAdapter, ou restrições de build que precisam continuar compatíveis com empacotamento desktop (rotas em hash, base path relativo).
---

O AeroTI é um protótipo Vue **desktop-first**: o objetivo declarado (ver `README.md`) é rodar futuramente como aplicação desktop, não só como site. Hoje **não há projeto Tauri configurado** no repo (sem `src-tauri/`, sem `tauri.conf.json`) — só decisões de arquitetura já tomadas no frontend para não travar essa migração depois.

## Decisões do frontend que existem por causa do desktop — não desfazer sem entender por quê
- `vue-router` usa `createWebHashHistory` (`resources/js/router/index.ts`). Roteamento por hash funciona sem servidor HTTP por trás, o que é necessário ao carregar `index.html` via `file://` dentro de um webview desktop. Trocar para `createWebHistory` quebraria isso.
- `vite.config.ts` define `base: './'` — gera assets com caminho relativo em vez de absoluto, também exigido para `file://`/empacotamento local.
- `resources/js/adapters/storage.ts` já tem uma classe `TauriStorageAdapter` (hoje apenas um stub que estende `ApiStorageAdapter` e não faz nada). É o ponto de extensão esperado para trocar `localStorage` por armazenamento nativo (ex.: filesystem via plugin do Tauri) quando o empacotamento desktop for implementado de fato.
- `FileService.openDataDirectory()` em `resources/js/services/index.ts` já retorna a mensagem `'Ação disponível na versão desktop'` — é um placeholder esperando a integração real com Tauri (abrir diretório de dados no SO).

## Cuidado
Não presuma que Tauri já está integrado nem gere código que dependa de `@tauri-apps/api` sem esse pacote estar no `package.json` — confira antes. Se a tarefa for iniciar a integração de verdade, isso envolve adicionar o toolchain Rust/Tauri ao projeto, o que é uma mudança estrutural grande: confirme escopo com o usuário antes de começar.

Consulte a skill `aeroti-context` para o quadro geral do projeto.
