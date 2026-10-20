"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Search, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/features/admin/admin-api";
import type { AdminClientRow, AdminPackageSummary, BillingMonths, ContractDetail, ContractType, CreateContractInput, Paged } from "@/features/admin/types";
import { billingPeriodLabels, contractTypeLabels, ErrorState, parsePesosInput, todayInput, useAdminMutation } from "@/features/admin/ui";
import { cn } from "@/lib/utils";

const NO_PACKAGE = "none";

/** Alta de una renta (cobro periódico) o una compra (pago único o en abonos). */
export function CreateContractDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">{open && <CreateContractForm onClose={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CreateContractForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState<ContractType>("rental");
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [client, setClient] = useState<AdminClientRow | null>(null);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", company: "" });
  const [packageId, setPackageId] = useState(NO_PACKAGE);
  const [packageName, setPackageName] = useState("");
  const [startDate, setStartDate] = useState(todayInput());
  const [monthly, setMonthly] = useState("");
  const [billingMonths, setBillingMonths] = useState<BillingMonths>(1);
  const [firstDueDate, setFirstDueDate] = useState("");
  const [termMonths, setTermMonths] = useState("0");
  const [total, setTotal] = useState("");
  const [balanceDueDate, setBalanceDueDate] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [notes, setNotes] = useState("");

  const packages = useQuery({ queryKey: ["admin", "packages"], queryFn: () => adminApi.get<{ items: AdminPackageSummary[] }>("/admin/packages") });

  const monthlyCents = parsePesosInput(monthly);
  const totalCents = parsePesosInput(total);
  const term = Number.parseInt(termMonths, 10);
  const rental = type === "rental";

  const clientReady =
    clientMode === "existing" ? client !== null : newClient.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(newClient.email.trim());
  const amountReady = rental ? monthlyCents !== null && monthlyCents > 0 : totalCents !== null && totalCents > 0;
  const termReady = !rental || (Number.isInteger(term) && term >= 0 && term <= 120);
  const ready = clientReady && amountReady && termReady && packageName.trim().length >= 2 && startDate !== "";

  const choosePackage = (id: string) => {
    setPackageId(id);
    const pkg = packages.data?.items.find((p) => p.id === id);
    if (!pkg) return;
    setPackageName(pkg.name);
    // Sugerencia a partir de los precios publicados; siempre editable.
    if (rental && pkg.rental?.monthlyCents && !monthly) setMonthly(String(pkg.rental.monthlyCents / 100));
    if (!rental && pkg.price?.baseCents && !total) setTotal(String(pkg.price.baseCents / 100));
  };

  const mutation = useAdminMutation({
    mutationFn: () => {
      const optional = (value: string) => (value.trim() ? value.trim() : undefined);
      const body: CreateContractInput = {
        type,
        ...(clientMode === "existing"
          ? { clientId: client!.id }
          : { newClient: { name: newClient.name.trim(), email: newClient.email.trim(), phone: optional(newClient.phone), company: optional(newClient.company) } }),
        ...(packageId !== NO_PACKAGE ? { packageId } : {}),
        packageName: packageName.trim(),
        startDate,
        ...(rental
          ? { monthlyCents: monthlyCents!, billingMonths, termMonths: term, ...(firstDueDate ? { firstDueDate } : {}) }
          : { totalCents: totalCents!, ...(balanceDueDate ? { balanceDueDate } : {}) }),
        remindersEnabled,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };
      return adminApi.send<ContractDetail>("POST", "/admin/contracts", body);
    },
    onSuccess: (detail) => {
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      onClose();
      router.push(`/admin/contratos/${detail.id}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) mutation.mutate();
      }}
      className="space-y-5"
    >
      <DialogHeader>
        <DialogTitle>Nueva renta o compra</DialogTitle>
        <DialogDescription>Registra el acuerdo con el cliente para llevar el control de cobros y enviar recordatorios de pago.</DialogDescription>
      </DialogHeader>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Modalidad</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          {(["rental", "purchase"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                type === value ? "border-royal bg-sky text-royal" : "border-border bg-canvas hover:border-royal/40",
              )}
            >
              <span className="block font-medium">{contractTypeLabels[value]}</span>
              <span className="block text-xs text-muted-foreground">{value === "rental" ? "Cobro periódico (mensual, semestral o anual)" : "Pago único o en abonos"}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3" aria-labelledby="k-client-legend">
        <div className="flex items-center justify-between gap-2">
          <span id="k-client-legend" className="text-sm font-medium">Cliente</span>
          <Button type="button" size="sm" variant="ghost" onClick={() => setClientMode(clientMode === "existing" ? "new" : "existing")}>
            {clientMode === "existing" ? <><UserPlus /> Cliente nuevo</> : <><Users /> Buscar cliente existente</>}
          </Button>
        </div>
        {clientMode === "existing" ? (
          <ClientPicker selected={client} onSelect={setClient} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="c-name" label="Nombre">
              <Input id="c-name" required maxLength={120} value={newClient.name} onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))} />
            </Field>
            <Field id="c-email" label="Correo">
              <Input id="c-email" type="email" required maxLength={254} value={newClient.email} onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))} />
            </Field>
            <Field id="c-phone" label="Teléfono (opcional)">
              <Input id="c-phone" type="tel" maxLength={20} value={newClient.phone} onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))} />
            </Field>
            <Field id="c-company" label="Empresa (opcional)">
              <Input id="c-company" maxLength={160} value={newClient.company} onChange={(e) => setNewClient((c) => ({ ...c, company: e.target.value }))} />
            </Field>
            <p className="text-xs text-muted-foreground sm:col-span-2">Si el correo ya está registrado, se usará el cliente existente.</p>
          </div>
        )}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="k-package" label="Paquete del catálogo (opcional)">
          <Select value={packageId} onValueChange={choosePackage}>
            <SelectTrigger id="k-package" className="w-full"><SelectValue placeholder="Selecciona un paquete" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PACKAGE}>Sin paquete del catálogo</SelectItem>
              {packages.data?.items.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="k-name" label="Concepto" hint="Nombre que verá el cliente en los recordatorios.">
          <Input id="k-name" required minLength={2} maxLength={160} value={packageName} onChange={(e) => setPackageName(e.target.value)} />
        </Field>
      </div>

      {rental ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="r-monthly" label="Mensualidad (MXN)">
            <Input id="r-monthly" inputMode="decimal" required value={monthly} onChange={(e) => setMonthly(e.target.value)} aria-invalid={monthly !== "" && monthlyCents === null} />
          </Field>
          <Field id="r-period" label="Periodicidad de cobro">
            <Select value={String(billingMonths)} onValueChange={(v) => setBillingMonths(Number(v) as BillingMonths)}>
              <SelectTrigger id="r-period" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {([1, 6, 12] as const).map((m) => (
                  <SelectItem key={m} value={String(m)}>{billingPeriodLabels[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="r-start" label="Fecha de inicio">
            <Input id="r-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field id="r-first" label="Primer cobro" hint="Si se deja vacío, el primer cobro es la fecha de inicio.">
            <Input id="r-first" type="date" value={firstDueDate} onChange={(e) => setFirstDueDate(e.target.value)} />
          </Field>
          <Field id="r-term" label="Plazo mínimo (meses)" hint="0 = sin plazo forzoso.">
            <Input id="r-term" type="number" min={0} max={120} inputMode="numeric" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
          </Field>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="p-total" label="Precio total (MXN)">
            <Input id="p-total" inputMode="decimal" required value={total} onChange={(e) => setTotal(e.target.value)} aria-invalid={total !== "" && totalCents === null} />
          </Field>
          <Field id="p-start" label="Fecha de compra">
            <Input id="p-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field id="p-due" label="Fecha límite del saldo (opcional)" hint="Se usa para los recordatorios de pago.">
            <Input id="p-due" type="date" value={balanceDueDate} onChange={(e) => setBalanceDueDate(e.target.value)} />
          </Field>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-mist px-4 py-3">
        <Label htmlFor="k-reminders" className="flex-col items-start gap-0.5">
          <span>Recordatorios por correo</span>
          <span className="text-xs font-normal text-muted-foreground">Avisos al cliente antes y después del vencimiento, y resumen diario al administrador.</span>
        </Label>
        <Switch id="k-reminders" checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
      </div>

      <Field id="k-notes" label="Notas internas (opcional)">
        <Textarea id="k-notes" rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      {mutation.error && <ErrorState error={mutation.error} />}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="brand" disabled={!ready || mutation.isPending}>
          {mutation.isPending && <Loader2 className="animate-spin" data-icon="inline-start" />} Registrar {rental ? "renta" : "compra"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ClientPicker({ selected, onSelect }: { selected: AdminClientRow | null; onSelect: (client: AdminClientRow | null) => void }) {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isFetching, error } = useQuery({
    queryKey: ["admin", "clients", "picker", q],
    queryFn: () => adminApi.get<Paged<AdminClientRow>>("/admin/clients", { q, pageSize: 6 }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input type="search" placeholder="Buscar por nombre, empresa o correo" aria-label="Buscar cliente" className="h-10 pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        {isFetching && <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />}
      </div>
      {error && <ErrorState error={error} />}
      <ul className="max-h-52 divide-y divide-border overflow-y-auto rounded-xl border border-border" role="listbox" aria-label="Clientes">
        {data?.items.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">Sin resultados. Puedes registrar un cliente nuevo.</li>}
        {data?.items.map((c) => {
          const isSelected = selected?.id === c.id;
          return (
            <li key={c.id} role="option" aria-selected={isSelected}>
              <button
                type="button"
                onClick={() => onSelect(isSelected ? null : c)}
                className={cn("flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors", isSelected ? "bg-sky" : "hover:bg-mist")}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{c.name}{c.company ? ` · ${c.company}` : ""}</span>
                  <span className="block truncate text-xs text-muted-foreground">{c.email}</span>
                </span>
                {isSelected && <Check className="size-4 shrink-0 text-royal" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
      {selected && (
        <p className="text-xs text-foreground-secondary">
          Seleccionado: <span className="font-medium">{selected.name}</span> ({selected.email})
        </p>
      )}
    </div>
  );
}
