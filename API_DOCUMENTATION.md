# Documentación de API - Backend Prueba Técnica

## 📋 Información General

- **Base URL**: `http://localhost:4001/api`
- **Formato de respuesta**: JSON
- **Autenticación**: JWT (Bearer Token)

---

## 🔐 Autenticación

### 1. Login
**POST** `/auth/login`

Autenticar usuario y obtener tokens de acceso.

**Body:**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm...",
    "email": "admin@test.com",
    "name": "Administrador Principal",
    "role": "admin"
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas

---

### 2. Refrescar Token
**POST** `/auth/refresh`

Obtener un nuevo access_token usando el refresh_token.

**Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Obtener Perfil
**GET** `/auth/profile`

Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta exitosa (200):**
```json
{
  "id": "cm...",
  "email": "admin@test.com",
  "name": "Administrador Principal",
  "role": "admin",
  "createdAt": "2025-11-01T12:00:00.000Z"
}
```

---

### 4. Validar Token
**GET** `/auth/validate`

Validar si el token actual es válido.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta exitosa (200):**
```json
{
  "valid": true,
  "user": {
    "id": "cm...",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

---

### 5. Logout
**POST** `/auth/logout`

Cerrar sesión del usuario.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

## 👥 Gestión de Usuarios (Solo Admin)

### 1. Crear Usuario
**POST** `/admin/users`

Crear un nuevo usuario en el sistema.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `admin`

**Body:**
```json
{
  "email": "doctor@example.com",
  "password": "password123",
  "name": "Dr. Juan Pérez",
  "role": "doctor",
  "specialty": "Cardiología"  // Opcional, solo para doctores
}
```

**Body (Paciente):**
```json
{
  "email": "paciente@example.com",
  "password": "password123",
  "name": "María García",
  "role": "patient",
  "birthDate": "1990-05-15"  // Opcional, solo para pacientes
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "cm...",
  "email": "doctor@example.com",
  "name": "Dr. Juan Pérez",
  "role": "doctor",
  "createdAt": "2025-11-02T12:00:00.000Z",
  "doctor": {
    "id": "cm...",
    "specialty": "Cardiología"
  },
  "patient": null
}
```

**Errores:**
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No tiene permisos de admin
- `409 Conflict`: Email ya registrado

---

### 2. Listar Usuarios
**GET** `/admin/users`

Obtener lista de todos los usuarios.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `admin`

**Respuesta exitosa (200):**
```json
[
  {
    "id": "cm...",
    "email": "admin@test.com",
    "name": "Administrador Principal",
    "role": "admin",
    "createdAt": "2025-11-01T12:00:00.000Z",
    "doctor": null,
    "patient": null
  },
  {
    "id": "cm...",
    "email": "doctor@test.com",
    "name": "Dr. Juan Pérez",
    "role": "doctor",
    "createdAt": "2025-11-01T12:00:00.000Z",
    "doctor": {
      "id": "cm...",
      "specialty": "Medicina General"
    },
    "patient": null
  }
]
```

---

### 3. Obtener Usuario por ID
**GET** `/admin/users/:id`

Obtener información detallada de un usuario específico.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `admin`

**Parámetros:**
- `id` (string): ID del usuario

**Respuesta exitosa (200):**
```json
{
  "id": "cm...",
  "email": "doctor@test.com",
  "name": "Dr. Juan Pérez",
  "role": "doctor",
  "createdAt": "2025-11-01T12:00:00.000Z",
  "doctor": {
    "id": "cm...",
    "specialty": "Medicina General"
  },
  "patient": null
}
```

**Errores:**
- `404 Not Found`: Usuario no encontrado

---

### 4. Actualizar Usuario
**PATCH** `/admin/users/:id`

Actualizar información de un usuario.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `admin`

**Parámetros:**
- `id` (string): ID del usuario

**Body (todos los campos son opcionales):**
```json
{
  "email": "nuevo@email.com",
  "password": "newpassword123",
  "name": "Nuevo Nombre",
  "role": "doctor",
  "specialty": "Neurología",  // Solo para doctores
  "birthDate": "1990-05-15"   // Solo para pacientes
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "cm...",
  "email": "nuevo@email.com",
  "name": "Nuevo Nombre",
  "role": "doctor",
  "createdAt": "2025-11-01T12:00:00.000Z",
  "doctor": {
    "id": "cm...",
    "specialty": "Neurología"
  },
  "patient": null
}
```

**Errores:**
- `404 Not Found`: Usuario no encontrado
- `409 Conflict`: Email ya registrado

---

### 5. Eliminar Usuario
**DELETE** `/admin/users/:id`

Eliminar un usuario del sistema.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `admin`

**Parámetros:**
- `id` (string): ID del usuario

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

**Errores:**
- `404 Not Found`: Usuario no encontrado

---

## 👨‍⚕️ Doctores

### 1. Listar Doctores
**GET** `/doctors`

Obtener lista de doctores con paginación y filtros.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (number, default: 1): Número de página
- `limit` (number, default: 100): Resultados por página
- `search` (string, opcional): Buscar por nombre o email
- `specialty` (string, opcional): Filtrar por especialidad

**Ejemplo:** `/doctors?page=1&limit=10&specialty=Cardiología`

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "cm...",
      "userId": "cm...",
      "specialty": "Medicina General",
      "createdAt": "2025-11-01T12:00:00.000Z",
      "user": {
        "id": "cm...",
        "email": "doctor@test.com",
        "name": "Dr. Juan Pérez",
        "role": "doctor"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

---

## 🏥 Pacientes

### 1. Listar Pacientes
**GET** `/patients`

Obtener lista de pacientes con paginación y filtros.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `page` (number, default: 1): Número de página
- `limit` (number, default: 100): Resultados por página
- `search` (string, opcional): Buscar por nombre o email

**Ejemplo:** `/patients?page=1&limit=10&search=María`

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "cm...",
      "userId": "cm...",
      "birthDate": "1990-05-15T00:00:00.000Z",
      "createdAt": "2025-11-01T12:00:00.000Z",
      "user": {
        "id": "cm...",
        "email": "patient@test.com",
        "name": "María García",
        "role": "patient"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

---

## 💊 Prescripciones

### 1. Crear Prescripción
**POST** `/prescriptions`

Crear una nueva prescripción médica (Solo doctores).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `doctor`

**Body:**
```json
{
  "patientId": "cm...",
  "notes": "Tomar con alimentos",
  "items": [
    {
      "name": "Paracetamol 500mg",
      "dosage": "1 tableta cada 8 horas",
      "quantity": 30,
      "instructions": "Tomar después de las comidas"
    },
    {
      "name": "Ibuprofeno 400mg",
      "dosage": "1 tableta cada 12 horas",
      "quantity": 20,
      "instructions": "Solo en caso de dolor"
    }
  ]
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "cm...",
  "code": "RX-2025-001",
  "status": "pending",
  "notes": "Tomar con alimentos",
  "createdAt": "2025-11-02T12:00:00.000Z",
  "consumedAt": null,
  "patientId": "cm...",
  "authorId": "cm...",
  "items": [
    {
      "id": "cm...",
      "name": "Paracetamol 500mg",
      "dosage": "1 tableta cada 8 horas",
      "quantity": 30,
      "instructions": "Tomar después de las comidas"
    }
  ]
}
```

---

### 2. Listar Prescripciones (Doctor)
**GET** `/prescriptions`

Obtener prescripciones del doctor autenticado.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `doctor`

**Query Parameters:**
- `status` (string, opcional): `pending` o `consumed`
- `patientId` (string, opcional): Filtrar por ID de paciente

**Respuesta exitosa (200):**
```json
[
  {
    "id": "cm...",
    "code": "RX-2025-001",
    "status": "pending",
    "notes": "Tomar con alimentos",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "consumedAt": null,
    "patient": {
      "id": "cm...",
      "user": {
        "name": "María García",
        "email": "patient@test.com"
      }
    },
    "items": [
      {
        "id": "cm...",
        "name": "Paracetamol 500mg",
        "dosage": "1 tableta cada 8 horas",
        "quantity": 30,
        "instructions": "Tomar después de las comidas"
      }
    ]
  }
]
```

---

### 3. Obtener Prescripción por ID
**GET** `/prescriptions/:id`

Obtener detalles de una prescripción específica.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Parámetros:**
- `id` (string): ID de la prescripción

**Respuesta exitosa (200):**
```json
{
  "id": "cm...",
  "code": "RX-2025-001",
  "status": "pending",
  "notes": "Tomar con alimentos",
  "createdAt": "2025-11-02T12:00:00.000Z",
  "consumedAt": null,
  "patient": {
    "id": "cm...",
    "user": {
      "name": "María García",
      "email": "patient@test.com"
    }
  },
  "author": {
    "id": "cm...",
    "user": {
      "name": "Dr. Juan Pérez",
      "email": "doctor@test.com"
    }
  },
  "items": [
    {
      "id": "cm...",
      "name": "Paracetamol 500mg",
      "dosage": "1 tableta cada 8 horas",
      "quantity": 30,
      "instructions": "Tomar después de las comidas"
    }
  ]
}
```

---

### 4. Listar Todas las Prescripciones (Admin)
**GET** `/prescriptions/admin/prescriptions`

Obtener todas las prescripciones del sistema (Solo admin).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `admin`

**Query Parameters:**
- `status` (string, opcional): `pending` o `consumed`
- `doctorId` (string, opcional): Filtrar por ID de doctor
- `patientId` (string, opcional): Filtrar por ID de paciente

**Respuesta:** Igual que listar prescripciones

---

### 5. Mis Prescripciones (Paciente)
**GET** `/prescriptions/me/prescriptions`

Obtener prescripciones del paciente autenticado.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `patient`

**Query Parameters:**
- `status` (string, opcional): `pending` o `consumed`

**Respuesta:** Igual que listar prescripciones

---

### 6. Consumir Prescripción
**PUT** `/prescriptions/:id/consume`

Marcar una prescripción como consumida.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `patient` (solo el paciente dueño de la prescripción)

**Parámetros:**
- `id` (string): ID de la prescripción

**Respuesta exitosa (200):**
```json
{
  "id": "cm...",
  "code": "RX-2025-001",
  "status": "consumed",
  "consumedAt": "2025-11-02T14:30:00.000Z",
  "notes": "Tomar con alimentos",
  "createdAt": "2025-11-02T12:00:00.000Z"
}
```

**Errores:**
- `400 Bad Request`: La prescripción ya fue consumida
- `403 Forbidden`: No tienes permiso para consumir esta prescripción

---

### 7. Descargar PDF de Prescripción
**GET** `/prescriptions/:id/pdf`

Generar y descargar PDF de la prescripción.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Parámetros:**
- `id` (string): ID de la prescripción

**Respuesta exitosa (200):**
- Content-Type: `application/pdf`
- Archivo PDF descargable

---

## 📊 Métricas del Sistema (Solo Admin)

### 1. Obtener Métricas
**GET** `/admin/metrics`

Obtener estadísticas del sistema.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Roles requeridos:** `admin`

**Query Parameters:**
- `from` (string, opcional): Fecha inicio (ISO 8601)
- `to` (string, opcional): Fecha fin (ISO 8601)

**Ejemplo:** `/admin/metrics?from=2025-11-01&to=2025-11-30`

**Respuesta exitosa (200):**
```json
{
  "users": {
    "total": 10,
    "byRole": {
      "admin": 1,
      "doctor": 4,
      "patient": 5
    }
  },
  "prescriptions": {
    "total": 50,
    "pending": 20,
    "consumed": 30
  },
  "recentActivity": {
    "newUsers": 3,
    "newPrescriptions": 10
  }
}
```

---

## 🏥 Health Check

### 1. Health Check
**GET** `/`

Verificar el estado del servidor.

**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T12:00:00.000Z",
  "service": "Backend Prueba Técnica"
}
```

---

### 2. Health Check Detallado
**GET** `/healthz`

Verificar el estado del servidor y dependencias.

**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

---

## 🔑 Roles y Permisos

### Roles disponibles:
- **admin**: Acceso completo al sistema
- **doctor**: Puede crear y ver prescripciones
- **patient**: Solo puede ver sus propias prescripciones

### Matriz de permisos:

| Endpoint | Admin | Doctor | Patient |
|----------|-------|--------|---------|
| POST /admin/users | ✅ | ❌ | ❌ |
| GET /admin/users | ✅ | ❌ | ❌ |
| GET /admin/users/:id | ✅ | ❌ | ❌ |
| PATCH /admin/users/:id | ✅ | ❌ | ❌ |
| DELETE /admin/users/:id | ✅ | ❌ | ❌ |
| GET /doctors | ✅ | ✅ | ✅ |
| GET /patients | ✅ | ✅ | ✅ |
| POST /prescriptions | ❌ | ✅ | ❌ |
| GET /prescriptions | ❌ | ✅ | ❌ |
| GET /prescriptions/admin/prescriptions | ✅ | ❌ | ❌ |
| GET /prescriptions/me/prescriptions | ❌ | ❌ | ✅ |
| PUT /prescriptions/:id/consume | ❌ | ❌ | ✅ |
| GET /admin/metrics | ✅ | ❌ | ❌ |

---

## ⚠️ Códigos de Error

### Códigos HTTP comunes:

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: No tiene permisos para esta acción
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (ej: email duplicado)
- **500 Internal Server Error**: Error del servidor

### Formato de error:

```json
{
  "statusCode": 400,
  "timestamp": "2025-11-02T12:00:00.000Z",
  "path": "/api/admin/users",
  "method": "POST",
  "error": "Bad Request",
  "message": "Validation failed"
}
```

---

## 🔒 Autenticación con Bearer Token

Para endpoints protegidos, incluir el token en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Ejemplo con fetch:

```javascript
const response = await fetch('http://localhost:4001/api/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Ejemplo con axios:

```javascript
const response = await axios.get('http://localhost:4001/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 📝 Notas Importantes

1. **Tokens de acceso**: Expiran en 15 minutos
2. **Refresh tokens**: Expiran en 7 días
3. **Paginación**: Por defecto devuelve 100 resultados máximo
4. **Fechas**: Todas las fechas están en formato ISO 8601 (UTC)
5. **IDs**: Todos los IDs son strings en formato CUID

---

## 🚀 Credenciales de Prueba

### Admin:
- **Email**: `admin@test.com`
- **Password**: `admin123`

### Doctor:
- **Email**: `dr@test.com`
- **Password**: `dr123`

### Paciente:
- **Email**: `patient@test.com`
- **Password**: `patient123`

---

## 📚 Swagger Documentation

Para documentación interactiva, visitar:

```
http://localhost:4001/api/docs
```

---

**Última actualización**: 2 de Noviembre, 2025
