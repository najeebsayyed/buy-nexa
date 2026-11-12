import { RouterProvider, useRouter } from './app/router'
import { CartProvider } from './features/cart/cart-context'
import { ComparisonProvider } from './features/comparison/comparison-context'
import { AppShell } from './components/layout/app-shell'
import { HomeRoute } from './app/routes/home-route'
import { BriefRoute } from './app/routes/brief-route'
import { ResultsRoute } from './app/routes/results-route'
import { CompareRoute } from './app/routes/compare-route'
import { DemoStoreRoute } from './app/routes/demo-store-route'
import { CartRoute } from './app/routes/cart-route'
import { CheckoutRoute } from './app/routes/checkout-route'
import { OrderRoute } from './app/routes/order-route'
import { PrivacyRoute } from './app/routes/privacy-route'
import { TermsRoute } from './app/routes/terms-route'
import { Button } from './components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

function RouteContent() {
  const { currentRoute, navigate } = useRouter()

  switch (currentRoute.name) {
    case 'home':
      return <HomeRoute />
    case 'brief_review':
      return <BriefRoute briefId={currentRoute.params.briefId} />
    case 'search_results':
      return <ResultsRoute briefId={currentRoute.params.briefId} />
    case 'compare':
      return <CompareRoute />
    case 'demo_store':
      return <DemoStoreRoute />
    case 'cart':
      return <CartRoute />
    case 'checkout':
      return <CheckoutRoute />
    case 'order_confirmation':
      return <OrderRoute orderId={currentRoute.params.orderId} />
    case 'privacy':
      return <PrivacyRoute />
    case 'terms':
      return <TermsRoute />
    default:
      return (
        <div className="max-w-md mx-auto text-center py-20 space-y-4">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 w-fit mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            The requested screen does not exist or has been moved.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Home
          </Button>
        </div>
      )
  }
}

export function App() {
  return (
    <RouterProvider>
      <CartProvider>
        <ComparisonProvider>
          <AppShell>
            <RouteContent />
          </AppShell>
        </ComparisonProvider>
      </CartProvider>
    </RouterProvider>
  )
}

export default App
