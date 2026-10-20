"use client";

import { Loader2, RotateCcw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDateTime, StatusPill } from "../ui";

const statusLabels = { draft: "Borrador", published: "Vigente", superseded: "Anterior" } as const;

export interface HistoryEntry {
  id: string;
  version: number;
  status: "draft" | "published" | "superseded";
  createdBy: string;
  createdAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  restoredFromVersion?: number;
  notes?: string;
}

/** Lista de versiones con las acciones permitidas para cada estado. */
export function PriceHistory<T extends HistoryEntry>({
  entries,
  renderAmounts,
  canWrite,
  canPublish,
  pendingId,
  onPublish,
  onDiscard,
  onRestore,
}: {
  entries: T[];
  renderAmounts: (entry: T) => React.ReactNode;
  canWrite: boolean;
  canPublish: boolean;
  pendingId: string | null;
  onPublish: (entry: T) => void;
  onDiscard: (entry: T) => void;
  onRestore: (entry: T) => void;
}) {
  return (
    <ol className="space-y-3">
      {entries.map((entry) => {
        const busy = pendingId === entry.id;
        return (
          <li key={entry.id} className={cn("rounded-xl border p-4 text-sm", entry.status === "draft" ? "border-warning/40 bg-warning/5" : "border-border")}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                Versión {entry.version}
                {entry.restoredFromVersion && <span className="text-xs text-muted-foreground"> · restaurada de v{entry.restoredFromVersion}</span>}
              </span>
              <StatusPill status={entry.status} label={statusLabels[entry.status]} />
            </div>
            {renderAmounts(entry)}
            {entry.notes && <p className="mt-2 text-xs text-foreground-secondary">{entry.notes}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Creada por {entry.createdBy} · {formatDateTime(entry.createdAt)}
              {entry.publishedAt && ` · publicada por ${entry.publishedBy} el ${formatDateTime(entry.publishedAt)}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.status === "draft" && canPublish && (
                <Button size="sm" variant="brand" disabled={busy} onClick={() => onPublish(entry)}>
                  {busy ? <Loader2 className="animate-spin" /> : <Send />} Publicar
                </Button>
              )}
              {entry.status === "draft" && canWrite && (
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => onDiscard(entry)}>
                  <Trash2 /> Descartar
                </Button>
              )}
              {entry.status === "superseded" && canPublish && (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => onRestore(entry)}>
                  <RotateCcw /> Restaurar como versión nueva
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
