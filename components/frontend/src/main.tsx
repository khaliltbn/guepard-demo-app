import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './contexts/CartContext'
import { ThemeProvider } from './contexts/ThemeContext.tsx'


const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
        <QueryClientProvider client={queryClient}>
            <CartProvider>
                <App />
            </CartProvider>
        </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)