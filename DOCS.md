Proyecto 1 — Backend (Gmail API)
================================

Resumen
-------
Este backend proporciona endpoints mínimos para autorizar una cuenta de Google (OAuth2) y enviar correos usando la Gmail API.

Estructura relevante
- `src/server.js` — Servidor Express (mueve la lógica del backend aquí).
- `src/credentials.json` — Credenciales de OAuth2 (no subir a GitHub).
- `src/tokens.json` — Archivo donde se guardan los tokens después de autorizar (generado en runtime).

Endpoints
- `GET /auth/google` — Devuelve la `authUrl` para redirigir al usuario a Google.
- `GET /oauth/callback` — Callback que Google llama con `?code=`; guarda tokens en `src/tokens.json`.
- `POST /send-email` — Envía correo. Body: `{ to, subject, message }`.
- `GET /check-auth` — Retorna `{ authorized: true|false }`.
- `GET /get-email` — Retorna `{ email: 'tu@correo.com' }` si hay tokens.

Dónde están los tokens
- Después de autorizar en Google el servidor guardará `src/tokens.json` con los tokens de acceso/refresh.

Usar localmente
1. Instala dependencias: `npm install`
2. Inicia el servidor: `npm start`
3. Abre: `http://localhost:3000/gmail-auth.html` y sigue el flujo de autorización.

Notas de seguridad
- Nunca subas `src/credentials.json` ni `src/tokens.json` a un repositorio público.

Siguientes pasos recomendados
- Añadir validación y manejo de errores más robusto en el frontend.
- Implementar refresco de tokens automático usando `oauth2Client.on('tokens', ...)` o middleware.

Guía rápida de funcionamiento (end-to-end)
---------------------------------------
1. Flujo de autorización
	- Abre `http://localhost:3000/gmail-auth.html` y haz click en "Autorizar con Google".
	- Google redirige a `http://localhost:3000/oauth/callback?code=...`.
	- El servidor intercambia `code` por `access_token` y `refresh_token`, guarda `src/tokens.json`.

2. Envío de correos desde la UI
	- En `proyecto1.html` abre la pestaña "Contactos" y abre un chat con un contacto.
	- Completa `Asunto` y `Mensaje` y haz click en enviar; el frontend hace POST a `/send-email`.
	- El servidor lee `src/tokens.json` y llama a la Gmail API `users.messages.send`.

3. ¿Qué hacen los archivos principales?
	- `src/credentials.json`: credenciales OAuth2 (client_id/secret). NO compartir.
	- `src/tokens.json`: tokens de acceso/refresh generados al autorizar. El servidor los usa para las llamadas.
	- `src/server.js`: lógica backend — endpoints `/auth/google`, `/oauth/callback`, `/send-email`, `/check-auth`, `/get-email`.
	- `proyecto1.html` + `proy1.js`: UI y lógica frontend (calendario, notas, contactos, chat).

4. Cómo probar envío rápido desde terminal
```bash
curl -sS -X POST http://localhost:3000/send-email -H "Content-Type: application/json" \
  -d '{"to":"tu@ejemplo.com","subject":"Prueba","message":"Mensaje de prueba"}'
```

5. Buenas prácticas
	- Mantén `src/credentials.json` y `src/tokens.json` fuera de repositorios públicos (`.gitignore` actualizado).
	- Si cambias scope en la consola de Google, elimina `src/tokens.json` y vuelve a autorizar.

