import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...classNames: ClassValue[]) {
  return twMerge(clsx(classNames))
}
