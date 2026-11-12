import React, { useState } from 'react'
import type { Budget, ShoppingBrief } from '../../types/brief'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Sparkles,
  ArrowRight,
  Plus,
  Tag,
  Check,
  Sliders,
  ShieldCheck,
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
  const [budgetCurrency, setBudgetCurrency] = useState(brief.budget?.currency || 'USD')
  const [budgetMode, setBudgetMode] = useState<'hard_limit' | 'target'>(
    brief.budget?.mode || 'hard_limit'
  )

  const [mustHave, setMustHave] = useState<string[]>(brief.must_have || [])
  const [newMustHave, setNewMustHave] = useState('')

  const [preferences, setPreferences] = useState<string[]>(brief.preferences || [])
  const [newPreference, setNewPreference] = useState('')

  const [exclusions, setExclusions] = useState<string[]>(brief.exclusions || [])
  const [newExclusion, setNewExclusion] = useState('')

  const [preferredBrands, setPreferredBrands] = useState<string[]>(brief.preferred_brands || [])
  const [newBrand, setNewBrand] = useState('')

  const [savedSuccess, setSavedSuccess] = useState(false)

  // Add tag handlers
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
      preferred_brands: preferredBrands,
    })

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              Verified Shopping Brief
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Review and Refine Your Criteria
            </h1>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onProceed}
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="w-full sm:w-auto shadow-lg shadow-indigo-600/30"
          >
            Find My Best Options
          </Button>
        </div>

        {/* Original Query Display */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Original Request
          </span>
          <p className="text-sm sm:text-base text-slate-200 font-medium italic">
            "{brief.original_query}"
          </p>
        </div>
      </div>

      {/* Editable Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category & Budget Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Tag className="h-4 w-4 text-indigo-400" />
            <h2 className="font-semibold text-white text-base">Category & Budget</h2>
          </div>

          <Input
            label="Product Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
            hint="Targeted product classification for catalog search"
          />

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Budget Constraint
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="relative sm:col-span-2">
                <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="150.00"
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-sm bg-slate-900/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={budgetCurrency}
                onChange={(e) => setBudgetCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-slate-900/80 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="budgetMode"
                  checked={budgetMode === 'hard_limit'}
                  onChange={() => setBudgetMode('hard_limit')}
                  className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
                <span>Hard Limit (Must not exceed)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="budgetMode"
                  checked={budgetMode === 'target'}
                  onChange={() => setBudgetMode('target')}
                  className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
                <span>Target Guidance (Flexible)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Intended Use Cases */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="h-4 w-4 text-violet-400" />
            <h2 className="font-semibold text-white text-base">Intended Use Cases</h2>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {useCases.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No specific use cases added yet.</span>
            ) : (
              useCases.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="brand"
                  size="md"
                  onRemove={() => handleRemoveTag(useCases, setUseCases, idx)}
                >
                  {tag}
                </Badge>
              ))
            )}
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
              placeholder="Add use case (e.g. Travel, Gym, Office)..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Must-Have Features (Non-negotiable) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="font-semibold text-white text-base">Must-Have Features</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Non-negotiable</span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {mustHave.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No must-have requirements added.</span>
            ) : (
              mustHave.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="success"
                  size="md"
                  onRemove={() => handleRemoveTag(mustHave, setMustHave, idx)}
                >
                  {tag}
                </Badge>
              ))
            )}
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
              placeholder="e.g. Active Noise Cancellation, Bluetooth 5.3..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Preferences (Nice-to-have) */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <h2 className="font-semibold text-white text-base">Secondary Preferences</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Nice-to-have</span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {preferences.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No optional preferences listed.</span>
            ) : (
              preferences.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="neutral"
                  size="md"
                  onRemove={() => handleRemoveTag(preferences, setPreferences, idx)}
                >
                  {tag}
                </Badge>
              ))
            )}
          </div>

          <div className="flex gap-2">
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
              placeholder="e.g. Foldable design, multipoint pairing..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Exclusions & Dealbreakers */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-semibold text-white text-base">Exclusions & Dealbreakers</h2>
            <span className="text-[10px] font-mono text-rose-400 uppercase">Avoid</span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {exclusions.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No exclusions specified.</span>
            ) : (
              exclusions.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="danger"
                  size="md"
                  onRemove={() => handleRemoveTag(exclusions, setExclusions, idx)}
                >
                  {tag}
                </Badge>
              ))
            )}
          </div>

          <div className="flex gap-2">
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
              placeholder="e.g. Heavy over-ear models, micro-USB..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Preferred Brands */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-semibold text-white text-base">Preferred Brands</h2>
            <span className="text-[10px] font-mono text-indigo-400 uppercase">Affinities</span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {preferredBrands.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No specific brands preferred.</span>
            ) : (
              preferredBrands.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="brand"
                  size="md"
                  onRemove={() => handleRemoveTag(preferredBrands, setPreferredBrands, idx)}
                >
                  {tag}
                </Badge>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag(preferredBrands, setPreferredBrands, newBrand, setNewBrand)
                }
              }}
              placeholder="e.g. Sony, Bose, Sennheiser, Anker..."
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900/80 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddTag(preferredBrands, setPreferredBrands, newBrand, setNewBrand)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Save & Proceed Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={savedSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : undefined}
          >
            {savedSuccess ? 'Brief Saved' : 'Save Changes'}
          </Button>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-medium">Changes synced to backend</span>
          )}
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onProceed}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Find My Best Options
        </Button>
      </div>
    </div>
  )
}
