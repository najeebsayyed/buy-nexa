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
    title: 'Travel Headphones',
    prompt: 'Comfortable wireless noise-cancelling headphones under $150 for travel and office calls',
    tag: 'Audio',
  },
  {
    title: 'Developer Laptop',
    prompt: 'Lightweight laptop for programming under $1,000 with at least 16GB RAM and long battery life',
    tag: 'Computing',
  },
  {
    title: 'Ergonomic 4K Monitor',
    prompt: 'Ergonomic 27-inch 4K monitor with USB-C power delivery for a small desk setup under $400',
    tag: 'Workspace',
  },
  {
    title: 'Frequent Flyer Essentials',
    prompt: 'Durable, practical travel accessories or tech gifts under $75 for frequent business flyers',
    tag: 'Travel',
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
      setValidationError('Please describe what you are looking for before searching.')
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
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-xl backdrop-blur-md focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all duration-200"
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
            placeholder="Tell us what you're looking for, budget, must-haves, or intended use... (e.g. Wireless noise-cancelling headphones under $150 for travel)"
            className="w-full bg-transparent border-0 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base focus:ring-0 resize-none min-h-[96px] p-2 leading-relaxed"
            rows={3}
            aria-label="Shopping requirements prompt"
          />
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
              <CornerDownLeft className="h-3 w-3" /> Press Enter to search
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="px-5 py-2 font-medium text-xs sm:text-sm rounded-xl shadow-md"
            >
              {isLoading ? 'Analyzing Requirements...' : 'Find Products'}
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
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-medium text-slate-400 flex items-center gap-1.5 text-xs">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            Suggested requests:
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Click to fill
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectExample(item.prompt)}
              className="group text-left p-3 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-850 hover:border-slate-700/80 transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 flex flex-col justify-between gap-1"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 group-hover:bg-slate-750 group-hover:text-slate-300 transition-colors">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                "{item.prompt}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
