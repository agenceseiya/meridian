"use client";

import { useAlerts } from "@/hooks/use-events";
import { ThreatBadge } from "@/components/shared/threat-badge";
import { TimeAgo } from "@/components/shared/time-ago";
import { AlertTriangle, Bell, CheckCircle, Loader2 } from "lucide-react";

const severityColors: Record<string, string> = {
  info: "#3b82f6",
  warning: "#eab308",
  critical: "#ef4444",
  flash: "#dc2626",
};

export default function AlertsPage() {
  const { data, isLoading, mutate } = useAlerts();
  const alerts = data?.alerts || [];

  async function acknowledgeAlert(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "acknowledge" }),
    });
    mutate();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Alerts</h1>
        <span className="text-xs text-[#94a3b8]">
          {data?.activeCount || 0} active
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-[#111827] border border-[#1e293b] rounded-lg">
          <Bell className="w-12 h-12 text-[#1e293b] mx-auto" />
          <p className="text-[#94a3b8] mt-3">No active alerts</p>
          <p className="text-[#64748b] text-xs mt-1">
            Alerts are triggered by high-threat events and escalation patterns
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(
            (alert: {
              id: string;
              severity: string;
              title: string;
              description: string;
              triggerReason: string | null;
              isActive: boolean;
              createdAt: string;
            }) => (
              <div
                key={alert.id}
                className={`bg-[#111827] border rounded-lg p-4 ${
                  alert.severity === "flash"
                    ? "border-[#dc2626]/30 threat-pulse"
                    : alert.severity === "critical"
                      ? "border-[#ef4444]/30"
                      : "border-[#1e293b]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle
                        className="w-4 h-4"
                        style={{
                          color:
                            severityColors[alert.severity] || "#94a3b8",
                        }}
                      />
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold"
                        style={{
                          color:
                            severityColors[alert.severity] || "#94a3b8",
                          backgroundColor: `${severityColors[alert.severity] || "#94a3b8"}20`,
                        }}
                      >
                        {alert.severity}
                      </span>
                      <TimeAgo date={alert.createdAt} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-[#94a3b8] mt-1">
                      {alert.description}
                    </p>
                    {alert.triggerReason && (
                      <p className="text-[10px] text-[#64748b] mt-1 font-mono">
                        Trigger: {alert.triggerReason}
                      </p>
                    )}
                  </div>

                  {alert.isActive && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="p-2 rounded hover:bg-[#1e293b] transition-colors text-[#94a3b8] hover:text-[#22c55e]"
                      title="Acknowledge alert"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
