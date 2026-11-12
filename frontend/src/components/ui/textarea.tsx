import React from 'react'
import { cn } from '../../lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  onEnterSubmit?: () => void
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, onEnterSubmit, onKeyDown, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Modern Web Guidance: IME-safe enter submit check
      if (e.nativeEvent.isComposing) {
        return
      }

      if (e.key === 'Enter' && !e.shiftKey && onEnterSubmit) {
        e.preventDefault()
        onEnterSubmit()
      }

      onKeyDown?.(e)
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full px-4 py-3 rounded-2xl text-sm bg-slate-900/80 border text-slate-100 placeholder:text-slate-500',
            'transition-colors duration-150 resize-y min-h-[90px]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            error
              ? 'border-rose-500/60 focus:ring-rose-500 focus:border-rose-500'
              : 'border-slate-800 hover:border-slate-700',
            'disabled:opacity-50 disabled:bg-slate-950',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
