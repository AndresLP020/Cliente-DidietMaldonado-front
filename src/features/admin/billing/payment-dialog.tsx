"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/features/admin/admin-api";
import type { ContractDetail, ContractListItem, PaymentMethod, RegisterPaymentInput } from "@/features/admin/types";
import { centsToInput, ErrorState, formatCalendarDate, parsePesosInput, paymentMethodLabels, todayInput, useAdminMutation } from "@/features/admin/ui";
import { formatMoney } from "@/lib/format";

type PayableContract = Pick<ContractListItem, "id" | "reference" | "type" | "chargeCents" | "monthlyCents" | "billingMonths" | "balanceCents" | "nextDueDate"> & {
  client: { name: string } | null;
};

interface Props {
  contract: PayableContract | null;
  onClose: () => void;
  onRegistered?: (detail: ContractDetail) => void;
}

/** Registra un pago recibido (efectivo, transferencia...). En rentas avanza el próximo cobro. */
export function PaymentDialog({ contract, onClose, onRegistered }: Props) {
  return (
    <Dialog open={contract !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>{contract && <PaymentForm key={contract.id} contract={contract} onClose={onClose} onRegistered={onRegistered} />}</DialogContent>
    </Dialog>
  );
}

function periodAmount(contract: PayableContract, periods: number): number | null {
  return contract.monthlyCents === null ? null : contract.monthlyCents * contract.billingMonths * periods;
}

function PaymentForm({ contract, onClose, onRegistered }: { contract: PayableContract } & Omit<Props, "contract">) {
  const queryClient = useQueryClient();
  const rental = contract.type === "rental";
  const [periods, setPeriods] = useState("1");
  const [amount, setAmount] = useState(centsToInput(contract.chargeCents));
  const [paidAt, setPaidAt] = useState(todayInput());
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const amountCents = parsePesosInput(amount);
  const periodCount = Number.parseInt(periods, 10);
  const validPeriods = !rental || (Number.isInteger(periodCount) && periodCount >= 1 && periodCount <= 24);

  const mutation = useAdminMutation({
    mutationFn: () => {
      const body: RegisterPaymentInput = {
        amountCents: amountCents!,
        paidAt,
        method,
        ...(reference.trim() ? { reference: reference.trim() } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(rental ? { periods: periodCount } : {}),
      };
      return adminApi.send<ContractDetail>("POST", `/admin/contracts/${contract.id}/payments`, body);
    },
    onSuccess: (detail) => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      onRegistered?.(detail);
      onClose();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-4"
    >
      <DialogHeader>
        <DialogTitle>Registrar pago</DialogTitle>
        <DialogDescription>
          {contract.reference}
          {contract.client ? ` · ${contract.client.name}` : ""}
          {contract.nextDueDate ? ` · cobro del ${formatCalendarDate(contract.nextDueDate)}` : ""}
        </DialogDescription>
      </DialogHeader>

      {rental && (
        <div className="space-y-2">
          <Label htmlFor="p-periods">Periodos que cubre</Label>
          <Input
            id="p-periods"
            type="number"
            min={1}
            max={24}
            inputMode="numeric"
            value={periods}
            onChange={(e) => {
              setPeriods(e.target.value);
              const n = Number.parseInt(e.target.value, 10);
              const suggested = Number.isInteger(n) && n >= 1 ? periodAmount(contract, n) : null;
              if (suggested !== null) setAmount(centsToInput(suggested));
            }}
          />
          <p className="text-xs text-muted-foreground">El próximo cobro avanza {contract.billingMonths === 1 ? "un mes" : `${contract.billingMonths} meses`} por cada periodo.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-amount">Importe (MXN)</Label>
          <Input id="p-amount" inputMode="decimal" required value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={amount !== "" && amountCents === null} />
          {!rental && contract.balanceCents !== null && <p className="text-xs text-muted-foreground">Saldo pendiente: {formatMoney(contract.balanceCents)}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-date">Fecha de pago</Label>
          <Input id="p-date" type="date" required value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-method">Forma de pago</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
            <SelectTrigger id="p-method" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-ref">Referencia</Label>
          <Input id="p-ref" maxLength={120} placeholder="Folio, clave de rastreo..." value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="p-note">Nota</Label>
        <Textarea id="p-note" maxLength={500} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {mutation.error && <ErrorState error={mutation.error} />}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="brand" disabled={mutation.isPending || amountCents === null || amountCents <= 0 || !paidAt || !validPeriods}>
          {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Registrar pago
        </Button>
      </DialogFooter>
    </form>
  );
}
