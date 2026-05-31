/**
 * Validadors de NIF espanyol (DNI, NIE i CIF) amb verificació de checksum real.
 *
 * - DNI: 8 dígits + lletra de control (taula mòdul 23).
 * - NIE: X/Y/Z + 7 dígits + lletra (X→0, Y→1, Z→2, després DNI).
 * - CIF: lletra + 7 dígits + dígit/lletra de control segons tipus d'organització.
 */

const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";
const CIF_CONTROL_LETTERS = "JABCDEFGHI";

function normalize(s: string): string {
  return s.toUpperCase().replace(/[\s-]/g, "");
}

function isValidDNI(s: string): boolean {
  if (!/^\d{8}[A-Z]$/.test(s)) return false;
  const number = parseInt(s.slice(0, 8), 10);
  return DNI_LETTERS[number % 23] === s[8];
}

function isValidNIE(s: string): boolean {
  if (!/^[XYZ]\d{7}[A-Z]$/.test(s)) return false;
  const prefix = { X: "0", Y: "1", Z: "2" }[s[0] as "X" | "Y" | "Z"];
  const number = parseInt(prefix + s.slice(1, 8), 10);
  return DNI_LETTERS[number % 23] === s[8];
}

function isValidCIF(s: string): boolean {
  if (!/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/.test(s)) return false;

  const digits = s.slice(1, 8);
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(digits[i], 10);
    if (i % 2 === 0) {
      // Posicions parells (1a, 3a, 5a, 7a): es multiplica per 2 i se sumen els dígits.
      const doubled = digit * 2;
      sum += doubled >= 10 ? doubled - 9 : doubled;
    } else {
      sum += digit;
    }
  }

  const controlDigit = (10 - (sum % 10)) % 10;
  const lastChar = s[8];
  const firstLetter = s[0];

  // Per a tipus PQRSNW el control sempre és lletra.
  if ("PQRSNW".includes(firstLetter)) {
    return CIF_CONTROL_LETTERS[controlDigit] === lastChar;
  }
  // Per a tipus ABEH el control sempre és dígit.
  if ("ABEH".includes(firstLetter)) {
    return String(controlDigit) === lastChar;
  }
  // Per a la resta, qualsevol dels dos formats és vàlid.
  return (
    String(controlDigit) === lastChar ||
    CIF_CONTROL_LETTERS[controlDigit] === lastChar
  );
}

/**
 * Comprova si una cadena és un NIF espanyol vàlid (DNI, NIE o CIF).
 * Accepta entrada amb espais i guions; normalitza a majúscules internament.
 */
export function isValidNIF(s: string): boolean {
  if (!s) return false;
  const normalized = normalize(s);
  if (/^\d{8}[A-Z]$/.test(normalized)) return isValidDNI(normalized);
  if (/^[XYZ]\d{7}[A-Z]$/.test(normalized)) return isValidNIE(normalized);
  if (/^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/.test(normalized)) {
    return isValidCIF(normalized);
  }
  return false;
}
