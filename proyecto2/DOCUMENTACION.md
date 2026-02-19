# Documentación — Proyecto 2 (Mi Banco)

Última actualización: 19/02/2026

## Resumen

`proyecto2` es una pequeña interfaz de banca/ATM para demo. Contiene pantallas principales: dashboard (`menu.html`), ajustes (`ajustes.html`) y recursos asociados (CSS y JS).

## Estructura del directorio

- `proyecto2/`
  - `menu.html` — Dashboard principal con sidebar, saldo y acciones rápidas.
  - `menu.js` — Lógica del dashboard (depositar, transferir, logout desde header).
  - `ajustes.html` — Página de ajustes (preferencias, seguridad, cerrar sesión).
  - `ajustes.js` — Interactividad de ajustes (toggles, modal cambiar PIN, confirmar logout).
  - `img/` — Imágenes y assets usados por las vistas.
  - `README.md` — Resumen corto (este repositorio).

## Archivos clave y selectores útiles

- `menu.html` selectors (para `menu.js`):
  - `#account-balance` — muestra el saldo.
  - `#transactions-list` — lista de movimientos.
  - `#btn-deposit`, `#btn-transfer` — botones para depositar/transferir.
  - `#btn-logout-menu` — botón de cerrar sesión en el header.

- `ajustes.html` selectors (para `ajustes.js`):
  - `#toggle-notifications`, `#select-language`, `#toggle-biometric` — controles de preferencias.
  - `#btn-change-pin` — abre modal para cambiar PIN.
  - `#btn-logout` — abre modal de confirmación de logout.
  - `#modal-change-pin`, `#modal-logout`, `#modal-overlay` — elementos modal.

## Cómo ejecutar localmente

1. Abrir el archivo `proyecto2/menu.html` o `proyecto2/ajustes.html` en el navegador (double-click o `file://` path).
2. Si quieres usar un servidor local (recomendado para pruebas JS y rutas relativas):

```bash
# desde la carpeta del proyecto (p.ej. 'Mi Portafolio')
python3 -m http.server 8000
# luego abrir http://localhost:8000/proyecto2/menu.html
```

## Estado y comportamiento

- Los scripts usan `localStorage` para persistencia de demo (p.ej. ajustes del usuario y PIN demo).
- Los botones de logout realizan una redirección cliente a `proyecto2.html` (demo). Para integración real, reemplazar la lógica por llamadas a la API del backend para invalidar tokens/ sesiones.

## Siguientes pasos sugeridos

- Integrar llamadas a la API para autenticación, cambio de PIN y logout seguro.
- Añadir validación y enmascaramiento de datos sensibles (tarjetas, PIN) en el frontend.
- Añadir tests unitarios y/o de integración para la lógica de `menu.js` y `ajustes.js`.

## Contacto

Para dudas o contribuciones, abre un issue o PR en el repositorio GitHub donde esté alojado este proyecto.
