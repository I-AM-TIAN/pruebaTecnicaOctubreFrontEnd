# Guía Rápida - Sistema de Prescripciones

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con la URL de tu API

# 3. Ejecutar en desarrollo
npm run dev
```

## 📱 Rutas Principales

### Públicas
- `/login` - Página de inicio de sesión

### Admin (requiere rol: admin)
- `/admin` - Dashboard con métricas y KPIs

### Doctor (requiere rol: doctor)
- `/doctor/prescriptions` - Listar prescripciones
- `/doctor/prescriptions/new` - Crear nueva prescripción
- `/doctor/prescriptions/[id]` - Ver detalle de prescripción

### Paciente (requiere rol: patient)
- `/patient/prescriptions` - Listar mis prescripciones
- `/patient/prescriptions/[id]` - Ver detalle y consumir

## 🔐 Sistema de Autenticación

### JWT Auto-Refresh
El sistema implementa auto-refresh automático de tokens:
1. Cada request incluye el `access token` en el header
2. Si el API responde con 401, automáticamente se usa el `refresh token`
3. Se obtiene un nuevo `access token` y se reintenta el request
4. Si el refresh falla, se redirige al login

### Implementación en `src/lib/api-client.ts`:

```typescript
// El cliente detecta 401 y hace refresh automáticamente
const response = await apiClient('/endpoint');
// No necesitas manejar el refresh manualmente
```

## 📊 Componentes Clave

### DataTable
Tabla reutilizable con paginación, ordenamiento y estados:

```typescript
<DataTable
  data={items}
  columns={columns}
  isLoading={loading}
  error={error}
  pagination={pagination}
  actions={(item) => <button>Acción</button>}
/>
```

### Toast
Sistema de notificaciones:

```typescript
const toast = useToast();

toast.success('Operación exitosa');
toast.error('Ocurrió un error');
toast.warning('Advertencia');
toast.info('Información');
```

### RoleGuard
Protección de rutas por rol:

```typescript
<RoleGuard allowedRoles={['admin', 'doctor']}>
  <ProtectedContent />
</RoleGuard>
```

## 🎨 Estilos y Diseño

### Colores Principales
- **Primary**: `#0ea5e9` (azul) - Usado para botones principales
- **Success**: Verde - Para acciones positivas
- **Error**: Rojo - Para errores y acciones destructivas
- **Warning**: Amarillo - Para alertas

### Clases Utility Comunes

```css
/* Botones */
.btn-primary: bg-black text-white rounded-lg hover:bg-gray-800
.btn-secondary: border border-gray-300 text-gray-700 hover:bg-gray-50

/* Cards */
.card: bg-white rounded-lg border border-gray-200 p-6 shadow-sm

/* Estados */
.badge-pending: bg-yellow-100 text-yellow-800
.badge-consumed: bg-green-100 text-green-800
```

## 🔄 Flujo de Datos

### Autenticación
```
Login → JWT Tokens → LocalStorage → AuthStore → Protected Routes
```

### Doctor - Crear Prescripción
```
Form → Validate → POST /prescriptions → Toast → Redirect
```

### Paciente - Consumir Prescripción
```
Click → Confirm Dialog → PUT /consume → Update State → Toast
```

## 🛠️ Estructura de Archivos Importante

```
src/
├── app/
│   ├── layout.tsx              # Layout raíz con AuthProvider
│   ├── login/page.tsx          # Página de login
│   ├── admin/
│   │   ├── layout.tsx          # Layout con RoleGuard
│   │   └── page.tsx            # Dashboard
│   ├── doctor/
│   │   └── prescriptions/
│   │       ├── page.tsx        # Lista
│   │       ├── new/page.tsx    # Crear
│   │       └── [id]/page.tsx   # Detalle
│   └── patient/
│       └── prescriptions/
│           ├── page.tsx        # Lista
│           └── [id]/page.tsx   # Detalle + consumir
│
├── components/
│   ├── ui/                     # Componentes reutilizables
│   ├── guards/                 # RoleGuard
│   ├── layout/                 # Sidebar
│   └── providers/              # AuthProvider
│
├── lib/
│   ├── api-client.ts           # Cliente HTTP con auto-refresh
│   └── auth.ts                 # Funciones de auth
│
├── store/
│   └── auth-store.ts           # Estado global de autenticación
│
└── types/
    └── index.ts                # Tipos TypeScript compartidos
```

## 🐛 Debugging

### Ver estado de autenticación
```typescript
import { useAuthStore } from '@/store/auth-store';

const { user, isAuthenticated } = useAuthStore();
console.log('User:', user);
```

### Ver tokens
```typescript
import { getTokens } from '@/lib/api-client';

const tokens = getTokens();
console.log('Tokens:', tokens);
```

### Limpiar sesión
```typescript
import { clearTokens } from '@/lib/api-client';

clearTokens(); // Limpia tokens del localStorage
```

## 📦 Dependencias Principales

- **next**: ^15.0.3 - Framework React
- **react**: ^18.3.1 - Librería UI
- **zustand**: ^5.0.2 - Estado global
- **zod**: ^3.23.8 - Validación de esquemas
- **recharts**: ^2.15.0 - Gráficos
- **lucide-react**: ^0.469.0 - Iconos
- **date-fns**: ^4.1.0 - Manejo de fechas
- **tailwindcss**: ^3.4.17 - Estilos

## 🚨 Recordatorios Next.js 15

### Params son Async
```typescript
// ❌ Incorrecto
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id; // Error!
}

// ✅ Correcto
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>();
  
  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);
}
```

## 💡 Tips de Desarrollo

1. **Hot Reload**: Los cambios se reflejan automáticamente
2. **TypeScript**: El IDE mostrará errores en tiempo real
3. **ESLint**: Ejecuta `npm run lint` para ver warnings
4. **Build**: Ejecuta `npm run build` antes de hacer commit

## 📞 Soporte

Si encuentras problemas:
1. Verifica que el backend esté corriendo
2. Revisa las variables de entorno
3. Limpia `node_modules` y reinstala: `rm -rf node_modules && npm install`
4. Limpia el cache de Next.js: `rm -rf .next`

---

**Desarrollado con ❤️ para la prueba técnica**
