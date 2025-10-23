import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
// REMOVE Button and Settings imports if no longer needed elsewhere
// import { Button } from '@/components/ui/button';
// import { Settings } from 'lucide-react';

// Page Imports
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Control Panel Import
import { DemoControlPanel } from './components/DemoControlPanel';

// Context Providers
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';

const queryClient = new QueryClient();

const App = () => {
  const isDevelopment = import.meta.env.DEV;
  // State remains here to control the panel's position
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="relative min-h-screen">
              <BrowserRouter>
                <Routes>
                  {/* ... Your routes ... */}
                  <Route path="/" element={<Catalog />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>

              {/* Conditionally render the panel */}
              {isDevelopment && (
                <>
                  {/* 👇 REMOVED the separate Toggle Button */}

                  {/* The Control Panel container - Position and animation */}
                  <div
                  // 👇 DOUBLE-CHECK that overflow-visible is present here
                  className={`fixed bottom-0 right-0 top-0 z-40 transform transition-transform duration-300 ease-in-out overflow-visible ${
                    isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                  }`}
                  style={{ width: '450px' }}
                >
                    {/* 👇 Pass state and toggle function as props */}
                    <DemoControlPanel
                      isOpen={isPanelOpen}
                      onToggle={() => setIsPanelOpen(!isPanelOpen)}
                    />
                  </div>

                  {/* Optional Overlay */}
                  {isPanelOpen && (
                    <div
                      className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
                      onClick={() => setIsPanelOpen(false)}
                    ></div>
                  )}
                </>
              )}
            </div>
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;