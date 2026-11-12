import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface RouteMatch {
  name:
    | 'home'
    | 'brief_review'
    | 'search_results'
    | 'compare'
    | 'demo_store'
    | 'cart'
    | 'checkout'
    | 'order_confirmation'
    | 'not_found'
  params: Record<string, string>
  path: string
}

interface RouterContextType {
  currentRoute: RouteMatch
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterContextType | null>(null)

export function matchRoute(pathname: string): RouteMatch {
  // 1. Home: /
  if (pathname === '/' || pathname === '') {
    return { name: 'home', params: {}, path: pathname }
  }

  // 2. Search Results: /search/:briefId/results
  const resultsMatch = pathname.match(/^\/search\/([^/]+)\/results\/?$/)
  if (resultsMatch) {
    return {
      name: 'search_results',
      params: { briefId: resultsMatch[1] },
      path: pathname,
    }
  }

  // 3. Brief Review: /search/:briefId
  const briefMatch = pathname.match(/^\/search\/([^/]+)\/?$/)
  if (briefMatch) {
    return {
      name: 'brief_review',
      params: { briefId: briefMatch[1] },
      path: pathname,
    }
  }

  // 4. Compare: /compare
  if (pathname === '/compare' || pathname === '/compare/') {
    return { name: 'compare', params: {}, path: pathname }
  }

  // 5. Demo Store: /demo-store
  if (pathname === '/demo-store' || pathname === '/demo-store/') {
    return { name: 'demo_store', params: {}, path: pathname }
  }

  // 6. Cart: /cart
  if (pathname === '/cart' || pathname === '/cart/') {
    return { name: 'cart', params: {}, path: pathname }
  }

  // 7. Checkout: /checkout
  if (pathname === '/checkout' || pathname === '/checkout/') {
    return { name: 'checkout', params: {}, path: pathname }
  }

  // 8. Order Confirmation: /orders/:orderId
  const orderMatch = pathname.match(/^\/orders\/([^/]+)\/?$/)
  if (orderMatch) {
    return {
      name: 'order_confirmation',
      params: { orderId: orderMatch[1] },
      path: pathname,
    }
  }

  return { name: 'not_found', params: {}, path: pathname }
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<RouteMatch>(() =>
    matchRoute(window.location.pathname)
  )

  const navigate = useCallback((path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState(null, '', path)
      setCurrentRoute(matchRoute(path))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(matchRoute(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return context
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
}

export const Link: React.FC<LinkProps> = ({ to, onClick, children, className, ...props }) => {
  const { navigate, currentRoute } = useRouter()
  const isActive = currentRoute.path === to

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e)
    }
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault()
      navigate(to)
    }
  }

  return (
    <a
      href={to}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}
