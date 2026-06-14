import * as dashboardService from "@/services/dashboard-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DespesesPerMesChart, DespesesPerTipusChart } from "./dashboard-charts";

const eur = (n: number) =>
  n.toLocaleString("ca-ES", { style: "currency", currency: "EUR" });

export default async function DashboardPage() {
  const { any, totalAny, perMes, perTipus, topProveidors } =
    await dashboardService.dadesDashboard();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Despeses de l&apos;any {any}:{" "}
          <span className="font-semibold text-foreground">{eur(totalAny)}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despeses per mes ({any})</CardTitle>
        </CardHeader>
        <CardContent>
          <DespesesPerMesChart data={perMes} />{" "}
          {/* ← passa dades al gràfic (prop) */}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Despeses per tipus</CardTitle>
          </CardHeader>
          <CardContent>
            {perTipus.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">
                Encara no hi ha despeses aquest any.
              </p>
            ) : (
              <DespesesPerTipusChart data={perTipus} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top proveïdors ({any})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveïdor</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProveidors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-8"
                    >
                      Encara no hi ha despeses aquest any.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProveidors.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.nom}</TableCell>
                      <TableCell className="text-right font-mono">
                        {eur(p.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
