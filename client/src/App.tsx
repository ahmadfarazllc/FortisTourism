import { Routes, Route } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Pages
import LandingPage from './pages/LandingPage'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

// Components
import Navigation from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './contexts/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" component={LandingPage} />
              <Route path="/checkout/:destinationId" component={Checkout} />
              <Route 
                path="/dashboard" 
                component={() => (
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                )} 
              />
              <Route 
                path="/admin" 
                component={() => (
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                )} 
              />
            </Routes>
          </main>
          <Toaster />
        </div>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App