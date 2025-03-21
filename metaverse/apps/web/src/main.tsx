import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById('root')!).render(
  <>
    <Toaster />
    <App />
  </>,
)
