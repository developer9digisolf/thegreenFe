import React, { lazy } from 'react'
const Login = lazy(() => import('@afx/views/login/index.layout'))

export default async function LoginScreenPage() {
  return <Login />
}