import { useCallback, useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { probeSync, type SyncHealth } from "../../lib/sync";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const COPY: Record<SyncHealth["state"], { label: string; hint: string }> = {
  ok: {
    label: "Live",
    hint: "Your shop's data is backed up to the cloud and restored on any device you sign in on.",
  },
  disabled: {
    label: "Disabled",
    hint: "Cloud backup is switched off for this environment. Your data stays on this device.",
  },
  offline: {
    label: "Offline",
    hint: "Cloud backup could not be reached from this browser.",
  },
  error: {
    label: "Needs attention",
    hint: "Cloud backup is set up but can't reach the database right now. Your data still works on this device, but it will not sync until the storage connection is restored.",
  },
};

export default function CloudStorageCard() {
  const [health, setHealth] = useState<SyncHealth | null>(null);

  const check = useCallback(() => {
    setHealth(null);
    void probeSync().then(setHealth);
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const state = health?.state ?? "ok";
  const copy = COPY[state];

  return (
    <div className="p-3 rounded-[12px] bg-surface/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {health && state !== "ok" ? (
            <CloudOff className="h-4 w-4 text-ink-secondary shrink-0" strokeWidth={1.5} />
          ) : health?.state === "ok" ? (
            <ShieldCheck className="h-4 w-4 text-success shrink-0" strokeWidth={1.5} />
          ) : (
            <Cloud className="h-4 w-4 text-ink-tertiary shrink-0" strokeWidth={1.5} />
          )}
          <p className="text-subhead font-semibold text-ink">Cloud backup</p>
          {health && (
            <Badge
              variant={state === "ok" ? "success" : state === "error" ? "error" : "default"}
              size="sm"
            >
              {copy.label}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
          onClick={check}
        >
          Check
        </Button>
      </div>
      <p className="text-caption text-ink-tertiary mt-1.5">{copy.hint}</p>
      {health?.state === "error" && (
        <div className="mt-2 flex items-start gap-1.5 rounded-[10px] bg-amber-500/10 border border-amber-500/20 p-2.5">
          <TriangleAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-[11px] text-ink-secondary leading-snug">
            To restore syncing, the storage project must be reconnected (or recreated) and the
            connection details updated on the server. Your data remains safe on this device in the
            meantime.
          </p>
        </div>
      )}
    </div>
  );
}