import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CxOptions } from 'class-variance-authority'

export function cn(...classNames: CxOptions) {
  return twMerge(clsx(classNames))
}
