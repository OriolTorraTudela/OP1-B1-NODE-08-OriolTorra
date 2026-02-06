# Task Manager API - T8 (RBAC + Auditoria)

Implementació completa dels requisits del PDF **OP1-B1-NODE-08**: sistema avançat de rols/permisos amb auditoria, rutes admin i protecció per permisos.

## Requisits
- Node.js 18+ (recomanat)
- MongoDB (local o Atlas)

## Instal·lació
```bash
cd task-manager-api
cp .env.example .env
npm install
npm run dev
```

## Variables d'entorn
- `MONGO_URI`: connexió a MongoDB
- `JWT_SECRET`: secret JWT
- `JWT_EXPIRES_IN`: duració del token (ex: `7d`)
- `PORT`: port del servidor

## Seeds automàtics
En arrencar el servidor (`server.js`) s'executa `utils/seedAll.js` i crea:
- Permisos del sistema (tasks:*, users:*, roles:*, permissions:*, audit:read, reports:*)
- Rols del sistema: `admin`, `user`
- Rols no sistèmics: `viewer`, `editor`

## Flux ràpid per provar (Postman)
1) Registra 2 usuaris:
- Un usuari normal (ja rep rol `user`)
- Un usuari que convertiràs en admin assignant-li el rol `admin`

2) Login per obtenir tokens

3) Amb token d'admin:
- Gestiona permisos / rols / auditoria i assigna rols a usuaris

4) Amb token de user:
- Prova CRUD de tasques i verifica que no pot accedir a `/api/admin/*`

## Rutes principals
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/check-permission`

### Tasks (protegides per permisos)
- `GET /api/tasks` (`tasks:read`)
- `POST /api/tasks` (`tasks:create`)
- `GET /api/tasks/:id` (`tasks:read`)
- `PUT /api/tasks/:id` (`tasks:update`)
- `DELETE /api/tasks/:id` (`tasks:delete`)

### Admin (protegides per permisos)
- `GET /api/admin/users` (`users:read`)
- `POST /api/admin/users/:userId/roles` (`users:manage`)
- `DELETE /api/admin/users/:userId/roles/:roleId` (`users:manage`)
- `GET /api/admin/users/:userId/permissions` (`users:read`)

- `POST /api/admin/permissions` (`permissions:manage`)
- `GET /api/admin/permissions` (`permissions:read`)
- `GET /api/admin/permissions/categories` (`permissions:read`)
- `PUT /api/admin/permissions/:id` (`permissions:manage`)
- `DELETE /api/admin/permissions/:id` (`permissions:manage`)

- `POST /api/admin/roles` (`roles:manage`)
- `GET /api/admin/roles` (`roles:read`)
- `GET /api/admin/roles/:id` (`roles:read`)
- `PUT /api/admin/roles/:id` (`roles:manage`)
- `DELETE /api/admin/roles/:id` (`roles:manage`)
- `POST /api/admin/roles/:id/permissions` (`roles:manage`)
- `DELETE /api/admin/roles/:id/permissions/:permissionId` (`roles:manage`)

- `GET /api/admin/audit-logs` (`audit:read`)
- `GET /api/admin/audit-logs/:id` (`audit:read`)
- `GET /api/admin/audit-logs/user/:userId` (`audit:read`)
- `GET /api/admin/audit-logs/stats` (`audit:read`)

## Auditoria
- Es registra automàticament:
  - POST/PUT/DELETE
  - GET sota `/api/admin/*` (lectura sensible)
  - intents denegats per permisos (403) via `checkPermission()`
- Camps: userId, action, resource, resourceType, status, changes, ipAddress, userAgent, timestamp.

## Notes
- Les tasques són **pròpies** (filtrades per `owner`) per simplificar i complir principi de menor privilegi.
