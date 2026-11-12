import React, { useState } from 'react'
import { useRouter } from '../router'
import { PromptComposer } from '../../components/brief/prompt-composer'
import { apiClient, ApiError } from '../../lib/api-client'
import {
  Sparkles,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  Compass,
} from 'lucide-react'

export const HomeRoute: React.FC = () => {
  const { navigate } = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const loadingMessages = [
    'Understanding your shopping requirements...',
    'Analyzing budget limits and feature preferences...',
    'Preparing your tailored shopping criteria...',
  ]

  const handlePromptSubmit = async (promptText: string) => {
    setLoading(true)
    setError(null)
    setLoadingStep(0)

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
        setError(`Unable to process request (${err.code}): ${err.message}`)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred while processing your shopping request.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium backdrop-blur-sm select-none">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Your AI Shopping Copilot</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
          Tell us what you need. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-300">
            Discover, compare and choose with confidence.
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Describe your real-world requirements, budget, and must-have features. BuyNexa structures your criteria, searches verified merchant options, and explains trade-offs with transparent evidence.
        </p>

        {/* Prompt Composer Box */}
        <div className="pt-2">
          <PromptComposer onSubmit={handlePromptSubmit} isLoading={loading} />
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="max-w-md mx-auto p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm flex items-center justify-center gap-3 animate-pulse shadow-md">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />
            <span className="font-medium">{loadingMessages[loadingStep]}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 text-left">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">Unable to Start Search</p>
              <p className="text-xs text-rose-300/80 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            How BuyNexa Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            A smarter, evidence-grounded approach to finding the right product online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex flex-col justify-between gap-6 hover:border-slate-700/80 transition-colors">
            <div className="space-y-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="text-base font-bold text-white">Describe Your Need</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your requirements in plain language. BuyNexa extracts budget caps, must-have specifications, intended use cases, and dealbreakers into a transparent criteria summary.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-medium text-indigo-400 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Tailored Requirements
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex flex-col justify-between gap-6 hover:border-slate-700/80 transition-colors">
            <div className="space-y-3">
              <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="text-base font-bold text-white">Curated Discovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We search product catalogs to locate options that genuinely fit. Every recommendation receives a transparent fit score with specific evidence explaining why it matches.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-medium text-violet-400 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" /> Evidence-Based Ranking
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex flex-col justify-between gap-6 hover:border-slate-700/80 transition-colors">
            <div className="space-y-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="text-base font-bold text-white">Compare & Decide</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare candidates side-by-side on exact specifications, trade-offs, and pricing. Link directly to original retailers or complete purchases via our integrated store.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" /> Side-by-Side Comparison
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Transparency Pillars */}
      <section className="max-w-5xl mx-auto rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 sm:p-10 shadow-lg backdrop-blur-sm space-y-6">
        <div className="border-b border-slate-800/80 pb-5">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            Designed for Trust and Clarity
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Shopping decisions should be backed by verified facts, not inflated marketing claims.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>No Invented Specifications</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If a product attribute (such as battery life or weight) is not stated in merchant data, BuyNexa explicitly identifies it as <span className="font-mono text-slate-300">“Not listed”</span>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Transparent Caveats</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every recommendation highlights trade-offs and missing features alongside matched strengths, helping you make balanced decisions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct Retailer Links</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discovered merchant offers link out directly to official retailer websites so you always purchase from verified sellers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Private & Anonymous</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No mandatory registration or personal tracking. Sessions are maintained securely and expired automatically.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
