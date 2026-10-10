# Frontend: guía rápida

Principio: **ligera, simple, sin complicar al usuario.** Antes de añadir una librería o pantalla, pregúntate si se puede hacer con lo que ya hay.

## Mapa

| Qué | Dónde |
| --- | --- |
| Colores, fuentes, sombras, animaciones | `src/styles.css` (tokens OKLCH en `:root`) |
| Layout + barra inferior + puerta de bienvenida | `src/components/AppShell.tsx` |
| Pantalla de bienvenida | `src/components/Welcome.tsx` |
| Carta | `src/components/PlayingCard.tsx` (memo, solo CSS) |
| Páginas | `src/routes/` (`index` Aprender, `practicar`, `pro`) |
| Reglas Hi-Lo, zapato, PRO, estadísticas | `src/lib/cards.ts` |
| Perfil local | `src/lib/profile.ts` |
| localStorage reactivo | `src/lib/storage.ts` (`useLocal`, `writeLocal`) |

## Flujo

1. Sin perfil → `AppShell` muestra `Welcome` (crear usuario o invitado).
2. Con perfil → páginas normales. El círculo con la inicial (arriba a la derecha) permite cambiar de usuario.
3. Mientras hidrata (SSR) se muestra solo el logo, para no enseñar un estado equivocado.

## Datos (todo en este dispositivo, sin backend)

| Clave localStorage | Contenido |
| --- | --- |
| `cuentacartas-profile` | `{ name, guest }` |
| `cuentacartas-pro` | `"1"` = PRO (demo) |
| `cuentacartas-stats` | `{ rounds, correct }` |
| `cc-today` | rondas gratis de hoy |

Lee y escribe siempre con `useLocal` / `writeLocal`, así todos los componentes se actualizan a la vez. Cuando llegue el backend, cambia la implementación de `useProfile` y `usePro` sin cambiar su forma.

## Reglas

- Reutiliza los tokens (`bg-card`, `text-gold`, `variant="gold"`...) en vez de colores sueltos.
- La partida (`/practicar`) es la zona sensible al rendimiento: nada de librerías de animación, efectos en cada carta ni estado global extra.
- Nueva página = nuevo archivo en `src/routes/` envuelto en `<AppShell>`. No editar `routeTree.gen.ts`.
- Antes de subir: `npx tsc --noEmit`, `npm run lint`, `npm test`.
- Repo conectado a Lovable: no reescribir historia publicada.
