# Proyecto Prescripciones - Dashboard Médico

## Stack Técnico
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Zustand (State Management)
- Zod (Validations)
- Recharts (Charts)
- Lucide React (Icons)

## Estructura del Proyecto
- `src/app/` - Páginas con App Router
- `src/components/` - Componentes reutilizables
- `src/lib/` - API client, auth, guards, utils
- `src/store/` - Zustand stores

## Roles y Rutas
- **Admin**: `/admin` - Dashboard con métricas
- **Doctor**: `/doctor/prescriptions` - Crear y gestionar prescripciones
- **Patient**: `/patient/prescriptions` - Ver y consumir prescripciones

## API Base URL
- Variable de entorno: `NEXT_PUBLIC_API_BASE_URL`

## Autenticación
- JWT con access token y refresh token
- Auto-refresh en API client
- Role-based access control (RBAC)
