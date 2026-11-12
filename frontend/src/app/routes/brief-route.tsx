import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from '../router'
import { BriefEditor } from '../../components/brief/brief-editor'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import { apiClient, ApiError } from '../../lib/api-client'
import type { ShoppingBrief } from '../../types/brief'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export const BriefRoute: React.FC<{ briefId: string }> = ({ briefId }) => {
  const { navigate } = useRouter()
  const [brief, setBrief] = useState<ShoppingBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBrief = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.briefs.get(briefId)
      setBrief(data)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Shopping brief not found or expired. Please create a new shopping request.')
        } else if (err.status === 403) {
          setError('Access to this shopping brief is unauthorized under the current anonymous session.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to load shopping brief. Ensure the backend is reachable.')
      }
    } finally {
      setLoading(false)
    }
  }, [briefId])

  useEffect(() => {
    fetchBrief()
  }, [fetchBrief])

  const handleSave = async (updated: Partial<ShoppingBrief>) => {
    setSaving(true)
    try {
      const saved = await apiClient.briefs.update(briefId, updated)
      setBrief(saved)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save brief updates')
    } finally {
      setSaving(false)
    }
  }

  const handleProceed = () => {
    navigate(`/search/${briefId}/results`)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (error || !brief) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Could not load brief</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={fetchBrief}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            New Search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <BriefEditor
        brief={brief}
        onSave={handleSave}
        onProceed={handleProceed}
        isSaving={saving}
      />
    </div>
  )
}
