import { Prisma } from "@prisma/client";
import * as inventariRepository from "@/repositories/inventari-repository";
import * as amortitzacioRepository from "@/repositories/amortitzacio-repository";
import * as despesesRepository from "@/repositories/despeses-repository";

// Exercicis amb amortitzacions generades (any + total + nombre de béns).
export async function llistarExercicisGenerats() {
  return amortitzacioRepository.exercicisGenerats();
}

// Estat dels exercicis, derivat de les amortitzacions existents (sense una
// taula de tancament separada):
// - proximAGenerar: l'últim exercici generat + 1; si no n'hi ha cap, l'any de
//   la despesa més antiga (o l'any actual si encara no hi ha despeses).
// - ultimGenerat: l'últim exercici generat (l'únic que es pot retrocedir).
export async function estatExercicis() {
  const ultimGenerat = await amortitzacioRepository.ultimExercici();

  let proximAGenerar: number;
  if (ultimGenerat !== null) {
    proximAGenerar = ultimGenerat + 1;
  } else {
    const anyAntic = await despesesRepository.anyDespesaMesAntiga();
    proximAGenerar = anyAntic ?? new Date().getFullYear();
  }

  return { proximAGenerar, ultimGenerat };
}

export async function generarAmortitzacions(exercici: number) {
  // Només es poden generar per a l'exercici que toca (seqüencial). Defensa al
  // servidor, no només a la UI.
  const { proximAGenerar } = await estatExercicis();
  if (exercici !== proximAGenerar) {
    throw new Error(
      `Només es poden generar amortitzacions de l'exercici ${proximAGenerar}`,
    );
  }

  // Béns que poden amortitzar (actius, % > 0, adquirits l'any o abans)
  const bens = await inventariRepository.findAmortitzables(exercici);

  for (const be of bens) {
    const importAdq = new Prisma.Decimal(be.importAdquisicio);
    const amortitzat = new Prisma.Decimal(be.importAmortitzat);
    const perc = new Prisma.Decimal(be.percAmortitzacio);

    // Quant queda per amortitzar d'aquest bé
    const pendent = importAdq.sub(amortitzat);
    if (pendent.lessThanOrEqualTo(0)) continue; // ja amortitzat del tot

    // Amortització lineal de l'any: import × % / 100
    let amort = importAdq.mul(perc).div(100);
    // El primer any es prorrateja pels dies des de l'adquisició fins a final d'any
    if (be.dataAdquisicio.getUTCFullYear() === exercici) {
      const MS_DIA = 1000 * 60 * 60 * 24;
      const adq = Date.UTC(
        exercici,
        be.dataAdquisicio.getUTCMonth(),
        be.dataAdquisicio.getUTCDate(),
      );
      const diesRestants = (Date.UTC(exercici, 11, 31) - adq) / MS_DIA + 1;
      const diesAny =
        (Date.UTC(exercici + 1, 0, 1) - Date.UTC(exercici, 0, 1)) / MS_DIA;
      amort = amort.mul(diesRestants).div(diesAny);
    }
    // No passar-se del que queda (l'últim any amortitza menys)
    if (amort.greaterThan(pendent)) amort = pendent;

    // Registrar l'amortització + actualitzar l'acumulat del bé
    await amortitzacioRepository.upsert(be.id, exercici, amort);
    await inventariRepository.updateAmortitzacio(
      be.id,
      amortitzat.add(amort),
      amort,
    );
  }
}

export async function retrocedir(exercici: number) {
  // Només es pot retrocedir l'últim exercici generat (els anteriors són immutables).
  const { ultimGenerat } = await estatExercicis();
  if (exercici !== ultimGenerat) {
    throw new Error(
      `Només es pot retrocedir l'últim exercici generat${ultimGenerat ? ` (${ultimGenerat})` : ""}`,
    );
  }

  // Per cada amortització de l'any, revertir-la del bé i després esborrar-la
  const amorts = await amortitzacioRepository.findByExercici(exercici);
  for (const a of amorts) {
    const be = await inventariRepository.findById(a.inventariId);
    if (be) {
      const nou = new Prisma.Decimal(be.importAmortitzat).sub(a.import);
      await inventariRepository.updateAmortitzacio(be.id, nou, null);
    }
  }
  await amortitzacioRepository.deleteByExercici(exercici);
}
