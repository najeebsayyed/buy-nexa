import React from 'react'
import { ShieldCheck, Sparkles, Info } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-auto py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
        {/* Sandbox Notice Banner */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-amber-200">
                Sandbox Demo — No real money and no fulfilment
              </p>
              <p className="text-amber-300/70 text-[11px] mt-0.5">
                Product discovery searches external Channel3 merchant listings with live links. PayPal checkout captures simulated payments solely for BuyNexa Demo Store items.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
            PayPal AI Hackathon 2026
          </span>
        </div>

        {/* Footer Navigation & Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4 border-b border-slate-900">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>BuyNexa AI Commerce</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              An agentic shopping copilot transforming natural language requirements into structured briefs, grounded retailer discovery, and verified payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-2">Architectural Boundaries</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Discovery via Channel3 API (external links)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Server-side PayPal Orders v2 capture
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                Deterministic Python scoring & ranking
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-2">Trust & Grounding</h4>
            <div className="space-y-2 text-slate-400 text-xs leading-relaxed">
              <p>
                Missing attributes are marked <span className="text-slate-200 font-mono text-[11px]">“Not listed”</span>. Recommendations never fabricate reviews or availability.
              </p>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zero client-side payment tampering</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 BuyNexa Project. Built with React, Vite, FastAPI, OpenAI, Channel3, and PayPal Sandbox.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Apache 2.0 / MIT</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Privacy & Data Handling</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
