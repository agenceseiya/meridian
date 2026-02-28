"use client";

import { use } from "react";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ThreatBadge } from "@/components/shared/threat-badge";
import { TimeAgo } from "@/components/shared/time-ago";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: brief, isLoading } = useSWR(`/api/briefs/${id}`, fetcher);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#f97316]" />
      </div>
    );
  }

  if (!brief || brief.error) {
    return (
      <div className="text-center py-12">
        <p className="text-[#ef4444]">Brief not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/briefs"
        className="inline-flex items-center gap-1 text-xs text-[#94a3b8] hover:text-white mb-4"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to briefs
      </Link>

      <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f97316]/10 text-[#f97316] uppercase tracking-wider font-semibold">
            {brief.type}
          </span>
          {brief.threatAssessment?.overall && (
            <ThreatBadge level={String(brief.threatAssessment.overall)} size="md" />
          )}
          <TimeAgo date={brief.createdAt} />
        </div>

        <h1 className="text-xl font-bold text-white mb-4">{brief.title}</h1>

        {/* Executive summary highlight */}
        <div className="bg-[#0a0f1a] border-l-2 border-[#f97316] p-4 rounded-r-lg mb-6">
          <p className="text-[10px] text-[#f97316] uppercase tracking-wider mb-1 font-semibold">
            Executive Summary
          </p>
          <p className="text-sm text-[#e2e8f0]">{brief.executiveSummary}</p>
        </div>

        {/* Full brief content */}
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-[#e2e8f0] prose-p:text-[#cbd5e1] prose-strong:text-white prose-ul:text-[#cbd5e1] prose-li:text-[#cbd5e1]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {brief.fullContent}
          </ReactMarkdown>
        </div>

        {/* Meta */}
        <div className="border-t border-[#1e293b] mt-6 pt-4 flex items-center gap-4 text-xs text-[#64748b]">
          <span>Model: {brief.modelUsed}</span>
          <span>Tokens: {brief.promptTokens} in / {brief.outputTokens} out</span>
        </div>
      </div>
    </div>
  );
}
