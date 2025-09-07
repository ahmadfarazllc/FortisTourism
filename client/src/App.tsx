import { Routes, Route } from 'wouter'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Pages
import LandingPage from './pages/LandingPage'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'

// Components
import Navigation from './components/Navigation'
import { Toaster } from './components/ui/toaster'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await fetch(queryKey[0] as string, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" component={LandingPage} />
            <Route path="/checkout/:destinationId" component={Checkout} />
            <Route path="/dashboard" component={Dashboard} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </QueryClientProvider>
  )
}

export default App