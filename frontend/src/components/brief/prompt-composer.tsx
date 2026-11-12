import React, { useState } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react'

export interface PromptComposerProps {
  onSubmit: (prompt: string) => void
  isLoading?: boolean
  initialPrompt?: string
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Headphones for travel',
    prompt: 'Comfortable wireless noise-cancelling headphones under $150 for travel and office calls',
    tag: 'Audio',
  },
  {
    title: 'Programming laptop',
    prompt: 'Lightweight laptop for programming under $1,000 with at least 16GB RAM and long battery life',
    tag: 'Computing',
  },
  {
    title: 'Compact 4K monitor',
    prompt: 'Ergonomic 27-inch 4K monitor with USB-C power delivery for a small desk setup under $400',
    tag: 'Display',
  },
  {
    title: 'Gifts for frequent travellers',
    prompt: 'Durable, practical travel accessories or tech gifts under $75 for frequent business flyers',
    tag: 'Gifts',
  },
]

export const PromptComposer: React.FC<PromptComposerProps> = ({
  onSubmit,
  isLoading = false,
  initialPrompt = '',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = prompt.trim()
    if (!trimmed) {
      setValidationError('Please describe what you are looking for before submitting.')
      return
    }
    if (trimmed.length < 5) {
      setValidationError('Please provide a little more detail (at least 5 characters).')
      return
    }
    setValidationError(null)
    onSubmit(trimmed)
  }

  const handleSelectExample = (examplePrompt: string) => {
    setPrompt(examplePrompt)
    setValidationError(null)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Composer Card */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-3xl border border-slate-700/80 bg-slate-900/90 p-3 sm:p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur-md focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-200"
      >
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              if (validationError) setValidationError(null)
            }}
            onEnterSubmit={handleSubmit}
            disabled={isLoading}
            placeholder="Describe what you need, your budget, preferred brands, or must-haves... (e.g. Wireless noise-cancelling headphones under $150 for travel)"
            className="w-full bg-transparent border-0 text-slate-100 placeholder:text-slate-500 text-base sm:text-lg focus:ring-0 resize-none min-h-[110px] p-2 leading-relaxed"
            rows={3}
            aria-label="Shopping requirements prompt"
          />
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500">
              <CornerDownLeft className="h-3 w-3" /> Press Enter to submit
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="px-6 py-2.5 font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30"
            >
              {isLoading ? 'Analyzing Requirements...' : 'Create Shopping Brief'}
            </Button>
          </div>
        </div>
      </form>

      {validationError && (
        <p className="text-xs text-rose-400 font-medium text-center animate-fade-in" role="alert">
          {validationError}
        </p>
      )}

      {/* Example Prompt Chips */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Try an example prompt:
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click to populate
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EXAMPLE_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectExample(item.prompt)}
              className="group text-left p-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-850 hover:border-slate-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300 transition-colors">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                "{item.prompt}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
