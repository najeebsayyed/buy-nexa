import { useEffect, useState, useCallback } from 'react'
import { apiClient, HealthLiveResponse, HealthReadyResponse } from './lib/api-client'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShoppingBag,
  Cpu,
  ShieldCheck,
  Server,
  Sparkles,
} from 'lucide-react'

export function App() {
  const [liveStatus, setLiveStatus] = useState<HealthLiveResponse | null>(null)
  const [readyStatus, setReadyStatus] = useState<HealthReadyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [live, ready] = await Promise.allSettled([
        apiClient.health.live(),
        apiClient.health.ready(),
      ])

      if (live.status === 'fulfilled') {
        setLiveStatus(live.value)
      } else {
        setLiveStatus(null)
      }

      if (ready.status === 'fulfilled') {
        setReadyStatus(ready.value)
      } else {
        setReadyStatus(null)
      }

      if (live.status === 'rejected' && ready.status === 'rejected') {
        setError('Backend API is currently unreachable. Ensure FastAPI server is running on port 8000.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error during health check')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    Promise.allSettled([apiClient.health.live(), apiClient.health.ready()])
      .then(([live, ready]) => {
        if (!isMounted) return
        if (live.status === 'fulfilled') setLiveStatus(live.value)
        if (ready.status === 'fulfilled') setReadyStatus(ready.value)
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Health check failed')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">BuyNexa</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Phase 1 MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={checkHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <div className="text-xs text-slate-400 hidden sm:block">
              PayPal AI Hackathon 2026
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            AI Shopping Copilot & Agentic Commerce
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Shop by what you need, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-300">
              not just what you search.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Tell BuyNexa what matters. Compare with confidence. Stay in control when you pay.
          </p>
        </div>

        {/* Development Status Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-400" />
                Backend Foundation & Connectivity
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Verifying FastAPI API endpoints and database readiness via Vite proxy (/api)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    liveStatus ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    liveStatus ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span className="text-xs font-medium text-slate-300">
                {liveStatus ? 'API Connected' : 'Checking API'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Liveness Status */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              {liveStatus ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">API Liveness Check</div>
                <div className="text-xs font-mono text-slate-400">GET /api/v1/health/live</div>
                <div className="text-xs text-slate-300 pt-1">
                  Status: {liveStatus?.status || (loading ? 'Checking...' : 'Offline')}
                </div>
              </div>
            </div>

            {/* Readiness Status */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              {readyStatus?.status === 'ok' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">Database Readiness Check</div>
                <div className="text-xs font-mono text-slate-400">GET /api/v1/health/ready</div>
                <div className="text-xs text-slate-300 pt-1">
                  Database: {readyStatus?.database || (loading ? 'Checking...' : 'Pending / Disconnected')}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Phase 1 Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">FastAPI Backend</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modular Python 3.12+ backend with async SQLAlchemy 2.x, Pydantic v2 validation, Alembic migrations, and OpenAI client adapter.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Anonymous Sessions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically random opaque tokens, hashed with SHA-256 in PostgreSQL, transmitted via secure HttpOnly SameSite=Lax cookies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Structured Intent Extraction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translates shopper prompts into typed Pydantic ShoppingBrief models with budget modes, must-haves, preferences, and exclusions.
            </p>
          </div>
        </div>

        {/* Sandbox Notice Banner */}
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-slate-400">
          <span className="font-semibold text-amber-400">Sandbox demo disclosure:</span> PayPal checkout in BuyNexa is exclusively for controlled demo catalog items. External Channel3 retailer listings link out to merchant stores. No real money or fulfilment.
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <p>BuyNexa &copy; 2026. Built for the PayPal AI Hackathon.</p>
      </footer>
    </div>
  )
}

export default App
