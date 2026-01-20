'use client'
import { useRouter } from 'next/navigation'
import React, { useLayoutEffect } from 'react'

export default function LoadingScreenPage() {
  const token = "";
  const router = useRouter()

  useLayoutEffect(() => {
    if (token === null) {
      return router.replace('/auth/login')
    } else {
      return router.replace('/dashboard')
    }
  }, [])


  return <div />
}