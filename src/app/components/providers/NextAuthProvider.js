// src/app/components/providers/NextAuthProvider.js
'use client'
import { SessionProvider } from 'next-auth/react'

export function NextAuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}