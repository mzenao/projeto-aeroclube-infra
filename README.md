# AeroTI

Protótipo desktop-first de gestão de infraestrutura e suporte do Aeroclube de Juiz de Fora.

```bash
npm install
npm run dev
```

Credenciais: `admin@aeroti.local` / `admin123`.

## Validação

```bash
npm test
npm run build
```

Os testes de regressão usam armazenamento em memória e não alteram os dados do navegador.

## Persistência local

Chamados armazenam anexos (até 2 MB por chamado), notas internas, eventos e tempo de atendimento. O prazo é opcional e informado manualmente no cadastro. Configurações de organização, perfil, logo e preferências são salvas neste navegador. Integrações externas e permissões continuam demonstrativas.

Dashboard, alertas e pesquisa consultam os mesmos cadastros usados pelas telas. Estoque, manutenções e empréstimos possuem campos próprios para quantidades, custos e datas; registros anteriores são preservados.

## Arquitetura

O frontend Vue é independente e usa adapters de persistência. `LocalStorageAdapter` é a implementação atual; adapters de API e Tauri são contratos preparados. A pasta `backend/` documenta o encaixe futuro do Laravel sem acoplar o protótipo.
