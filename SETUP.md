# 🔐 Guía de Configuración Inicial - OAuth2 con Google

Esta guía te ayudará a configurar la autenticación de Gmail en tu proyecto.

## ✅ Pre-requisitos

- [ ] Node.js instalado (descargar de https://nodejs.org/)
- [ ] Cuenta de Google activa
- [ ] Archivo `credentials.json` con tus datos de Google OAuth2

## 📋 Obtener Credenciales de Google (Primero)

Si aún no tienes el archivo `credentials.json`:

### Paso 1: Crear un proyecto en Google Cloud Console

1. Ve a https://console.cloud.google.com/
2. Haz clic en **"Selecciona un proyecto"** (arriba a la izquierda)
3. Haz clic en **"NUEVO PROYECTO"**
4. Dale un nombre: `Proyecto1` (o el que prefieras)
5. Haz clic en **"CREAR"**

### Paso 2: Habilitar la API de Gmail

1. En el menú, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Gmail API"**
3. Haz clic en ella
4. Haz clic en **"HABILITAR"**

### Paso 3: Crear credenciales OAuth2

1. Desde la API de Gmail, haz clic en **"Crear credenciales"**
2. Selecciona:
   - **Tipo de aplicación**: Aplicación web
   - Haz clic en **"Crear"**
3. En la ventana de consentimiento:
   - **Nombre de la aplicación**: Proyecto1
   - **Email de soporte**: tu-email@gmail.com
   - Haz clic en **"Guardar y continuar"**
4. En Scopes:
   - Haz clic en **"Agregar o quitar scopes"**
   - Busca **"Gmail"** y selecciona:
     - `https://www.googleapis.com/auth/gmail.send`
   - Haz clic en **"Actualizar"**
   - Haz clic en **"Guardar y continuar"**
5. En Usuarios de prueba:
   - Haz clic en **"Agregar usuarios"**
   - Agrega tu email de Google
   - Haz clic en **"Guardar y continuar"**

### Paso 4: Descargar las credenciales

1. Desde la página de APIs, ve a **"Credenciales"** (en el menú izquierdo)
2. Bajo **"Credenciales para aplicaciones web"**, haz clic en tu aplicación
3. Haz clic en **"Descargar JSON"**
4. Guarda el archivo como `credentials.json` en la carpeta del proyecto

## 🚀 Configuración del Proyecto

### Paso 1: Instalar dependencias

```bash
cd "Mi Portafolio"
npm install
```

### Paso 2: Verificar credentials.json

El archivo debe verse así:

```json
{
  "web": {
    "client_id": "xxx.apps.googleusercontent.com",
    "project_id": "proyecto1-xxx",
    "client_secret": "GOCSPX-xxx",
    "redirect_uris": ["http://localhost:3000/oauth/callback"]
  }
}
```

⚠️ **IMPORTANTE**: El `redirect_uri` debe ser exactamente `http://localhost:3000/oauth/callback`

### Paso 3: Iniciar el servidor

```bash
npm start
```

Verás:
```
✅ Servidor iniciado en http://localhost:3000
📧 Para autorizar Gmail:
   1. Abre: http://localhost:3000/gmail-auth.html
   2. Autoriza con Google
```

## 🔑 Flujo de Autenticación

### Primera autorización

```
Usuario abre gmail-auth.html
         ↓
Hace clic en "Autorizar con Gmail"
         ↓
Se abre Google login
         ↓
Usuario inicia sesión con Google
         ↓
Se solicita permiso para enviar correos
         ↓
Usuario acepta
         ↓
Google redirige a /oauth/callback?code=...
         ↓
Servidor intercambia código por tokens
         ↓
Tokens se guardan en tokens.json
         ↓
Usuario es redirigido a proyecto1.html ✅
```

### Envío de correos posteriores

```
Usuario escribe mensaje en chat
         ↓
Hace clic en enviar
         ↓
Frontend envía POST a /send-email
         ↓
Servidor carga tokens.json
         ↓
Servidor usa token para enviar vía Gmail API
         ↓
Gmail envía el correo ✅
```

## 📁 Archivos importantes

| Archivo | Propósito | Compartible |
|---------|-----------|-----------|
| `credentials.json` | OAuth2 credentials de Google | ❌ NO |
| `tokens.json` | Tokens de acceso guardados | ❌ NO |
| `server.js` | Servidor backend | ✅ SÍ |
| `proy1.js` | Lógica fronendend | ✅ SÍ |
| `proyecto1.html` | UI principal | ✅ SÍ |
| `gmail-auth.html` | UI de autenticación | ✅ SÍ |

## 🔐 Seguridad

### Buenas prácticas

- [ ] Nunca compartas `credentials.json`
- [ ] Nunca subas `credentials.json` a GitHub
- [ ] Usa `.gitignore` para excluir archivos sensibles
- [ ] Mantén los tokens guardados solo en el servidor
- [ ] Usa HTTPS en producción (no HTTP)

### Cómo verificar que está seguro

1. El navegador NUNCA ve `credentials.json`
2. El navegador NUNCA ve `tokens.json`
3. El navegador NUNCA ve el `client_secret`
4. Solo el servidor puede enviar correos
5. Los tokens se refrescan automáticamente

## 🧪 Probar la integración

### ✅ Verificar que todo funciona

1. Abre http://localhost:3000/proyecto1.html
2. Ve a **Contactos**
3. Crea un contacto (ej: "Juan" con "juan@email.com")
4. Haz clic en el ícono de chat
5. Completa:
   - **Asunto**: "Prueba de correo"
   - **Mensaje**: "Hola, esto es una prueba"
6. Haz clic en enviar
7. Deberías ver: ✅ Correo enviado exitosamente

### 🐛 Solucionar problemas

| Problema | Solución |
|----------|----------|
| "No autorizado" | Abre /gmail-auth.html y autoriza |
| "¿Está el servidor iniciado?" | Ejecuta `npm start` |
| "Error al conectar" | Verifica http://localhost:3000 en navegador |
| "credentials.json no encontrado" | Verifica que el archivo existe en la carpeta |

## 📚 Referencias

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Cloud Console](https://console.cloud.google.com/)

## 💡 Tips

- El servidor debe estar corriendo para que funcione todo
- Los tokens se guardan automáticamente después de autorizar
- Puedes compartir el proyecto sin `credentials.json` y `tokens.json`
- Si alguien más quiere usar la app, necesita su propio `credentials.json`

---

**¿Te queda alguna duda?** Revisa la consola del navegador (F12) para ver mensajes detallados.
