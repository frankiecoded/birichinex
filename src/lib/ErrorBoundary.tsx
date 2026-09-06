import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[BirichiNex] render error:", error, info.componentStack);
    try {
      fetch("/api/error-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: info.componentStack,
          href: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => undefined);
    } catch {
      /* best-effort */
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-night p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path strokeLinecap="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <h1 className="text-subhead font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-caption text-zinc-400 leading-relaxed mb-1">
            We hit an unexpected error. Your data is safe.
          </p>
          <p className="font-mono text-[11px] text-brand/80 break-all mb-5">{this.state.error.message}</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full rounded-xl bg-brand text-night text-button font-semibold py-3 hover:bg-brand-light transition-colors"
          >
            Reload app
          </button>
        </div>
      </div>
    );
  }
}

export function installGlobalErrorCapture() {
  const overlay = (message: string) => {
    let el = document.getElementById("bnx-global-error");
    if (!el) {
      el = document.createElement("div");
      el.id = "bnx-global-error";
      el.style.cssText =
        "position:fixed;left:12px;right:12px;bottom:84px;z-index:2147483647;background:#160a0f;color:#ffd27d;" +
        "border:1px solid rgba(212,175,55,.35);border-radius:14px;padding:12px 14px;font:12px/1.45 monospace;" +
        "white-space:pre-wrap;word-break:break-word;box-shadow:0 8px 24px rgba(0,0,0,.5)";
      document.body.appendChild(el);
    }
    const stamp = new Date().toLocaleTimeString();
    el.textContent = `[${stamp}] ${message}\n\n${el.textContent ?? ""}`.slice(0, 4000);
    el.style.display = "block";
  };

  const safe = typeof window !== "undefined";
  if (!safe) return;

  window.addEventListener("error", (e) => {
    const msg = e.message || (e.error instanceof Error ? e.error.message : "Unknown error");
    try {
      fetch("/api/error-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          stack: e.error instanceof Error ? e.error.stack : undefined,
          filename: String(e.filename ?? ""),
          lineno: e.lineno,
          href: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => undefined);
    } catch {
      /* best-effort */
    }
    overlay(msg);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const msg = e.reason instanceof Error ? e.reason.message : String(e.reason ?? "Unhandled rejection");
    overlay(msg);
  });
}