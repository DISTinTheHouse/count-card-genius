import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

// Public page (outside AppShell's welcome gate): the App Store and Google Play link here.
// When the app starts sending data anywhere (accounts, payments, analytics), update this text.
const CONTACT = "ufkwear@gmail.com";
const UPDATED = "12 de octubre de 2026";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de privacidad — CuentaCartas" },
      { name: "description", content: "Qué datos usa CuentaCartas y cómo borrarlos." },
    ],
  }),
  component: Privacy,
});

const sections: { title: string; body: string[] }[] = [
  {
    title: "Resumen",
    body: [
      "CuentaCartas no recopila, vende ni comparte tus datos personales. No hay cuentas en un servidor, ni publicidad, ni rastreo.",
    ],
  },
  {
    title: "Qué se guarda y dónde",
    body: [
      "Todo se guarda solo en tu dispositivo: el nombre que eliges al crear tu usuario (o «Invitado»), tus fichas ficticias, tus estadísticas de práctica, las lecciones leídas y tus ajustes.",
      "Esos datos nunca salen de tu teléfono o navegador y nosotros no tenemos acceso a ellos.",
    ],
  },
  {
    title: "Servicios de terceros",
    body: [
      "Para mostrar la tipografía, la app descarga una fuente de Google Fonts. Como cualquier descarga en internet, Google recibe tu dirección IP; no se envía ningún otro dato. Consulta la política de Google en policies.google.com/privacy.",
      "La versión web la sirve un proveedor de alojamiento, que puede registrar datos técnicos de cada visita (IP, navegador) para operar el servicio.",
    ],
  },
  {
    title: "Fichas ficticias",
    body: [
      "Las fichas del juego son ficticias: no se compran con dinero real ni se pueden canjear por dinero ni premios. La app no procesa pagos.",
    ],
  },
  {
    title: "Cómo borrar tus datos",
    body: [
      "En la app: toca tu inicial arriba a la derecha y elige «Cambiar de usuario» para borrar tu perfil. Para borrar todo, desinstala la app; en la web, borra los datos del sitio desde tu navegador.",
    ],
  },
  {
    title: "Menores de edad",
    body: [
      "CuentaCartas incluye un juego de casino simulado y está pensada para mayores de 18 años. No recopilamos datos de nadie, tampoco de menores.",
    ],
  },
  {
    title: "Cambios",
    body: [
      "Si en el futuro la app empieza a usar cuentas, pagos u otros servicios, actualizaremos esta página antes de hacerlo y cambiaremos la fecha de arriba.",
    ],
  },
];

function Privacy() {
  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2">
        <Link
          to="/"
          aria-label="Volver"
          className="-ml-2 flex size-9 items-center justify-center rounded-full text-muted-foreground active:bg-accent"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
        <Logo className="text-xl" />
      </header>
      <h1 className="mt-6 font-display text-3xl leading-tight">Política de privacidad</h1>
      <p className="mt-1 text-sm text-muted-foreground">Última actualización: {UPDATED}</p>
      {sections.map((s) => (
        <section key={s.title} className="mt-6">
          <h2 className="font-semibold">{s.title}</h2>
          {s.body.map((p) => (
            <p key={p} className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </section>
      ))}
      <section className="mt-6">
        <h2 className="font-semibold">Contacto</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Si tienes dudas sobre tu privacidad, escríbenos a{" "}
          <a href={`mailto:${CONTACT}`} className="text-primary underline underline-offset-2">
            {CONTACT}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
