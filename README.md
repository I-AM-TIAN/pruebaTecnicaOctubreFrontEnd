# Sistema de Prescripciones Médicas

Dashboard web para la gestión de prescripciones médicas con roles de Admin, Doctor y Paciente.

## 🚀 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS 4
- **Estado Global**: Zustand
- **Validaciones**: Zod
- **Gráficos**: Recharts
- **Iconos**: Lucide React
- **Fechas**: date-fns

## 📋 Características

### Roles y Funcionalidades

#### Admin
- Dashboard con métricas y KPIs
- Visualización de estadísticas (doctores, pacientes, prescripciones)
- Gráficos de prescripciones por día y estado
- Ranking de doctores más activos

#### Doctor
- Listar prescripciones propias
- Crear nuevas prescripciones con múltiples medicamentos
- Ver detalles de prescripciones
- Filtros por estado, fecha

#### Paciente
- Listar prescripciones recibidas
- Ver detalles de prescripciones
- Marcar prescripciones como consumidas
- Descargar prescripciones en PDF

### Características Técnicas

- ✅ Autenticación con JWT (access + refresh token)
- ✅ Auto-refresh de tokens expirados
- ✅ Protección de rutas por rol (RBAC)
- ✅ Persistencia de filtros en query params
- ✅ Estados de carga, error y vacío
- ✅ Toasts para feedback al usuario
- ✅ Diseño responsive
- ✅ Paginación en listados

## 🛠️ Instalación

### Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend API corriendo (ver variable de entorno)

### Pasos

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd proyecto-prescripciones
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

> **Nota**: Ajusta la URL según tu configuración del backend.

4. **Ejecutar en modo desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

5. **Compilar para producción**

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
proyecto-prescripciones/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── login/             # Página de inicio de sesión
│   │   ├── admin/             # Dashboard administrativo
│   │   ├── doctor/            # Módulo de doctor
│   │   │   └── prescriptions/ # Gestión de prescripciones
│   │   ├── patient/           # Módulo de paciente
│   │   │   └── prescriptions/ # Consulta de prescripciones
│   │   ├── 403/               # Página de acceso denegado
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── page.tsx           # Página principal
│   │   └── globals.css        # Estilos globales
│   │
│   ├── components/
│   │   ├── guards/            # Guards de autenticación y roles
│   │   ├── layout/            # Componentes de layout (Sidebar)
│   │   ├── providers/         # Providers (Auth)
│   │   └── ui/                # Componentes UI reutilizables
│   │
│   ├── lib/                   # Utilidades y servicios
│   │   ├── api-client.ts      # Cliente HTTP con auto-refresh
│   │   └── auth.ts            # Servicios de autenticación
│   │
│   ├── store/                 # Zustand stores
│   │   └── auth-store.ts      # Estado de autenticación
│   │
│   └── types/                 # Tipos TypeScript
│       └── index.ts           # Tipos compartidos
│
├── .env.local.example         # Ejemplo de variables de entorno
├── next.config.js             # Configuración de Next.js
├── tailwind.config.js         # Configuración de TailwindCSS
├── tsconfig.json              # Configuración de TypeScript
└── package.json               # Dependencias del proyecto
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) con dos tokens:

- **Access Token**: Token de corta duración para autenticar requests
- **Refresh Token**: Token de larga duración para renovar el access token

### Flujo de Autenticación

1. Usuario inicia sesión con email/contraseña
2. Backend devuelve access token + refresh token
3. Frontend guarda tokens en localStorage
4. En cada request, se envía el access token en header `Authorization: Bearer <token>`
5. Si el access token expira (401), se usa el refresh token automáticamente
6. El nuevo access token se usa para reintentar el request original

### Credenciales de Prueba

```
Admin:
  Email: admin@test.com
  Password: (según tu backend)

Doctor:
  Email: doctor@test.com
  Password: (según tu backend)

Paciente:
  Email: patient@test.com
  Password: (según tu backend)
```

## 🎨 Diseño y UI

- **Colores principales**: Sistema de colores primary (azul) con gradientes
- **Componentes**: Cards, Tables, Forms, Modals, Toasts
- **Iconos**: Lucide React (más de 1000 iconos)
- **Responsive**: Mobile-first con breakpoints de Tailwind

## 🌐 API Endpoints Utilizados

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/refresh` - Renovar access token
- `GET /auth/profile` - Obtener perfil del usuario

### Prescripciones (Doctor)
- `GET /prescriptions?mine=true` - Listar prescripciones propias
- `POST /prescriptions` - Crear prescripción
- `GET /prescriptions/:id` - Detalle de prescripción

### Prescripciones (Paciente)
- `GET /me/prescriptions` - Listar prescripciones del paciente
- `GET /prescriptions/:id` - Detalle de prescripción
- `PUT /prescriptions/:id/consume` - Marcar como consumida
- `GET /prescriptions/:id/pdf` - Descargar PDF

### Admin
- `GET /admin/metrics` - Métricas del sistema

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar producción
npm start

# Linting
npm run lint
```

## 🔧 Configuración Avanzada

### Modificar el API Base URL

Edita `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://tu-api.com/api
```

### Cambiar Puerto de Desarrollo

```bash
npm run dev -- -p 3001
```

### Modificar Colores del Theme

Edita `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // tus colores personalizados
      },
    },
  },
}
```

## 📝 Notas Importantes

### Next.js 15 - Params Async

En Next.js 15, los params en páginas dinámicas son **async** (Promise). Ejemplo:

```tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  const [id, setId] = useState<string>();

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);
  
  // ...
}
```

### Tailwind CSS 4

Esta versión usa TailwindCSS 4, asegúrate de revisar la documentación oficial para cambios de sintaxis.

## 🐛 Troubleshooting

### Error: Cannot find module 'next'

```bash
rm -rf node_modules
npm install
```

### Error: CORS

Verifica que el backend tenga configurado CORS correctamente para aceptar requests desde `http://localhost:3000`

### Token expira muy rápido

Ajusta la duración del access token en el backend o la frecuencia del auto-refresh en el frontend.

## 📄 Licencia

Este proyecto es parte de una prueba técnica.

## 👨‍💻 Autor

Desarrollado como parte de la prueba técnica Full-stack App de Prescripciones Médicas.

---

**Nota**: Asegúrate de que el backend esté corriendo antes de iniciar el frontend.
