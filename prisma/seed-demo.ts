/**
 * Dades de demostració per poder veure l'aplicació plena.
 *
 * Es recolza en els serveis de l'aplicació sempre que hi ha lògica de negoci
 * (l'inventari es genera sol des de les despeses amortitzables, les
 * amortitzacions les calcula el servei), de manera que les dades resultants
 * són les mateixes que sortirien fent-ho a mà per la interfície.
 *
 *   npm run seed:demo
 *
 * És re-executable: esborra el domini (despeses, proveïdors, inventari,
 * amortitzacions i auditoria) i el torna a crear. NO toca els usuaris.
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/repositories/prisma-client";
import * as despesesService from "@/services/despeses-service";
import * as amortitzacionsService from "@/services/amortitzacions-service";
import * as auditService from "@/services/audit-service";
import { uploadFactura, deleteFactura } from "@/services/minio-service";
import { Role, EstatInventari, AccioAudit } from "@prisma/client";

const ANY = new Date().getFullYear();
const PRIMER_ANY = ANY - 2;

// Generador determinista: cada execució del seed dona exactament les mateixes
// dades, cosa que fa que les captures i les proves siguin reproduïbles.
let llavor = 20260903;
function aleatori() {
  llavor = (llavor * 1103515245 + 12345) % 2147483648;
  return llavor / 2147483648;
}
function entre(min: number, max: number) {
  return Math.round((min + aleatori() * (max - min)) * 100) / 100;
}
function tria<T>(arr: T[]): T {
  return arr[Math.floor(aleatori() * arr.length)];
}
function data(any: number, mes: number, dia: number) {
  return new Date(Date.UTC(any, mes - 1, dia));
}

// PDF mínim però vàlid, perquè les factures adjuntes s'obrin de debò.
function pdfFactura(titol: string, linies: string[]): Buffer {
  const text = [
    "BT /F1 16 Tf 60 780 Td (" + titol + ") Tj ET",
    ...linies.map(
      (l, i) => `BT /F1 11 Tf 60 ${740 - i * 20} Td (${l}) Tj ET`,
    ),
  ].join("\n");

  const objectes = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let cos = "%PDF-1.4\n";
  const posicions: number[] = [];
  objectes.forEach((obj, i) => {
    posicions.push(cos.length);
    cos += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const inpuntXref = cos.length;
  cos += `xref\n0 ${objectes.length + 1}\n0000000000 65535 f \n`;
  for (const pos of posicions) {
    cos += String(pos).padStart(10, "0") + " 00000 n \n";
  }
  cos +=
    `trailer\n<< /Size ${objectes.length + 1} /Root 1 0 R >>\n` +
    `startxref\n${inpuntXref}\n%%EOF\n`;

  return Buffer.from(cos, "latin1");
}

// --------------------------------------------------------------------------
// 1. Usuaris de demostració (a més de l'admin que crea `seed:admin`)
// --------------------------------------------------------------------------
const PASSWORD_DEMO = "Demo1234-clinica";

async function usuaris() {
  const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!admin) {
    throw new Error(
      "No hi ha cap usuari ADMIN. Executa primer `npm run seed:admin`.",
    );
  }

  const desitjats = [
    { email: "gestora@clinica.test", name: "Marta Ferrer", role: Role.MANAGER },
    { email: "recepcio@clinica.test", name: "Jordi Camps", role: Role.OPERARI },
    { email: "auxiliar@clinica.test", name: "Nuria Sala", role: Role.OPERARI },
  ];

  const creats = [];
  for (const u of desitjats) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      await auth.api.signUpEmail({
        body: { email: u.email, password: PASSWORD_DEMO, name: u.name },
      });
      user = await prisma.user.update({
        where: { email: u.email },
        data: { role: u.role, lastLoginAt: data(ANY, 9, 1) },
      });
    }
    creats.push(user);
  }

  // Un usuari donat de baixa, per veure l'estat "inactiu" a /admin/users
  await prisma.user.update({
    where: { email: "auxiliar@clinica.test" },
    data: { actiu: false },
  });

  return { admin, gestora: creats[0], recepcio: creats[1] };
}

// --------------------------------------------------------------------------
// 2. Taules mestre
// --------------------------------------------------------------------------
const TIPUS = [
  { codi: "601", descripcio: "Material dental fungible", grup: 6, concepte: "Compres", deduible: true, esAmortitzable: false },
  { codi: "602", descripcio: "Instrumental clínic", grup: 6, concepte: "Compres", deduible: true, esAmortitzable: true },
  { codi: "621", descripcio: "Lloguer del local", grup: 6, concepte: "Serveis exteriors", deduible: true, esAmortitzable: false },
  { codi: "622", descripcio: "Reparacions i manteniment", grup: 6, concepte: "Serveis exteriors", deduible: true, esAmortitzable: false },
  { codi: "623", descripcio: "Serveis professionals independents", grup: 6, concepte: "Serveis exteriors", deduible: true, esAmortitzable: false },
  { codi: "624", descripcio: "Assegurances", grup: 6, concepte: "Serveis exteriors", deduible: true, esAmortitzable: false },
  { codi: "627", descripcio: "Publicitat i marqueting", grup: 6, concepte: "Serveis exteriors", deduible: true, esAmortitzable: false },
  { codi: "628", descripcio: "Subministraments", grup: 6, concepte: "Serveis exteriors", deduible: true, esAmortitzable: false },
  { codi: "629", descripcio: "Neteja i bugaderia", grup: 6, concepte: "Serveis exteriors", deduible: true, esAmortitzable: false },
  { codi: "640", descripcio: "Formacio i congressos", grup: 6, concepte: "Personal", deduible: true, esAmortitzable: false },
  { codi: "213", descripcio: "Equipament clinic", grup: 2, concepte: "Immobilitzat", deduible: true, esAmortitzable: true },
  { codi: "217", descripcio: "Equips informatics", grup: 2, concepte: "Immobilitzat", deduible: true, esAmortitzable: true },
  { codi: "678", descripcio: "Despeses excepcionals", grup: 6, concepte: "Altres", deduible: false, esAmortitzable: false },
];

const PROVEIDORS = [
  { nif: "B60111222", nom: "Dentalcat Distribucions SL", poblacio: "Sabadell", codiPostal: "08201", adreca: "Carrer de la Indústria, 42", email: "comandes@dentalcat.test", telefon: "937 123 456", personaContacte: "Anna Vives", iban: "ES9121000418450200051332" },
  { nif: "B61333444", nom: "Ortoplus Subministraments SL", poblacio: "Terrassa", codiPostal: "08224", adreca: "Avinguda del Vallès, 15", email: "info@ortoplus.test", telefon: "937 987 654", personaContacte: "Marc Solé" },
  { nif: "A62555666", nom: "Radiologia Tecnica BCN SA", poblacio: "Barcelona", codiPostal: "08013", adreca: "Carrer de Roger de Flor, 210", email: "tecnic@radiobcn.test", telefon: "934 556 677", personaContacte: "Laia Puig" },
  { nif: "B63777888", nom: "Immobles Rambla SL", poblacio: "Sabadell", codiPostal: "08202", adreca: "Rambla, 88", email: "administracio@immoblesrambla.test", telefon: "937 445 566", notes: "Contracte de lloguer del local, revisio anual amb l'IPC." },
  { nif: "A64999000", nom: "Energia Verda Catalana SA", poblacio: "Barcelona", codiPostal: "08029", adreca: "Carrer de Tarragona, 110", email: "clients@energiaverda.test", telefon: "900 111 222" },
  { nif: "B65222333", nom: "Neteja Integral Valles SL", poblacio: "Castellar del Vallès", codiPostal: "08211", adreca: "Carrer Major, 7", email: "serveis@netejavalles.test", telefon: "937 334 455", personaContacte: "Rosa Martí" },
  { nif: "B66444555", nom: "Gestoria Puig i Associats SL", poblacio: "Sabadell", codiPostal: "08203", adreca: "Passeig de la Plaça Major, 3", email: "fiscal@gestoriapuig.test", telefon: "937 221 133", personaContacte: "Ferran Puig", notes: "Assessorament fiscal i laboral. Factura trimestral." },
  { nif: "A67666777", nom: "Assegurances Montseny SA", poblacio: "Granollers", codiPostal: "08401", adreca: "Carrer de Girona, 25", email: "polisses@montseny.test", telefon: "938 776 655" },
  { nif: "B68888999", nom: "Informatica Dental Systems SL", poblacio: "Barcelona", codiPostal: "08018", adreca: "Carrer de Pujades, 77", email: "suport@idsystems.test", telefon: "935 667 788", personaContacte: "Oriol Bosch" },
  { nif: "B69000111", nom: "Laboratori Protesic Sant Jordi SL", poblacio: "Sabadell", codiPostal: "08204", adreca: "Carrer de Sant Jordi, 19", email: "laboratori@santjordi.test", telefon: "937 889 900", personaContacte: "Elena Roca", actiu: false, notes: "Va tancar el 2025. Es manté per l'historic de factures." },
];

// --------------------------------------------------------------------------
// 3. Neteja del domini (els usuaris no es toquen)
// --------------------------------------------------------------------------
async function netejar() {
  // Els PDFs viuen a MinIO, no a la base de dades: si no els esborrem aqui,
  // cada re-execucio del seed hi deixaria els fitxers antics orfes.
  const ambFitxer = await prisma.despesa.findMany({
    where: { fitxerKey: { not: null } },
    select: { fitxerKey: true },
  });
  for (const d of ambFitxer) {
    try {
      await deleteFactura(d.fitxerKey!);
    } catch {
      // El fitxer ja no hi era: no es motiu per aturar el seed.
    }
  }

  await prisma.amortitzacio.deleteMany();
  await prisma.inventari.deleteMany();
  await prisma.despesa.deleteMany();
  await prisma.proveidor.deleteMany();
  await prisma.tipusDespesa.deleteMany();
  await prisma.auditLog.deleteMany();
}

async function main() {
  const { admin, gestora, recepcio } = await usuaris();
  await netejar();

  // ---- Taules mestre ----
  const tipus = new Map<string, string>();
  for (const t of TIPUS) {
    const creat = await prisma.tipusDespesa.create({ data: t });
    tipus.set(t.codi, creat.id);
  }

  const proveidors = new Map<string, string>();
  for (const p of PROVEIDORS) {
    const creat = await prisma.proveidor.create({ data: p });
    proveidors.set(p.nom, creat.id);
  }

  // ---- Despeses ----
  const autors = [admin.id, gestora.id, recepcio.id];
  let comptador = 0;

  async function despesa(opts: {
    any: number;
    mes: number;
    dia: number;
    codi: string;
    proveidor: string;
    import: number;
    descripcio: string;
    pagada?: boolean;
    ambFactura?: boolean;
  }) {
    comptador++;
    const dataFactura = data(opts.any, opts.mes, opts.dia);
    const creada = await despesesService.crear({
      dataFactura,
      dataPagament:
        opts.pagada === false
          ? null
          : data(opts.any, opts.mes, Math.min(opts.dia + 20, 28)),
      import: opts.import,
      numFactura: `F-${opts.any}/${String(comptador).padStart(4, "0")}`,
      descripcio: opts.descripcio,
      tipusDespesa: { connect: { id: tipus.get(opts.codi)! } },
      proveidor: { connect: { id: proveidors.get(opts.proveidor)! } },
      registratPer: { connect: { id: tria(autors) } },
    });

    if (opts.ambFactura) {
      const pdf = pdfFactura(opts.proveidor, [
        `Factura ${creada.numFactura}`,
        `Data: ${dataFactura.toISOString().slice(0, 10)}`,
        `Concepte: ${opts.descripcio}`,
        `Import: ${opts.import.toFixed(2)} EUR`,
        "",
        "Document de demostracio generat pel seed.",
      ]);
      const key = await uploadFactura(pdf, "factura.pdf", "application/pdf");
      await prisma.despesa.update({
        where: { id: creada.id },
        data: { fitxerKey: key },
      });
    }

    await auditService.log({
      accio: AccioAudit.CREATE,
      userId: tria(autors),
      entitat: "Despesa",
      entitatId: creada.id,
    });

    return creada;
  }

  const mesActual = new Date().getMonth() + 1;

  for (let any = PRIMER_ANY; any <= ANY; any++) {
    const ultimMes = any === ANY ? mesActual : 12;

    for (let mes = 1; mes <= ultimMes; mes++) {
      // Despeses fixes de cada mes
      await despesa({ any, mes, dia: 1, codi: "621", proveidor: "Immobles Rambla SL", import: 1150 + (any - PRIMER_ANY) * 35, descripcio: "Lloguer del local", ambFactura: mes === 1 });
      await despesa({ any, mes, dia: 5, codi: "628", proveidor: "Energia Verda Catalana SA", import: entre(180, 340), descripcio: "Electricitat i aigua" });
      await despesa({ any, mes, dia: 8, codi: "629", proveidor: "Neteja Integral Valles SL", import: 320, descripcio: "Neteja mensual de la clinica" });

      // Material fungible, un parell de comandes al mes
      await despesa({ any, mes, dia: 12, codi: "601", proveidor: "Dentalcat Distribucions SL", import: entre(240, 890), descripcio: tria(["Guants, mascaretes i bates", "Anestesia i agulles", "Composites i adhesius", "Fresses i puntes de profilaxi"]) });
      if (mes % 2 === 0) {
        await despesa({ any, mes, dia: 20, codi: "601", proveidor: "Ortoplus Subministraments SL", import: entre(180, 620), descripcio: tria(["Brackets i arcs", "Alineadors i fundes", "Cubetes d'impressio"]) });
      }

      // Gestoria, trimestral
      if (mes % 3 === 0) {
        await despesa({ any, mes, dia: 25, codi: "623", proveidor: "Gestoria Puig i Associats SL", import: 450, descripcio: "Assessorament fiscal i laboral del trimestre", ambFactura: mes === 3 });
      }

      // Protesis de laboratori, fins que van tancar
      if (any < ANY && mes % 2 === 1) {
        await despesa({ any, mes, dia: 15, codi: "601", proveidor: "Laboratori Protesic Sant Jordi SL", import: entre(320, 1100), descripcio: "Protesis i fundes a mida" });
      }
    }

    // Anuals
    await despesa({ any, mes: 2, dia: 10, codi: "624", proveidor: "Assegurances Montseny SA", import: 1240, descripcio: "Polissa de responsabilitat civil", ambFactura: true });
    await despesa({ any, mes: 6, dia: 3, codi: "622", proveidor: "Radiologia Tecnica BCN SA", import: entre(280, 640), descripcio: "Manteniment i calibratge de l'equip de RX" });
    await despesa({ any, mes: 9, dia: 18, codi: "640", proveidor: "Ortoplus Subministraments SL", import: entre(350, 900), descripcio: "Congres i formacio continuada" });
    if (any >= ANY - 1) {
      await despesa({ any, mes: 4, dia: 22, codi: "627", proveidor: "Informatica Dental Systems SL", import: entre(400, 750), descripcio: "Campanya de captacio i pagina web" });
    }
  }

  // ---- Inversions (generen bé d'inventari automaticament) ----
  const inversions = [
    { any: PRIMER_ANY, mes: 3, dia: 14, codi: "213", proveidor: "Dentalcat Distribucions SL", import: 14500, descripcio: "Cadira dental amb equip complet", perc: 12 },
    { any: PRIMER_ANY, mes: 5, dia: 9, codi: "213", proveidor: "Radiologia Tecnica BCN SA", import: 9800, descripcio: "Ortopantomograf digital", perc: 12 },
    { any: PRIMER_ANY, mes: 10, dia: 2, codi: "217", proveidor: "Informatica Dental Systems SL", import: 3200, descripcio: "Servidor i estacions de recepcio", perc: 25 },
    { any: PRIMER_ANY + 1, mes: 2, dia: 27, codi: "602", proveidor: "Ortoplus Subministraments SL", import: 2650, descripcio: "Instrumental quirurgic d'implantologia", perc: 15 },
    { any: PRIMER_ANY + 1, mes: 7, dia: 11, codi: "213", proveidor: "Dentalcat Distribucions SL", import: 5400, descripcio: "Autoclau classe B i segelladora", perc: 12 },
    { any: PRIMER_ANY + 1, mes: 11, dia: 6, codi: "217", proveidor: "Informatica Dental Systems SL", import: 1850, descripcio: "Escaner intraoral (part informatica)", perc: 25 },
    { any: ANY, mes: 1, dia: 23, codi: "213", proveidor: "Radiologia Tecnica BCN SA", import: 7300, descripcio: "Equip de cirurgia guiada", perc: 12 },
    { any: ANY, mes: 5, dia: 8, codi: "602", proveidor: "Dentalcat Distribucions SL", import: 1980, descripcio: "Instrumental de periodoncia", perc: 15 },
  ];

  for (const inv of inversions) {
    const creada = await despesa({ ...inv, ambFactura: true });
    // El servei crea el bé amb percentatge 0; li posem el d'amortitzacio real
    await prisma.inventari.updateMany({
      where: { despesaId: creada.id },
      data: { percAmortitzacio: inv.perc },
    });
  }

  // ---- Amortitzacions dels exercicis tancats ----
  // L'exercici en curs es deixa pendent a proposit, perque es pugui generar
  // des de la interficie i veure com funciona.
  for (let exercici = PRIMER_ANY; exercici < ANY; exercici++) {
    await amortitzacionsService.generarAmortitzacions(exercici);
    await auditService.log({
      accio: AccioAudit.AMORTITZACIONS_GENERATED,
      userId: admin.id,
      metadata: { exercici },
    });
  }

  // Un bé donat de baixa: s'ha amortitzat mentre estava en us i es retira
  // aquest exercici, que es com passaria de debo.
  const beVell = await prisma.inventari.findFirst({
    where: { descripcio: { contains: "Servidor" } },
  });
  if (beVell) {
    await prisma.inventari.update({
      where: { id: beVell.id },
      data: { estat: EstatInventari.BAIXA, anyBaixa: ANY },
    });
  }

  // ---- Auditoria d'autenticacio i administracio ----
  for (let i = 0; i < 12; i++) {
    await auditService.log({
      accio: tria([AccioAudit.LOGIN_OK, AccioAudit.LOGIN_OK, AccioAudit.LOGIN_FAIL]),
      userId: tria(autors),
      ip: `192.168.1.${Math.floor(aleatori() * 60) + 20}`,
    });
  }
  await auditService.log({
    accio: AccioAudit.ROLE_CHANGED,
    userId: admin.id,
    entitat: "User",
    entitatId: gestora.id,
    canvis: { role: { abans: "OPERARI", despres: "MANAGER" } },
  });
  await auditService.log({
    accio: AccioAudit.USER_BLOCKED,
    userId: admin.id,
    entitat: "User",
    entitatId: recepcio.id,
    metadata: { motiu: "Baixa temporal" },
  });

  // ---- Resum ----
  const [nDespeses, nProveidors, nTipus, nInventari, nAmort, nAudit] =
    await Promise.all([
      prisma.despesa.count(),
      prisma.proveidor.count(),
      prisma.tipusDespesa.count(),
      prisma.inventari.count(),
      prisma.amortitzacio.count(),
      prisma.auditLog.count(),
    ]);
  const total = await prisma.despesa.aggregate({ _sum: { import: true } });

  console.log("Dades de demostracio creades:");
  console.log(`  Despeses .......... ${nDespeses} (${total._sum.import} EUR en total)`);
  console.log(`  Proveidors ........ ${nProveidors}`);
  console.log(`  Tipus de despesa .. ${nTipus}`);
  console.log(`  Bens d'inventari .. ${nInventari}`);
  console.log(`  Amortitzacions .... ${nAmort} (exercicis ${PRIMER_ANY}-${ANY - 1})`);
  console.log(`  Entrades d'auditoria ${nAudit}`);
  console.log("");
  console.log(`Usuaris de prova (contrasenya: ${PASSWORD_DEMO}):`);
  console.log("  gestora@clinica.test   MANAGER");
  console.log("  recepcio@clinica.test  OPERARI");
  console.log("  auxiliar@clinica.test  OPERARI (desactivat)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
