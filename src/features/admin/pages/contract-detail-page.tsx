"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, BellRing, Loader2, Mail, Pause, Pencil, Phone, Play, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/features/admin/admin-api";
import { PaymentDialog } from "@/features/admin/billing/payment-dialog";
import { deliveryStatusLabels, deliveryStatusTone } from "@/features/admin/quote-deliveries";
import { useCan } from "@/features/admin/session";
import type { BillingMonths, ContractDetail, ContractPayment, ContractStatus, UpdateContractInput } from "@/features/admin/types";
import {
  billingPeriodLabels,
  centsToInput,
  contractStatusLabels,
  contractTypeLabels,
  DuePill,
  ErrorState,
  formatCalendarDate,
  formatDateTime,
  isoToDateInput,
  PageHeader,
  Panel,
  parsePesosInput,
  paymentMethodLabels,
  StatusPill,
  useAdminMutation,
} from "@/features/admin/ui";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusActions: Record<ContractStatus, { status: ContractStatus; label: string; icon: typeof Pause; confirm: string }[]> = {
  active: [
    { status: "paused", label: "Pausar", icon: Pause, confirm: "Mientras esté en pausa no se enviarán recordatorios de pago." },
    { status: "cancelled", label: "Cancelar", icon: XCircle, confirm: "El registro dejará de generar cobros y recordatorios. El historial de pagos se conserva." },
  ],
  paused: [
    { status: "active", label: "Reactivar", icon: Play, confirm: "Se reanudarán los recordatorios a partir del próximo cobro registrado." },
    { status: "cancelled", label: "Cancelar", icon: XCircle, confirm: "El registro dejará de generar cobros y recordatorios. El historial de pagos se conserva." },
  ],
  cancelled: [],
  completed: [],
};

const actionLabels: Record<string, string> = {
  "contract.created": "Registro creado",
  "contract.updated": "Datos actualizados",
  "contract.status_changed": "Cambio de estado",
  "contract.payment_registered": "Pago registrado",
  "contract.payment_voided": "Pago anulado",
  "contract.reminder_requested": "Recordatorio solicitado",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const canWrite = useCan("billing:write");
  const queryKey = ["admin", "contract", id];
  const { data, isPending, error } = useQuery({ queryKey, queryFn: () => adminApi.get<ContractDetail>(`/admin/contracts/${id}`) });

  const [paying, setPaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [voiding, setVoiding] = useState<ContractPayment | null>(null);
  const [statusChange, setStatusChange] = useState<(typeof statusActions)[ContractStatus][number] | null>(null);

  const applyDetail = (detail: ContractDetail) => {
    queryClient.setQueryData(queryKey, detail);
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  const remind = useAdminMutation({
    mutationFn: () => adminApi.send<ContractDetail>("POST", `/admin/contracts/${id}/remind`),
    onSuccess: (detail) => {
      applyDetail(detail);
      // El envío se procesa en segundo plano: se vuelve a consultar en unos segundos.
      setTimeout(() => void queryClient.invalidateQueries({ queryKey }), 4000);
    },
  });
  const changeStatus = useAdminMutation({
    mutationFn: (status: ContractStatus) => adminApi.send<ContractDetail>("PATCH", `/admin/contracts/${id}`, { status }),
    onSuccess: (detail) => {
      applyDetail(detail);
      setStatusChange(null);
    },
  });

  if (error) return <ErrorState error={error} />;
  if (isPending) return <Skeleton className="h-96 rounded-2xl" />;

  const rental = data.type === "rental";
  const active = data.status === "active";
  const paidPct = !rental && data.totalCents ? Math.min(100, Math.round((data.paidCents / data.totalCents) * 100)) : 0;

  return (
    <>
      <Link href="/admin/contratos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Rentas y compras
      </Link>
      <PageHeader
        title={`${contractTypeLabels[data.type]} ${data.reference}`}
        description={data.packageName}
        actions={
          canWrite && (
            <>
              {active && (
                <Button variant="brand" onClick={() => setPaying(true)}>
                  <Banknote data-icon="inline-start" /> Registrar pago
                </Button>
              )}
              {active && data.nextDueDate && (
                <Button variant="outline" disabled={remind.isPending} onClick={() => remind.mutate()}>
                  {remind.isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <BellRing data-icon="inline-start" />} Enviar recordatorio ahora
                </Button>
              )}
              {data.status !== "cancelled" && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil data-icon="inline-start" /> Editar
                </Button>
              )}
              {statusActions[data.status].map((action) => (
                <Button key={action.status} variant={action.status === "cancelled" ? "destructive" : "outline"} onClick={() => setStatusChange(action)}>
                  <action.icon data-icon="inline-start" /> {action.label}
                </Button>
              ))}
            </>
          )
        }
      />
      {remind.error && <ErrorState error={remind.error} className="mb-4" />}
      {remind.isSuccess && <p role="status" className="mb-4 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">Recordatorio encolado para {data.client?.email ?? "el cliente"}.</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Resumen">
            <div className="grid gap-6 p-5 sm:grid-cols-2">
              <dl className="divide-y divide-border">
                <Row label="Estado"><StatusPill status={data.status} label={contractStatusLabels[data.status]} /></Row>
                {rental ? (
                  <>
                    <Row label="Mensualidad">{data.monthlyCents !== null ? formatMoney(data.monthlyCents) : "—"}</Row>
                    <Row label="Periodicidad">{billingPeriodLabels[data.billingMonths]}</Row>
                    <Row label="Cobro por periodo">{data.chargeCents !== null ? formatMoney(data.chargeCents) : "—"}</Row>
                    <Row label="Plazo mínimo">{data.termMonths === 0 ? "Sin plazo forzoso" : `${data.termMonths} meses`}</Row>
                  </>
                ) : (
                  <>
                    <Row label="Precio total">{data.totalCents !== null ? formatMoney(data.totalCents) : "—"}</Row>
                    <Row label="Pagado">{formatMoney(data.paidCents)}</Row>
                    <Row label="Saldo">{data.balanceCents !== null ? formatMoney(data.balanceCents) : "—"}</Row>
                  </>
                )}
                <Row label="Inicio">{formatCalendarDate(data.startDate)}</Row>
              </dl>
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-mist p-4">
                  <p className="text-sm text-muted-foreground">Próximo cobro</p>
                  <p className="mt-1 text-xl font-semibold">{formatCalendarDate(data.nextDueDate)}</p>
                  {active && <div className="mt-2"><DuePill dueState={data.dueState} daysUntilDue={data.daysUntilDue} /></div>}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Recordatorios por correo: {data.remindersEnabled ? "activados" : "desactivados"}
                  </p>
                </div>
                {!rental && data.totalCents !== null && (
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>Avance de pago</span>
                      <span className="tabular-nums">{paidPct} %</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-cloud" role="progressbar" aria-valuenow={paidPct} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de pago">
                      <div className="h-full rounded-full bg-royal" style={{ width: `${paidPct}%` }} />
                    </div>
                  </div>
                )}
                {rental && <p className="text-sm text-foreground-secondary">Total cobrado: <span className="font-medium text-foreground">{formatMoney(data.paidCents)}</span></p>}
              </div>
            </div>
          </Panel>

          <Panel title={`Pagos (${data.payments.length})`}>
            {data.payments.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Aún no hay pagos registrados.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="hidden sm:table-cell">Forma</TableHead>
                    <TableHead className="hidden md:table-cell">Detalle</TableHead>
                    <TableHead className="text-right"><span className="sr-only">Acciones</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payments.map((p) => (
                    <TableRow key={p.id} className={cn(p.voided && "text-muted-foreground")}>
                      <TableCell>
                        <span className={cn("block", p.voided && "line-through")}>{formatCalendarDate(p.paidAt)}</span>
                        {p.voided && <StatusPill status="cancelled" label="Anulado" />}
                      </TableCell>
                      <TableCell className={cn("text-right tabular-nums", p.voided && "line-through")}>{formatMoney(p.amountCents)}</TableCell>
                      <TableCell className="hidden sm:table-cell">{paymentMethodLabels[p.method]}</TableCell>
                      <TableCell className="hidden max-w-64 text-xs md:table-cell">
                        {rental && p.periods > 0 && <span className="block">{p.periods} {p.periods === 1 ? "periodo" : "periodos"}{p.coveredDueDate ? ` · cobro del ${formatCalendarDate(p.coveredDueDate)}` : ""}</span>}
                        {p.reference && <span className="block truncate">Ref. {p.reference}</span>}
                        {p.note && <span className="block truncate">{p.note}</span>}
                        {p.voided && p.voidReason && <span className="block truncate text-magenta">Motivo: {p.voidReason}</span>}
                        <span className="block text-muted-foreground">{p.recordedBy}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {canWrite && !p.voided && (
                          <Button size="sm" variant="ghost" onClick={() => setVoiding(p)} aria-label={`Anular pago del ${formatCalendarDate(p.paidAt)}`}>
                            Anular
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {rental && data.payments.some((p) => p.voided) && (
              <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Anular un pago no modifica el próximo cobro; ajústalo con «Editar» si es necesario.</p>
            )}
          </Panel>

          <Panel title="Recordatorios">
            <div className="space-y-3 p-5">
              {data.emailSimulated && (
                <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-foreground-secondary">
                  Modo simulado para correo: los recordatorios se registran pero no se entregan hasta configurar el proveedor de correo.
                </p>
              )}
              {data.reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin recordatorios enviados.</p>
              ) : (
                <ul className="space-y-2">
                  {data.reminders.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border p-3 text-sm">
                      <span className="flex items-start gap-2">
                        <Mail className="mt-0.5 size-4 text-electric" aria-hidden />
                        <span>
                          <span className="block font-medium">{r.kind === "payment_reminder" ? "Recordatorio al cliente" : "Resumen al administrador"}</span>
                          <span className="block text-xs text-muted-foreground">
                            {r.recipient}
                            {r.dueDate ? ` · cobro del ${formatCalendarDate(r.dueDate)}` : ""} · {formatDateTime(r.createdAt)} · {r.requestedBy === "system" ? "automático" : r.requestedBy}
                          </span>
                          {r.lastError && r.status !== "sent" && <span className="mt-1 block text-xs break-words text-muted-foreground">{r.lastError}</span>}
                        </span>
                      </span>
                      <StatusPill status={deliveryStatusTone[r.status]} label={deliveryStatusLabels[r.status]} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Cliente">
            {data.client ? (
              <div className="space-y-2 p-5 text-sm">
                <Link href={`/admin/clientes/${data.client.id}`} className="block font-medium text-electric hover:underline">{data.client.name}</Link>
                {data.client.company && <p className="text-muted-foreground">{data.client.company}</p>}
                <a href={`mailto:${data.client.email}`} className="flex items-center gap-2 break-all text-foreground-secondary hover:text-foreground">
                  <Mail className="size-4 shrink-0" aria-hidden /> {data.client.email}
                </a>
                {data.client.phone && (
                  <a href={`tel:${data.client.phone}`} className="flex items-center gap-2 text-foreground-secondary hover:text-foreground">
                    <Phone className="size-4 shrink-0" aria-hidden /> {data.client.phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="p-5 text-sm text-muted-foreground">Cliente no disponible.</p>
            )}
          </Panel>
          {(data.notes || data.quoteId) && (
            <Panel title="Notas">
              <div className="space-y-2 p-5 text-sm">
                {data.notes && <p className="whitespace-pre-line text-foreground-secondary">{data.notes}</p>}
                {data.quoteId && <Link href={`/admin/cotizaciones/${data.quoteId}`} className="text-electric hover:underline">Ver cotización de origen</Link>}
              </div>
            </Panel>
          )}
          <Panel title="Historial">
            {data.history.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Sin movimientos.</p>
            ) : (
              <ol className="space-y-3 p-5 text-sm">
                {data.history.map((h, i) => (
                  <li key={i} className="border-l-2 border-royal/30 pl-3">
                    <p className="font-medium">{actionLabels[h.action] ?? h.action}</p>
                    <p className="text-xs text-muted-foreground">{h.actor} · {formatDateTime(h.at)}</p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>

      <PaymentDialog contract={paying ? data : null} onClose={() => setPaying(false)} onRegistered={applyDetail} />
      {editing && <EditContractDialog contract={data} onClose={() => setEditing(false)} onSaved={applyDetail} />}
      <VoidPaymentDialog contractId={data.id} payment={voiding} onClose={() => setVoiding(null)} onVoided={applyDetail} />

      <Dialog open={statusChange !== null} onOpenChange={(open) => !open && setStatusChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{statusChange?.label} {data.reference}</DialogTitle>
            <DialogDescription>{statusChange?.confirm}</DialogDescription>
          </DialogHeader>
          {changeStatus.error && <ErrorState error={changeStatus.error} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChange(null)}>Volver</Button>
            <Button
              variant={statusChange?.status === "cancelled" ? "destructive" : "brand"}
              disabled={changeStatus.isPending}
              onClick={() => statusChange && changeStatus.mutate(statusChange.status)}
            >
              {changeStatus.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditContractDialog({ contract, onClose, onSaved }: { contract: ContractDetail; onClose: () => void; onSaved: (detail: ContractDetail) => void }) {
  const rental = contract.type === "rental";
  const [packageName, setPackageName] = useState(contract.packageName);
  const [monthly, setMonthly] = useState(centsToInput(contract.monthlyCents));
  const [billingMonths, setBillingMonths] = useState<BillingMonths>(contract.billingMonths);
  const [total, setTotal] = useState(centsToInput(contract.totalCents));
  const [nextDueDate, setNextDueDate] = useState(isoToDateInput(contract.nextDueDate));
  const [termMonths, setTermMonths] = useState(String(contract.termMonths));
  const [remindersEnabled, setRemindersEnabled] = useState(contract.remindersEnabled);
  const [notes, setNotes] = useState(contract.notes ?? "");

  const monthlyCents = parsePesosInput(monthly);
  const totalCents = parsePesosInput(total);
  const term = Number.parseInt(termMonths, 10);
  const valid =
    packageName.trim().length >= 2 &&
    (rental ? monthlyCents !== null && monthlyCents > 0 && Number.isInteger(term) && term >= 0 && term <= 120 : totalCents !== null && totalCents > 0);

  const mutation = useAdminMutation({
    mutationFn: () => {
      // Solo se envían los campos que cambiaron.
      const patch: UpdateContractInput = {};
      if (packageName.trim() !== contract.packageName) patch.packageName = packageName.trim();
      if (rental) {
        if (monthlyCents !== contract.monthlyCents) patch.monthlyCents = monthlyCents!;
        if (billingMonths !== contract.billingMonths) patch.billingMonths = billingMonths;
        if (term !== contract.termMonths) patch.termMonths = term;
      } else if (totalCents !== contract.totalCents) {
        patch.totalCents = totalCents!;
      }
      if (nextDueDate !== isoToDateInput(contract.nextDueDate)) patch.nextDueDate = nextDueDate || null;
      if (remindersEnabled !== contract.remindersEnabled) patch.remindersEnabled = remindersEnabled;
      if (notes !== (contract.notes ?? "")) patch.notes = notes;
      return adminApi.send<ContractDetail>("PATCH", `/admin/contracts/${contract.id}`, patch);
    },
    onSuccess: (detail) => {
      onSaved(detail);
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Editar {contract.reference}</DialogTitle>
            <DialogDescription>Los cambios de importe aplican a los cobros siguientes; los pagos registrados no se modifican.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="e-name">Concepto</Label>
            <Input id="e-name" required minLength={2} maxLength={160} value={packageName} onChange={(e) => setPackageName(e.target.value)} />
          </div>
          {rental ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="e-monthly">Mensualidad (MXN)</Label>
                <Input id="e-monthly" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} aria-invalid={monthlyCents === null} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-period">Periodicidad</Label>
                <Select value={String(billingMonths)} onValueChange={(v) => setBillingMonths(Number(v) as BillingMonths)}>
                  <SelectTrigger id="e-period" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {([1, 6, 12] as const).map((m) => (
                      <SelectItem key={m} value={String(m)}>{billingPeriodLabels[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="e-term">Plazo mínimo (meses)</Label>
                <Input id="e-term" type="number" min={0} max={120} value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="e-total">Precio total (MXN)</Label>
              <Input id="e-total" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} aria-invalid={totalCents === null} />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="e-due">{rental ? "Próximo cobro" : "Fecha límite del saldo"}</Label>
            <Input id="e-due" type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />
            <p className="text-xs text-muted-foreground">Ajuste manual; déjalo vacío si no hay cobro pendiente.</p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-mist px-4 py-3">
            <Label htmlFor="e-reminders">Recordatorios por correo</Label>
            <Switch id="e-reminders" checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-notes">Notas internas</Label>
            <Textarea id="e-notes" rows={3} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {mutation.error && <ErrorState error={mutation.error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="brand" disabled={!valid || mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VoidPaymentDialog({ contractId, payment, onClose, onVoided }: { contractId: string; payment: ContractPayment | null; onClose: () => void; onVoided: (detail: ContractDetail) => void }) {
  const [reason, setReason] = useState("");
  const mutation = useAdminMutation({
    mutationFn: () => adminApi.send<ContractDetail>("POST", `/admin/contracts/${contractId}/payments/${payment!.id}/void`, { reason: reason.trim() }),
    onSuccess: (detail) => {
      setReason("");
      onVoided(detail);
      onClose();
    },
  });
  return (
    <Dialog open={payment !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Anular pago</DialogTitle>
            <DialogDescription>
              {payment ? `${formatMoney(payment.amountCents)} del ${formatCalendarDate(payment.paidAt)}. ` : ""}El pago quedará en el historial como anulado y dejará de contar en los reportes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="v-reason">Motivo</Label>
            <Input id="v-reason" required minLength={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          {mutation.error && <ErrorState error={mutation.error} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Volver</Button>
            <Button type="submit" variant="destructive" disabled={mutation.isPending || reason.trim().length < 3}>
              {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Anular pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
