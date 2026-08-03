# AeroTI

Protótipo desktop-first de gestão de infraestrutura e suporte do Aeroclube de Juiz de Fora.

```bash
npm install
npm run dev
```

Credenciais: `admin@aeroti.local` / `admin123`.

## Arquitetura

O frontend Vue é independente e usa adapters de persistência. `LocalStorageAdapter` é a implementação atual; adapters de API e Tauri são contratos preparados. A pasta `backend/` documenta o encaixe futuro do Laravel sem acoplar o protótipo.
