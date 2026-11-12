import React, { useState } from 'react'
import type { Budget, ShoppingBrief } from '../../types/brief'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  ArrowRight,
  Plus,
  Tag,
  Check,
  CheckCircle2,
  X,
  Heart,
  Target,
} from 'lucide-react'

export interface BriefEditorProps {
  brief: ShoppingBrief
  onSave: (updated: Partial<ShoppingBrief>) => Promise<void>
  onProceed: () => void
  isSaving?: boolean
}

export const BriefEditor: React.FC<BriefEditorProps> = ({
  brief,
  onSave,
  onProceed,
  isSaving = false,
}) => {
  const [category, setCategory] = useState(brief.category || '')
  const [useCases, setUseCases] = useState<string[]>(brief.use_cases || [])
  const [newUseCase, setNewUseCase] = useState('')

  const [budgetAmount, setBudgetAmount] = useState<string>(
    brief.budget ? String(brief.budget.amount) : ''
  )
  const budgetCurrency = brief.budget?.currency || 'USD'
  const [budgetMode, setBudgetMode] = useState<'hard_limit' | 'target'>(
    brief.budget?.mode || 'hard_limit'
  )

  const [mustHave, setMustHave] = useState<string[]>(brief.must_have || [])
  const [newMustHave, setNewMustHave] = useState('')

  const [preferences, setPreferences] = useState<string[]>(brief.preferences || [])
  const [newPreference, setNewPreference] = useState('')

  const [exclusions, setExclusions] = useState<string[]>(brief.exclusions || [])
  const [newExclusion, setNewExclusion] = useState('')

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleAddTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmed = value.trim()
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed])
      setValue('')
    }
  }

  const handleRemoveTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    let budget: Budget | null = null
    const numericAmount = parseFloat(budgetAmount)
    if (!isNaN(numericAmount) && numericAmount > 0) {
      budget = {
        amount: numericAmount,
        currency: budgetCurrency,
        mode: budgetMode,
      }
    }

    await onSave({
      category: category.trim() || null,
      use_cases: useCases,
      budget,
      must_have: mustHave,
      preferences,
      exclusions,
    })

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Shopping Criteria
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Review & Refine Criteria
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Fine-tune your constraints before BuyNexa searches and ranks matching products.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onProceed}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="w-full sm:w-auto shadow-md"
          >
            Find Matching Products
          </Button>
        </div>

        {/* Original Query Recap */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Your Initial Request
          </span>
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            "{brief.original_query}"
          </p>
        </div>
      </div>

      {/* Criteria Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category & Budget Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
            <Tag className="h-4 w-4 text-indigo-400" />
            <h2 className="font-semibold text-white text-sm">Product Category</h2>
          </div>

          <Input
            label="Identified Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Wireless noise-cancelling headphones"
          />

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-medium text-slate-300">
              Budget & Limit
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">
                  $
                </span>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <select
                value={budgetMode}
                onChange={(e) => setBudgetMode(e.target.value as 'hard_limit' | 'target')}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="hard_limit">Hard Limit (Max)</option>
                <option value="target">Target Budget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
            <Target className="h-4 w-4 text-violet-400" />
            <h2 className="font-semibold text-white text-sm">Intended Use Cases</h2>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[44px]">
            {useCases.map((uc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-xs text-slate-200"
              >
                <span>{uc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(useCases, setUseCases, idx)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newUseCase}
              onChange={(e) => setNewUseCase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag(useCases, setUseCases, newUseCase, setNewUseCase)
                }
              }}
              placeholder="Add use case (e.g. Travel, Gym, Calls)..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddTag(useCases, setUseCases, newUseCase, setNewUseCase)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Must-Haves */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h2 className="font-semibold text-white text-sm">Must-Have Features</h2>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[44px]">
            {mustHave.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium"
              >
                <span>✓ {item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(mustHave, setMustHave, idx)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMustHave}
              onChange={(e) => setNewMustHave(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag(mustHave, setMustHave, newMustHave, setNewMustHave)
                }
              }}
              placeholder="Add required feature..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddTag(mustHave, setMustHave, newMustHave, setNewMustHave)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Preferences & Exclusions */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
            <Heart className="h-4 w-4 text-indigo-400" />
            <h2 className="font-semibold text-white text-sm">Preferences & Exclusions</h2>
          </div>

          {/* Preferences */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Preferences (Nice to have):</span>
            <div className="flex flex-wrap gap-1.5">
              {preferences.map((pref, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300"
                >
                  <span>{pref}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(preferences, setPreferences, idx)}
                    className="hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(preferences, setPreferences, newPreference, setNewPreference)
                  }
                }}
                placeholder="Add preference (e.g. Lightweight, USB-C)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddTag(preferences, setPreferences, newPreference, setNewPreference)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Exclusions */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium">Exclusions (Dealbreakers):</span>
            <div className="flex flex-wrap gap-1.5">
              {exclusions.map((exc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300"
                >
                  <span>✕ {exc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(exclusions, setExclusions, idx)}
                    className="hover:text-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag(exclusions, setExclusions, newExclusion, setNewExclusion)
                  }
                }}
                placeholder="Add exclusion to avoid..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddTag(exclusions, setExclusions, newExclusion, setNewExclusion)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <span className="text-xs text-slate-400">
          {savedSuccess ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="h-4 w-4" /> Criteria saved successfully
            </span>
          ) : (
            'Updates will apply to your product recommendations'
          )}
        </span>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Updates
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onProceed}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Find Products
          </Button>
        </div>
      </div>
    </div>
  )
}
