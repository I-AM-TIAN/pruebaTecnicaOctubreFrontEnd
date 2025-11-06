# 🎤 Prescripciones por Audio - Guía de Uso

## 🌟 Descripción

Esta funcionalidad permite a los doctores crear prescripciones médicas de forma rápida y natural, simplemente grabando un audio donde dictan los medicamentos. El sistema utiliza Inteligencia Artificial para:

1. **Transcribir** el audio a texto (usando ElevenLabs)
2. **Extraer** automáticamente la información estructurada (usando OpenAI)
3. **Crear** la prescripción en la base de datos

---

## 🚀 Cómo Acceder

### Opción 1: Desde el Dashboard de Doctor
1. Inicia sesión como **Doctor**
2. Ve a la sección **"Prescripciones"**
3. Haz clic en el botón rojo **"Crear por Audio"** (icono de micrófono)

### Opción 2: URL Directa
```
/doctor/prescriptions/new-audio
```

---

## 📝 Paso a Paso

### 1. Seleccionar Paciente
- En el dropdown, selecciona el paciente para quien será la prescripción
- Puedes buscar por nombre o email

### 2. Grabar o Subir Audio

#### Opción A: Grabar Audio en Tiempo Real
1. Haz clic en **"Iniciar Grabación"** (botón rojo con micrófono)
2. Permite el acceso al micrófono cuando el navegador lo solicite
3. Dicta claramente los medicamentos (ver ejemplo abajo)
4. Puedes **pausar** y **reanudar** la grabación si es necesario
5. Haz clic en **"Detener"** cuando termines
6. Escucha el audio grabado para verificar

#### Opción B: Subir Archivo de Audio
1. Haz clic en **"Subir Audio"**
2. Selecciona un archivo de audio de tu dispositivo
3. Formatos aceptados: MP3, WAV, OGG, M4A, WEBM
4. Tamaño máximo: 10MB

### 3. Crear Prescripción
1. Verifica que seleccionaste un paciente
2. Verifica que tienes el audio (grabado o subido)
3. Haz clic en **"Crear Prescripción"**
4. Espera 10-30 segundos mientras el sistema procesa el audio
5. ¡Listo! Serás redirigido a la lista de prescripciones

---

## 🎯 Ejemplo de Dictado

### ✅ Forma CORRECTA de dictar:

```
"Ibuprofeno 400 miligramos, 20 tabletas, tomar una cada 8 horas después de las comidas.

Amoxicilina 500 miligramos, 14 cápsulas, tomar una cada 12 horas durante 7 días.

Loratadina 10 miligramos, 10 tabletas, tomar una cada 24 horas en caso de alergia.

Nota: Tomar con abundante agua."
```

### ✅ Estructura Recomendada:
Para cada medicamento, menciona:
1. **Nombre** del medicamento
2. **Dosis** (ej: 400mg, 10ml, etc.)
3. **Cantidad** (ej: 20 tabletas, 1 frasco, etc.)
4. **Instrucciones** (ej: cada 8 horas, después de comer, etc.)

### ❌ Evita:
- Hablar muy rápido o poco claro
- Ruido de fondo excesivo
- Nombres de medicamentos mal pronunciados
- Audio demasiado largo (más de 2 minutos)

---

## 🛠️ Funcionalidades Técnicas

### Componentes Implementados

#### 1. **Hook: `useAudioRecorder`**
Ubicación: `src/hooks/useAudioRecorder.ts`

Maneja toda la lógica de grabación:
- Acceso al micrófono
- Grabación en tiempo real
- Pausar/Reanudar
- Conversión a archivo
- Limpieza de recursos

#### 2. **Servicio: `createFromAudio`**
Ubicación: `src/lib/api-services.ts`

```typescript
prescriptionService.createFromAudio(audioFile, patientId)
```

Envía el audio al backend usando `FormData` y maneja la respuesta.

#### 3. **Página: `/doctor/prescriptions/new-audio`**
Ubicación: `src/app/doctor/prescriptions/new-audio/page.tsx`

Interfaz completa con:
- Grabación en vivo
- Subida de archivos
- Validaciones
- Estados de carga
- Mensajes de error/éxito

#### 4. **Tipos Actualizados**
Ubicación: `src/types/index.ts`

```typescript
interface Prescription {
  // ... campos existentes
  transcription?: string;
  aiProcessed?: boolean;
}
```

---

## 🎨 Interfaz de Usuario

### Colores y Estados

- **🔴 Rojo**: Botón de grabar, estado de grabación activa
- **🟡 Amarillo**: Pausar grabación
- **🔵 Azul**: Subir archivo, procesar
- **🟢 Verde**: Audio listo/completado
- **⚫ Gris**: Detener, cancelar

### Indicadores Visuales

- **Animación de pulso**: Durante la grabación
- **Timer**: Muestra duración de la grabación (MM:SS)
- **Reproductor de audio**: Para escuchar el audio grabado
- **Loader animado**: Durante el procesamiento (10-30s)

---

## 📊 Vista de Prescripción Creada por Audio

Cuando veas el detalle de una prescripción creada por audio, verás:

1. **Badge especial** indicando que fue creada con IA
2. **Transcripción completa** del audio dictado
3. **Medicamentos extraídos** automáticamente
4. Todos los datos normales de una prescripción

---

## ⚠️ Consideraciones Importantes

### Permisos del Navegador
- La primera vez que grabes, el navegador pedirá acceso al micrófono
- Debes **permitir** el acceso para poder grabar
- Si deniegasn el permiso, solo podrás subir archivos

### Tiempo de Procesamiento
- El procesamiento del audio toma entre **10-30 segundos**
- No cierres la ventana ni navegues a otra página durante este tiempo
- Verás un mensaje: "⏳ Procesando audio..."

### Calidad del Audio
Para mejores resultados:
- ✅ Usa un buen micrófono (laptop, teléfono, auriculares)
- ✅ Graba en un lugar silencioso
- ✅ Habla claro y a velocidad moderada
- ✅ Pronuncia bien los nombres de medicamentos
- ✅ Pausa entre medicamentos

### Formatos de Audio
| Formato | Compatible | Recomendado |
|---------|-----------|-------------|
| MP3     | ✅ Sí     | ⭐⭐⭐     |
| WAV     | ✅ Sí     | ⭐⭐⭐     |
| OGG     | ✅ Sí     | ⭐⭐       |
| WEBM    | ✅ Sí     | ⭐⭐⭐     |
| M4A     | ✅ Sí     | ⭐⭐       |

---

## 🐛 Solución de Problemas

### "Permiso denegado al micrófono"
**Solución**: Permite el acceso al micrófono en la configuración de tu navegador

### "No se encontró micrófono"
**Solución**: Conecta un micrófono o usa la opción de subir archivo

### "Error al crear prescripción"
**Posibles causas**:
- Audio de mala calidad
- Paciente no seleccionado
- Conexión a internet interrumpida
- Token de autenticación expirado

**Solución**: Verifica los datos y vuelve a intentar

### "El archivo es demasiado grande"
**Solución**: El archivo debe ser menor a 10MB. Comprime el audio o graba uno más corto

---

## 🔒 Seguridad

- ✅ Solo usuarios con rol **Doctor** pueden acceder
- ✅ Autenticación JWT requerida
- ✅ El audio se envía de forma segura (HTTPS en producción)
- ✅ Validación de formato y tamaño de archivo
- ✅ Los audios no se almacenan permanentemente (solo se procesa la transcripción)

---

## 📱 Compatibilidad

### Navegadores Soportados
- ✅ **Chrome/Edge**: 100% funcional (recomendado)
- ✅ **Firefox**: 100% funcional
- ✅ **Safari**: 100% funcional (macOS/iOS)
- ✅ **Opera**: 100% funcional

### Dispositivos
- ✅ **Escritorio** (Windows, macOS, Linux)
- ✅ **Móvil** (Android, iOS) - requiere micrófono habilitado
- ✅ **Tablet** (iPad, Android tablets)

---

## 💡 Tips y Trucos

1. **Prepara el dictado**: Antes de grabar, ten lista la información de los medicamentos
2. **Usa frases completas**: "Ibuprofeno 400mg, 20 tabletas..." en lugar de solo "Ibuprofeno"
3. **Revisa antes de enviar**: Escucha el audio grabado para asegurarte de que se escuche bien
4. **Graba en bloques**: Si son muchos medicamentos, puedes pausar entre cada uno
5. **Guarda versión de texto**: Aunque la IA es precisa, siempre revisa la prescripción generada

---

## 🎓 Ejemplo de Uso Completo

```
1. Login como doctor
2. Ir a "Prescripciones" → "Crear por Audio"
3. Seleccionar paciente: "Juan Pérez"
4. Clic en "Iniciar Grabación"
5. Dictar:
   "Paracetamol 500 miligramos, 20 tabletas, tomar una cada 6 horas.
    Omeprazol 20 miligramos, 14 cápsulas, tomar una en ayunas."
6. Clic en "Detener"
7. Escuchar el audio grabado (verificar)
8. Clic en "Crear Prescripción"
9. Esperar 15-20 segundos
10. ¡Listo! Prescripción creada con código RX-ABC123
```

---

## 📧 Soporte

Si encuentras problemas o tienes preguntas sobre esta funcionalidad, contacta al equipo de desarrollo.

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0.0
