import { useLocal, writeLocal } from "./storage";

// Lesson content lives here as plain data, so adding or editing a lesson
// never touches UI code.

export type Lesson = {
  title: string;
  summary: string;
  pro: boolean;
  body: string[];
  /** Optional key/value table shown under the text. */
  table?: { head: [string, string]; rows: [string, string][] };
  tip?: string;
};

export const LESSONS: Lesson[] = [
  {
    title: "El sistema Hi-Lo",
    summary: "Cada carta suma +1, 0 o −1.",
    pro: false,
    body: [
      "Contar cartas no es memorizar la baraja. Solo das un valor a cada carta que sale y llevas la suma.",
      "Las cartas bajas favorecen a la casa y las altas al jugador. Cuando salen muchas bajas, quedan más dieces y ases: más blackjacks y más veces que el crupier se pasa.",
    ],
    table: {
      head: ["Cartas", "Valor"],
      rows: [
        ["2, 3, 4, 5, 6", "+1"],
        ["7, 8, 9", "0"],
        ["10, J, Q, K, A", "−1"],
      ],
    },
    tip: "Una baraja completa suma 0. Recórrela entera: si terminas en 0, contaste bien.",
  },
  {
    title: "Cuenta corriente",
    summary: "Empieza en 0 y suma mentalmente.",
    pro: false,
    body: [
      "La cuenta corriente empieza en 0 cada vez que se baraja y suma el valor de cada carta visible: las tuyas, las de otros jugadores y las del crupier.",
      "Ejemplo: salen 5, K, 3, 9 y 2. Eso es +1 −1 +1 0 +1 = +2.",
      "Truco para ir rápido: agrupa por parejas. Una baja y una alta se cancelan (0), así que puedes ignorarlas juntas.",
    ],
    tip: "Meta de práctica: contar una baraja completa en menos de 30 segundos sin errores.",
  },
  {
    title: "Cuenta verdadera",
    summary: "Divide entre las barajas restantes.",
    pro: true,
    body: [
      "Un +6 no vale lo mismo con 1 baraja que con 6 por delante. La cuenta verdadera lo corrige: cuenta corriente ÷ barajas que quedan por salir.",
      "Ejemplo: cuenta corriente +6 y quedan 3 barajas. Cuenta verdadera = +2.",
      "Calcula las barajas restantes mirando la bandeja de descartes y redondea hacia abajo.",
    ],
    table: {
      head: ["Corriente / barajas", "Verdadera"],
      rows: [
        ["+6 / 3", "+2"],
        ["+8 / 2", "+4"],
        ["−4 / 4", "−1"],
      ],
    },
  },
  {
    title: "Apuestas según la cuenta",
    summary: "Sube la apuesta cuando la cuenta es alta.",
    pro: true,
    body: [
      "La ventaja real del conteo está en apostar más cuando la cuenta verdadera es positiva y lo mínimo cuando no.",
      "Una regla simple: apuesta 1 unidad hasta +1, y añade 1 unidad por cada punto por encima.",
    ],
    table: {
      head: ["Cuenta verdadera", "Apuesta"],
      rows: [
        ["+1 o menos", "1 unidad"],
        ["+2", "2 unidades"],
        ["+3", "3 unidades"],
        ["+4 o más", "4+ unidades"],
      ],
    },
    tip: "Define tu banca antes de jugar y respétala. Juega siempre con responsabilidad.",
  },
  {
    title: "Estrategia y desviaciones",
    summary: "Jugadas óptimas y los Illustrious 18.",
    pro: true,
    body: [
      "Primero domina la estrategia básica: la jugada matemáticamente correcta para cada mano sin contar.",
      "Con la cuenta verdadera puedes desviarte en algunas manos. Estas son las más valiosas de los Illustrious 18:",
    ],
    table: {
      head: ["Mano", "Cambia si cuenta ≥"],
      rows: [
        ["Seguro vs As", "+3"],
        ["16 vs 10: plantarse", "0"],
        ["15 vs 10: plantarse", "+4"],
        ["10 vs 10: doblar", "+4"],
        ["12 vs 3: plantarse", "+2"],
        ["12 vs 2: plantarse", "+3"],
        ["11 vs As: doblar", "+1"],
      ],
    },
  },
];

const READ = "cuentacartas-lessons-read";

/** Indexes of lessons the user has opened. */
export function useReadLessons(): number[] {
  const raw = useLocal(READ);
  try {
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export function markLessonRead(i: number, read: number[]) {
  if (!read.includes(i)) writeLocal(READ, JSON.stringify([...read, i]));
}
