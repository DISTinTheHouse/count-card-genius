# Frontend: guía rápida

Principio: **ligera, simple, sin complicar al usuario.** Antes de añadir una librería o pantalla, pregúntate si se puede hacer con lo que ya hay.

## Mapa

| Qué | Dónde |
| --- | --- |
| Colores, fuentes, sombras, animaciones | `src/styles.css` (tokens OKLCH en `:root`) |
| Layout + barra inferior + puerta de bienvenida | `src/components/AppShell.tsx` |
| Logo | `src/components/Logo.tsx` |
| Hoja modal (bottom sheet) | `src/components/Sheet.tsx` (vaul) |
| Panel PRO (hoja y `/pro`) | `src/components/ProPanel.tsx` |
| Hojas globales (PRO, perfil) | `src/lib/sheets.ts` → `openSheet("pro")` |
| Contenido de lecciones | `src/lib/lessons.ts` (solo datos) |
| Motor de Blackjack (reglas, bots, crupier, pagos) | `src/lib/blackjack.ts` (funciones puras, tests en `src/test/blackjack.test.ts`) |
| Mesa de juego | `src/routes/jugar.tsx` |
| Fichas ficticias | `src/lib/chips.ts` (10,000 de bienvenida, recarga gratis en 0) |
| Pantalla de bienvenida | `src/components/Welcome.tsx` |
| Carta | `src/components/PlayingCard.tsx` (memo, solo CSS) |
| Páginas | `src/routes/` (`index` + `practicar` = pestaña Entrenar, `jugar` = pestaña Jugar; `pro` solo para enlaces antiguos) |
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
| `cuentacartas-lessons-read` | lecciones abiertas |
| `cuentacartas-chips` | saldo de fichas (sin clave = aún no recibió el bono) |
| `cuentacartas-count-help` | `"0"` = ocultar la cuenta en la mesa |

Lee y escribe siempre con `useLocal` / `writeLocal`, así todos los componentes se actualizan a la vez. Cuando llegue el backend, cambia la implementación de `useProfile` y `usePro` sin cambiar su forma.

## Estilo

- Una sola fuente: **Plus Jakarta Sans**. `font-display` = su peso 800 con tracking ajustado.
- Animaciones solo CSS: `animate-rise` (entrada, escalonar con `animationDelay`), `animate-float` (bienvenida), `animate-deal` (carta). Se desactivan con "reducir movimiento".
- Botones: `variant="gold"` (acción principal), `variant="glass"` (secundaria), `size="xl"` para CTAs móviles.
- Radios grandes (`rounded-2xl`/`rounded-3xl`), barra inferior flotante, márgenes con `env(safe-area-inset-*)`.

## Patrones

- Modales = `Sheet` (sube desde abajo, se cierra arrastrando). Nada de `window.confirm`.
- Para pedir PRO desde cualquier sitio: `openSheet("pro")`, no un enlace.
- Header: saldo de fichas en corto (`short()` → 10K, 12.5K, 1.2M) y avatar (corona si es PRO). El PRO se ofrece en el perfil y en los ajustes de práctica, nunca como botón fijo.
- En Practicar la acción principal va justo debajo de la mesa: debe verse sin hacer scroll.
- Resultado: acierto = confeti (`Confetti.tsx`, canvas sin librerías) + "Siguiente ronda"; fallo = "Reintentar" o "Ajustar dificultad" (vuelve a los ajustes). Los ajustes PRO solo se muestran a usuarios PRO; los gratis ven una sola fila discreta que abre la hoja PRO.

## Blackjack

Reglas: 6 barajas, Blackjack paga 3:2, el crupier se planta en 17 y revisa Blackjack, doblar con 2 cartas, una sola división. Cada acción del motor devuelve un `Game` nuevo; la UI solo pinta y programa el siguiente paso de bots/crupier. La apuesta se descuenta al repartir/doblar/dividir y el pago se suma al terminar, así recargar la página a mitad de mano no regala fichas.

## Reglas

- Reutiliza los tokens (`bg-card`, `text-gold`, `variant="gold"`...) en vez de colores sueltos.
- La partida (`/practicar`) es la zona sensible al rendimiento: nada de librerías de animación, efectos en cada carta ni estado global extra.
- Nueva página = nuevo archivo en `src/routes/` envuelto en `<AppShell>`. No editar `routeTree.gen.ts`.
- Antes de subir: `npx tsc --noEmit`, `npm run lint`, `npm test`.
- Repo conectado a Lovable: no reescribir historia publicada.
