# Apps de iOS y Android (Capacitor)

La app web se empaqueta tal cual dentro de una app nativa con [Capacitor](https://capacitorjs.com). Es el mismo código: lo que cambies en `src/` aparece en la web y, al volver a compilar, en las apps.

## Cómo está armado

| Qué | Dónde |
| --- | --- |
| Configuración (id, nombre, carpeta web) | `capacitor.config.ts` (`com.cuentacartas.app`, "CuentaCartas") |
| Proyecto de Android Studio | `android/` |
| Proyecto de Xcode | `ios/` (Swift Package Manager, sin CocoaPods) |
| Fuentes de ícono y splash | `assets/` (las copias por tamaño ya están dentro de `android/` e `ios/`) |

La web normal (Lovable, Vercel) se sigue construyendo con SSR como siempre. Para las apps, `npm run build:mobile` hace una build estática aparte (`CAPACITOR=1`, sin servidor: cada página se pre-genera a HTML en `dist/client`) y la copia a los proyectos nativos. La app funciona sin conexión, porque todo el estado vive en el teléfono (`localStorage`); solo la tipografía se descarga de Google Fonts y, sin red, usa la del sistema.

## Lo que necesitas (cuentas y equipo)

| Para | Necesitas |
| --- | --- |
| iOS | Una **Mac** con **Xcode** (App Store), y la cuenta **Apple Developer Program** (99 USD al año) |
| Android | **Android Studio** (Mac, Windows o Linux) y una cuenta de **Google Play Console** (25 USD, pago único) |
| Ambos | Node 22 o superior y `npm install` en el repo |

Las cuentas nuevas de Google Play personales deben pasar una **prueba cerrada con al menos 12 testers durante 14 días** antes de poder publicar en producción. Una cuenta de organización (requiere número D-U-N-S) no tiene ese requisito.

## Compilar

```bash
npm install
npm run build:mobile   # build estática + copia a android/ e ios/
npm run ios            # abre Xcode
npm run android        # abre Android Studio
```

Repite `npm run build:mobile` cada vez que cambie el código web.

### iOS (en Xcode)

1. Selecciona el target **App** → *Signing & Capabilities* → elige tu Team (tu cuenta de Apple Developer).
2. Prueba en un simulador o en tu iPhone con ▶.
3. Sube la versión en *General* (Version 1.0, Build 1, súbelo en cada envío).
4. *Product → Archive* → *Distribute App* → *App Store Connect*. Luego aparece en TestFlight y desde App Store Connect la envías a revisión.

### Android (en Android Studio)

1. Prueba con ▶ en un emulador o teléfono.
2. *Build → Generate Signed App Bundle* → **Android App Bundle (.aab)** → crea un keystore nuevo. **Guarda el keystore y sus contraseñas en un lugar seguro**: sin él no puedes publicar actualizaciones (si usas *Play App Signing*, Google guarda la clave de firma y tú solo la de subida).
3. Antes de cada envío sube `versionCode` (entero, +1) y `versionName` en `android/app/build.gradle`.
4. Sube el `.aab` en Play Console → Pruebas → Prueba cerrada, y luego a Producción.

## Ícono y splash

Para cambiarlos, reemplaza las imágenes de `assets/` (`icon-only.png` 1024×1024, `icon-foreground.png` + `icon-background.png` para el ícono adaptable de Android, `splash.png` y `splash-dark.png` 2732×2732) y ejecuta:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#0d241b' --splashBackgroundColor '#0d241b'
```

Borra la carpeta `icons/` y `public/manifest.webmanifest` si el comando los crea: son para PWA y no se usan.

## Ficha de la tienda (lo que piden y qué contestar)

La app es un **juego de casino simulado**: fichas ficticias, sin compra de fichas y sin retiro de dinero. Mantener eso es lo que la deja fuera de las reglas de apuestas con dinero real.

- **Categoría:** Juegos → Cartas (o Casino).
- **Clasificación de edad:** en Apple, el cuestionario marca *Simulated Gambling: Frequent/Intense* → queda en la clasificación para adultos (**17+**, o **18+** con el cuestionario nuevo). En Google (IARC) contesta que **sí** hay apuestas simuladas y que **no** hay dinero real → queda en **Teen / PEGI 12–18** según el país.
- **Google Play, público objetivo:** mayores de 18 (no lo marques como apto para niños).
- **Descripción:** di claramente "Las fichas son ficticias. No se pueden comprar ni canjear por dinero ni premios."
- **Privacidad:** ambas tiendas piden una **URL de política de privacidad**. Hoy la app no envía datos a ningún servidor (todo queda en el teléfono); la política puede decir eso. En la *Seguridad de los datos* de Google y en *App Privacy* de Apple contesta "no se recopilan datos".
- **Cuenta y borrado:** "Crear usuario" solo guarda un nombre en el teléfono, no es una cuenta en un servidor, así que la regla de Apple de permitir borrar la cuenta no aplica todavía. Cuando haya cuentas reales hay que añadir "Eliminar cuenta" dentro de la app.
- **Capturas:** iPhone 6.9" (1320×2868) y teléfono Android (mínimo 2, ideal 4–8), más el ícono de 512×512 y un gráfico destacado de 1024×500 para Google Play.
- **Cifrado (Apple):** ya está declarado en `Info.plist` que la app no usa cifrado propio, así que App Store Connect no pregunta por exportación.

### Cuando haya pagos

- **PRO como suscripción dentro de la app:** Apple y Google exigen su sistema de compras (In-App Purchase / Play Billing) para contenido digital; Stripe solo sirve en la web. Lo normal es RevenueCat o el plugin de compras de Capacitor.
- **Vender fichas:** si algún día se venden fichas, nunca deben poder cambiarse por dinero ni premios; aun así Apple y Google tratan el casino social con más revisión. Retirar ganancias convertiría la app en apuestas reales, que exigen licencia en cada país.
