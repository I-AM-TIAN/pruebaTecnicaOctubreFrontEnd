# 🎤 Audio Prescription - FAQ (Preguntas Frecuentes)

## Para Usuarios (Doctores)

### General

**P: ¿Qué es la funcionalidad de prescripción por audio?**  
R: Es una nueva característica que permite a los doctores crear prescripciones médicas grabando un audio en lugar de escribirlas manualmente. El sistema usa Inteligencia Artificial para transcribir el audio y extraer automáticamente la información de los medicamentos.

**P: ¿Cuánto tiempo tarda en procesarse?**  
R: Típicamente entre 10-30 segundos, dependiendo de la longitud del audio y la carga del servidor.

**P: ¿Puedo ver la transcripción del audio?**  
R: Sí, cuando ves el detalle de una prescripción creada por audio, verás una sección especial que muestra la transcripción completa.

---

### Requisitos

**P: ¿Qué navegadores son compatibles?**  
R: Chrome, Firefox, Safari, Edge y navegadores móviles (iOS/Android). Recomendamos Chrome para mejor experiencia.

**P: ¿Necesito instalar algo especial?**  
R: No, solo necesitas un navegador actualizado y un micrófono funcional.

**P: ¿Funciona en dispositivos móviles?**  
R: Sí, funciona en teléfonos y tablets con micrófono.

**P: ¿Necesito conexión a internet?**  
R: Sí, se requiere conexión estable para subir el audio y procesarlo.

---

### Grabación

**P: ¿Cuánto tiempo puedo grabar?**  
R: Recomendamos 10-60 segundos. El límite es de 10MB de archivo, que equivale a aproximadamente 10 minutos.

**P: ¿Puedo pausar la grabación?**  
R: Sí, hay botones de pausar y reanudar durante la grabación.

**P: ¿El navegador me pide permiso para usar el micrófono?**  
R: Sí, la primera vez que uses la función, debes permitir el acceso al micrófono.

**P: ¿Qué hago si niego el permiso del micrófono?**  
R: Puedes usar la opción de subir un archivo de audio en su lugar, o cambiar los permisos en la configuración de tu navegador.

**P: ¿Puedo escuchar el audio antes de enviarlo?**  
R: Sí, después de grabar verás un reproductor de audio para verificar la grabación.

---

### Archivos de Audio

**P: ¿Qué formatos de audio acepta?**  
R: MP3, WAV, OGG, M4A y WEBM.

**P: ¿Cuál es el tamaño máximo de archivo?**  
R: 10MB.

**P: ¿Puedo subir un audio pregrabado?**  
R: Sí, usa el botón "Subir Audio" para seleccionar un archivo de tu dispositivo.

**P: ¿Puedo editar el audio después de grabarlo?**  
R: No directamente en la aplicación. Si necesitas editar, graba de nuevo o edita externamente y sube el archivo.

---

### Calidad y Contenido

**P: ¿Qué debo decir en el audio?**  
R: Menciona claramente:
- Nombre del medicamento
- Dosis (ej: 400mg)
- Cantidad (ej: 20 tabletas)
- Instrucciones (ej: cada 8 horas)

**P: ¿Importa cómo hable?**  
R: Sí, habla claro, despacio y pronuncia bien los nombres de los medicamentos.

**P: ¿Puedo dictar varios medicamentos?**  
R: Sí, puedes incluir múltiples medicamentos en un solo audio.

**P: ¿Qué pasa si hay ruido de fondo?**  
R: El ruido puede afectar la calidad de la transcripción. Graba en un lugar silencioso.

**P: ¿Puedo dictar en otro idioma?**  
R: Actualmente solo está optimizado para español e inglés.

---

### Errores Comunes

**P: "Permiso denegado al micrófono" - ¿Qué hago?**  
R: Ve a la configuración de tu navegador y permite el acceso al micrófono para este sitio. O usa la opción de subir archivo.

**P: "No se encontró micrófono" - ¿Qué significa?**  
R: Tu dispositivo no tiene micrófono o no está conectado. Verifica tu hardware o usa la opción de subir archivo.

**P: "El archivo es demasiado grande" - ¿Cómo lo arreglo?**  
R: Reduce la duración del audio o comprime el archivo antes de subirlo. Máximo 10MB.

**P: "Paciente no encontrado" - ¿Por qué pasa esto?**  
R: Verifica que seleccionaste un paciente del dropdown antes de enviar.

**P: La transcripción no es correcta - ¿Qué hago?**  
R: Si la IA malinterpreta el audio, puedes:
1. Eliminar la prescripción incorrecta
2. Grabar de nuevo con mejor pronunciación
3. Usar el método manual de creación

---

### Seguridad y Privacidad

**P: ¿Es seguro subir audios médicos?**  
R: Sí, usamos HTTPS y autenticación JWT. Solo doctores autorizados pueden acceder.

**P: ¿Se guardan los archivos de audio?**  
R: No, solo se guarda la transcripción de texto. El audio se procesa y se descarta.

**P: ¿Quién puede ver las prescripciones creadas por audio?**  
R: Solo el doctor que las creó, el paciente asignado y los administradores.

**P: ¿Los audios viajan por internet?**  
R: Sí, se envían al servidor para procesamiento. Usa conexión segura (HTTPS).

---

### Problemas Técnicos

**P: El botón "Crear Prescripción" está deshabilitado - ¿Por qué?**  
R: Verifica que:
1. Seleccionaste un paciente
2. Tienes un audio grabado o subido
3. No estás grabando actualmente

**P: El procesamiento tarda mucho - ¿Es normal?**  
R: Puede tardar hasta 30 segundos. Si tarda más, puede haber un problema de conexión.

**P: ¿Qué hago si falla el envío?**  
R: Verifica tu conexión a internet e intenta de nuevo. Si persiste, contacta soporte.

**P: El audio no se reproduce después de grabar - ¿Qué hago?**  
R: Puede ser un problema del navegador. Intenta refrescar la página y grabar de nuevo.

---

## Para Desarrolladores

### Implementación

**P: ¿Cómo integro esta funcionalidad en mi proyecto?**  
R: Revisa `AUDIO_PRESCRIPTION_TECHNICAL.md` para documentación completa.

**P: ¿Qué APIs externas se usan?**  
R: 
- ElevenLabs API para transcripción
- OpenAI API (GPT-4) para extracción de datos

**P: ¿Cómo manejo los errores?**  
R: El hook `useAudioRecorder` y el servicio API tienen manejo de errores incorporado. Ver documentación técnica.

**P: ¿Puedo personalizar la UI?**  
R: Sí, todos los componentes usan TailwindCSS y son personalizables.

---

### MediaRecorder API

**P: ¿Qué navegadores soportan MediaRecorder?**  
R: Chrome 47+, Firefox 25+, Safari 14+, Edge (Chromium).

**P: ¿Qué formato graba por defecto?**  
R: WEBM en Chrome/Firefox, MP4 en Safari.

**P: ¿Cómo cambio la calidad de audio?**  
R: Puedes modificar las opciones en `useAudioRecorder.ts`:
```typescript
sampleRate: 44100, // Calidad CD
```

**P: ¿Puedo agregar visualización de onda?**  
R: Sí, pero requiere implementación adicional con Web Audio API.

---

### Backend

**P: ¿Qué endpoints se necesitan?**  
R: `POST /prescriptions/from-audio` con FormData (audio + patientId).

**P: ¿Cómo valido el audio en el backend?**  
R: Verifica:
- Tipo de archivo (MIME type)
- Tamaño (máx 10MB)
- Que sea un archivo de audio válido

**P: ¿Cómo proceso el audio?**  
R: 
1. Recibe FormData
2. Envía audio a ElevenLabs para transcripción
3. Envía transcripción a OpenAI para extracción
4. Guarda en base de datos

**P: ¿Qué hago con errores de las APIs externas?**  
R: Maneja los errores y devuelve mensajes claros al frontend:
```json
{
  "statusCode": 500,
  "message": "Error al procesar el audio: ...",
  "error": "Internal Server Error"
}
```

---

### Costos

**P: ¿Cuánto cuesta por prescripción?**  
R: Aproximadamente $0.05 USD por prescripción (transcripción + extracción).

**P: ¿Cómo reduzco costos?**  
R: 
- Limita la duración máxima de audio
- Comprime archivos antes de procesar
- Implementa caché si es aplicable

**P: ¿Hay límites de uso?**  
R: Depende de tus planes de ElevenLabs y OpenAI. Verifica tus cuotas.

---

### Testing

**P: ¿Cómo pruebo sin micrófono?**  
R: Usa la opción de subir archivo con audios de prueba pregrabados.

**P: ¿Hay tests automatizados?**  
R: Actualmente no, pero se recomienda agregar tests para:
- Hook `useAudioRecorder`
- Servicio API
- Componente de página

**P: ¿Cómo simulo errores?**  
R: Puedes:
- Desconectar internet (error de red)
- Subir archivo muy grande (error de tamaño)
- No seleccionar paciente (error de validación)

---

### Performance

**P: ¿Cómo mejoro el tiempo de procesamiento?**  
R: 
- Usa servidores más rápidos
- Optimiza llamadas a APIs externas
- Implementa caché cuando sea posible

**P: ¿Puedo comprimir el audio antes de subir?**  
R: Sí, puedes implementar compresión en el frontend antes de enviar.

**P: ¿Hay límite de usuarios simultáneos?**  
R: Depende de tu infraestructura backend y cuotas de APIs externas.

---

### Extensiones Futuras

**P: ¿Puedo agregar transcripción en tiempo real?**  
R: Sí, pero requiere integración con APIs de streaming (ej: Deepgram).

**P: ¿Puedo agregar más idiomas?**  
R: Sí, ajustando la configuración de ElevenLabs y OpenAI para otros idiomas.

**P: ¿Puedo editar el audio en la app?**  
R: Requeriría implementar Web Audio API para edición básica.

**P: ¿Puedo agregar comandos de voz?**  
R: Sí, con procesamiento adicional de lenguaje natural.

---

## Troubleshooting Avanzado

### Problema: Audio no se graba en Safari iOS

**Solución:**
- Verifica que el usuario dio permisos
- Safari requiere HTTPS en producción
- Verifica que el formato MP4 esté soportado

```typescript
const mimeType = 'audio/mp4'; // Para Safari
```

---

### Problema: FormData no llega al backend

**Solución:**
- Verifica CORS en el backend
- Asegúrate de no enviar `Content-Type` header manualmente
- Deja que el navegador lo configure automáticamente

```typescript
// ❌ No hagas esto
headers: {
  'Content-Type': 'multipart/form-data',
}

// ✅ Hazlo así
headers: {
  'Authorization': `Bearer ${token}`,
  // No incluyas Content-Type
}
```

---

### Problema: Transcripción con errores

**Causas:**
- Audio de baja calidad
- Ruido de fondo
- Mala pronunciación
- Audio cortado

**Soluciones:**
- Mejora calidad del micrófono
- Graba en lugar silencioso
- Habla más despacio y claro
- Incrementa sampleRate a 48000Hz

---

### Problema: Timeout al procesar

**Causas:**
- Audio muy largo
- APIs externas lentas
- Conexión lenta

**Soluciones:**
- Incrementa timeout del fetch
- Limita duración máxima de audio
- Implementa retry logic

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s

fetch(url, {
  signal: controller.signal,
  // ...
});
```

---

## Recursos Adicionales

### Documentación
- 📖 Guía de Usuario: `AUDIO_PRESCRIPTION_GUIDE.md`
- 🔧 Documentación Técnica: `AUDIO_PRESCRIPTION_TECHNICAL.md`
- 🌊 Diagrama de Flujo: `AUDIO_PRESCRIPTION_FLOW.md`
- 📋 Resumen de Implementación: `IMPLEMENTATION_SUMMARY.md`

### APIs Externas
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

### Soporte
- Reporta bugs en GitHub Issues
- Contacta al equipo de desarrollo
- Revisa logs del backend para errores de API

---

**Última actualización**: Noviembre 2025  
**¿No encuentras tu pregunta?** Contacta al equipo de soporte.
