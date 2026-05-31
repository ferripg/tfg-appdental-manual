/**
 * Validador d'IBAN segons ISO 13616-1 (algoritme mod-97).
 *
 * Passos:
 *  1. Eliminar espais, posar en majúscules.
 *  2. Comprovar format: 2 lletres país + 2 dígits control + BBAN.
 *  3. Moure els 4 primers caràcters al final.
 *  4. Substituir lletres pel seu valor numèric (A=10, B=11, …, Z=35).
 *  5. El resultat ha de complir: resta mod 97 == 1.
 *
 * Es processa per blocs perquè el nombre resultant pot ser massa gran
 * per al tipus Number de JavaScript (s'usa l'algoritme de mod-97 incremental).
 */

const IBAN_LENGTHS: Record<string, number> = {
  // Llargades oficials per país (només els més rellevants per al cas dental).
  ES: 24,
  FR: 27,
  DE: 22,
  IT: 27,
  PT: 25,
  GB: 22,
  AD: 24,
  NL: 18,
  BE: 16,
  CH: 21,
  IE: 22,
  LU: 20,
};

export function isValidIBAN(s: string): boolean {
  if (!s) return false;

  const cleaned = s.toUpperCase().replace(/\s/g, "");

  // Format bàsic: 2 lletres + 2 dígits + 11-30 caràcters alfanumèrics.
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false;

  // Llargada per país (si està al mapa). Si no, accepta entre 15 i 34.
  const country = cleaned.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[country];
  if (expectedLength !== undefined) {
    if (cleaned.length !== expectedLength) return false;
  } else if (cleaned.length < 15 || cleaned.length > 34) {
    return false;
  }

  // Reorganitzar: 4 primers caràcters al final.
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

  // Substituir lletres pel seu valor numèric.
  let numeric = "";
  for (const char of rearranged) {
    if (/\d/.test(char)) {
      numeric += char;
    } else {
      numeric += (char.charCodeAt(0) - "A".charCodeAt(0) + 10).toString();
    }
  }

  // Calcular mod 97 incrementalment (el nombre és massa gran per Number).
  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + parseInt(digit, 10)) % 97;
  }

  return remainder === 1;
}
