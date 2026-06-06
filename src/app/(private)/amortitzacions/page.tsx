import * as amortitzacionsService from "@/services/amortitzacions-service";
import * as inventariService from "@/services/inventari-service";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResultToast, type ResultToastMap } from "@/components/result-toast";
import { generarAmortitzacionsAction, retrocedirAction } from "./actions";

const TOAST_MAP: ResultToastMap = {
  generat: { type: "success", text: "Amortitzacions generades" },
  retrocedit: { type: "success", text: "Amortitzacions retrocedides" },
  error: { type: "error", text: "No s'ha pogut completar l'operació" },
};

export default async function AmortitzacionsPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const params = await searchParams;
  const [exercicisGenerats, bens, estat] = await Promise.all([
    amortitzacionsService.llistarExercicisGenerats(),
    inventariService.llistar({ estat: "ACTIU" }),
    amortitzacionsService.estatExercicis(),
  ]);

  const formatImport = (n: number | string) =>
    Number(n).toLocaleString("ca-ES", { style: "currency", currency: "EUR" });

  // Béns que s'amortitzaran en generar el pròxim exercici: adquirits aquell
  // any o abans (els altres encara no existien fiscalment).
  const bensExercici = bens.filter(
    (b) => new Date(b.dataAdquisicio).getFullYear() <= estat.proximAGenerar,
  );

  return (
    <div className="space-y-6">
      <ResultToast msg={params.msg} map={TOAST_MAP} />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Amortitzacions
        </h1>
        <p className="text-muted-foreground">
          Generació d&apos;amortitzacions per exercici dels béns d&apos;inventari
        </p>
      </div>

      <form
        action={generarAmortitzacionsAction}
        className="flex items-center gap-3 rounded-lg border bg-card p-4"
      >
        <input type="hidden" name="exercici" value={estat.proximAGenerar} />
        <p className="text-sm text-muted-foreground">
          Pròxim exercici:{" "}
          <span className="font-semibold text-foreground">
            {estat.proximAGenerar}
          </span>
        </p>
        <Button type="submit">
          Generar amortitzacions {estat.proximAGenerar}
        </Button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-3">
          Béns a amortitzar en l&apos;exercici {estat.proximAGenerar}
        </h2>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Núm.</TableHead>
                <TableHead>Bé</TableHead>
                <TableHead>Import adquisició</TableHead>
                <TableHead>Amortitzat</TableHead>
                <TableHead>Pendent</TableHead>
                <TableHead>% anual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bensExercici.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    Cap bé per amortitzar en l&apos;exercici{" "}
                    {estat.proximAGenerar}.
                  </TableCell>
                </TableRow>
              ) : (
                bensExercici.map((b) => {
                  const pendent =
                    Number(b.importAdquisicio) - Number(b.importAmortitzat);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-sm">
                        {b.numInventari ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {b.descripcio}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatImport(b.importAdquisicio.toString())}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatImport(b.importAmortitzat.toString())}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatImport(pendent)}
                      </TableCell>
                      <TableCell>{b.percAmortitzacio.toString()}%</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">
          Exercicis amb amortitzacions generades
        </h2>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercici</TableHead>
                <TableHead>Total amortitzat</TableHead>
                <TableHead>Béns</TableHead>
                <TableHead className="text-right">Accions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercicisGenerats.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    Cap exercici amb amortitzacions generades encara.
                  </TableCell>
                </TableRow>
              ) : (
                exercicisGenerats.map((e) => (
                  <TableRow key={e.exercici}>
                    <TableCell className="font-medium">{e.exercici}</TableCell>
                    <TableCell className="font-mono">
                      {formatImport((e.total ?? 0).toString())}
                    </TableCell>
                    <TableCell>{e.comptador}</TableCell>
                    <TableCell className="text-right">
                      {e.exercici === estat.ultimGenerat && (
                        <form action={retrocedirAction.bind(null, e.exercici)}>
                          <Button type="submit" variant="outline" size="sm">
                            Retrocedir
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
