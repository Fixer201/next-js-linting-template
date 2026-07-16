'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ErrorPageProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center p-8">
      <h1 className="mb-4 text-3xl font-medium tracking-tight text-text-h">Something went wrong</h1>
      <p className="mb-6 text-text">
        The request could not be completed. Check the server logs and database configuration.
      </p>
      <button
        className={cn(
          'w-fit rounded-lg bg-accent px-4 py-2 font-medium text-white transition-opacity',
          'hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        )}
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  )
}
