import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-paper hover:bg-accent-strong disabled:opacity-50',
  secondary: 'border border-rule-strong text-ink hover:border-accent hover:text-accent disabled:opacity-50',
  ghost: 'text-ink-muted hover:text-ink disabled:opacity-50',
  danger: 'text-status-danger/80 hover:text-status-danger disabled:opacity-50',
}

/** Shared with any non-<button> element (e.g. a react-router Link) that needs the same look. */
export function buttonClass(variant: ButtonVariant = 'primary', className = ''): string {
  return `rounded-md px-4 py-2 text-sm font-medium transition-colors ${VARIANT_CLASS[variant]} ${className}`
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />
}
