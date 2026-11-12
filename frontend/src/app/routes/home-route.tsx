import React, { useState } from 'react'
import { useRouter } from '../router'
import { PromptComposer } from '../../components/brief/prompt-composer'
import { apiClient, ApiError } from '../../lib/api-client'
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export const HomeRoute: React.FC = () => {
  const { navigate } = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loadingMessages = [
    'Understanding your shopping requirements...',
    'Extracting budget constraints and preferences...',
    'Structuring your verifiable shopping brief...',
  ]

  const handlePromptSubmit = async (promptText: string) => {
    setLoading(true)
    setError(null)
    setLoadingStep(0)

    // Interval to cycle progressive status messages
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
    }, 1200)

    try {
      const brief = await apiClient.briefs.create({ query: promptText })
      clearInterval(stepInterval)
      navigate(`/search/${brief.id}`)
    } catch (err) {
      clearInterval(stepInterval)
      if (err instanceof ApiError) {
        setError(`Unable to extract brief (${err.code}): ${err.message}`)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while processing your shopping request.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="space-y-20 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-sm animate-fade-in select-none">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>PayPal AI Hackathon 2026 — Agentic Commerce</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Shop by what you need, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300">
            not just what you search.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Tell BuyNexa your requirements, constraints, and budget. Our copilot structures your brief, finds verified products, and never invents missing specifications.
        </p>

        {/* Prompt Composer */}
        <div className="pt-4">
          <PromptComposer onSubmit={handlePromptSubmit} isLoading={loading} />
        </div>

        {/* Active Brief Extraction Loading State */}
        {loading && (
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-sm flex items-center justify-center gap-3 animate-pulse shadow-lg shadow-indigo-950/50">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            <span className="font-medium">{loadingMessages[loadingStep]}</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 text-left">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">Request Error</p>
              <p className="text-xs text-rose-300/80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            How BuyNexa Works
          </h2>
          <p className="text-sm text-slate-400">
            Three distinct steps connecting natural language intent to verified merchant listings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between gap-6 hover:border-slate-700/80 transition-colors">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-white">1. Describe what you need</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Describe your real-world use case in plain language. BuyNexa extracts budget caps, must-have features, brand affinities, and dealbreakers into an editable brief.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-indigo-400/80 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" /> OpenAI Structured Output
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between gap-6 hover:border-slate-700/80 transition-colors">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-white">2. Compare curated options</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We query merchant catalogs through Channel3. Recommendations are ranked using deterministic Python algorithms with clear evidence for every match.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-violet-400/80 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" /> Channel3 API Discovery
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between gap-6 hover:border-slate-700/80 transition-colors">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-white">3. Choose with confidence</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Click out directly to retailer stores, or test the companion PayPal Sandbox demo store where orders are created and captured with server-side validation.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-emerald-400/80 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> PayPal Orders v2 Sandbox
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Section */}
      <section className="max-w-4xl mx-auto rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-8 sm:p-10 shadow-xl backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              Trust, Grounding & Security Standards
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Engineered with strict separation of concerns for the PayPal AI Hackathon.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Zero Hallucinated Specifications
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a product attribute (such as battery life, impedance, or weight) is missing from the retailer feed, BuyNexa explicitly tags it as <span className="font-mono text-slate-300">“Not listed”</span>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-400" />
              Server-Authoritative Payments
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI never has payment authority. PayPal capture occurs strictly server-side in FastAPI after human customer approval via the official PayPal SDK.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-violet-400" />
              Direct Retailer Outbound Links
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Channel3 product listings link out directly to third-party merchant sites. Channel3 products are never mixed into the PayPal merchant cart.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Auditable Ranking Explanations
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recommendations pair a numeric fit score with verifiable matched criteria and transparent trade-off caveats based solely on returned catalog facts.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
