import React, { useEffect, useRef, useState } from 'react'
import { apiClient, ApiError } from '../../lib/api-client'
import { Loader2, AlertCircle } from 'lucide-react'

// Declare global PayPal types on window
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        createOrder: () => Promise<string>
        onApprove: (data: { orderID: string }) => Promise<void>
        onCancel?: () => void
        onError?: (err: unknown) => void
        style?: {
          layout?: 'vertical' | 'horizontal'
          color?: 'gold' | 'blue' | 'silver' | 'white' | 'black'
          shape?: 'rect' | 'pill'
          label?: 'paypal' | 'checkout' | 'buynow' | 'pay'
        }
      }) => {
        render: (container: HTMLElement | string) => Promise<void>
      }
    }
  }
}

export interface PayPalCheckoutButtonProps {
  cartId: string
  onSuccess: (orderId: string) => void
  onError?: (errorMessage: string) => void
}

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
  cartId,
  onSuccess,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sdkLoading, setSdkLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const activeLocalOrderIdRef = useRef<string | null>(null)

  const clientId =
    (import.meta as { env?: Record<string, string> }).env?.VITE_PAYPAL_CLIENT_ID || 'sb'

  useEffect(() => {
    let isMounted = true
    setSdkLoading(true)
    setErrorMessage(null)

    // Load PayPal JavaScript SDK script dynamically
    const scriptId = 'paypal-sdk-script'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null

    const initializeButtons = () => {
      if (!isMounted || !containerRef.current || !window.paypal) return
      containerRef.current.innerHTML = ''

      try {
        window.paypal
          .Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
            },
            createOrder: async () => {
              try {
                // Call FastAPI backend to create PayPal order server-side
                const res = await apiClient.payments.createPayPalOrder({ cart_id: cartId })
                activeLocalOrderIdRef.current = res.local_order_id
                return res.paypal_order_id
              } catch (err) {
                const msg =
                  err instanceof ApiError
                    ? `Order creation failed: ${err.message}`
                    : 'Failed to initiate PayPal order'
                setErrorMessage(msg)
                onError?.(msg)
                throw err
              }
            },
            onApprove: async (data) => {
              const localOrderId = activeLocalOrderIdRef.current
              if (!localOrderId) {
                const msg = 'Missing local order reference during capture.'
                setErrorMessage(msg)
                onError?.(msg)
                return
              }

              try {
                // Server-side capture verification
                const captureRes = await apiClient.payments.capturePayPalOrder(
                  localOrderId,
                  data.orderID
                )

                if (captureRes.status === 'COMPLETED') {
                  onSuccess(localOrderId)
                } else {
                  const msg = `Payment status is ${captureRes.status}. Please check order details.`
                  setErrorMessage(msg)
                  onError?.(msg)
                }
              } catch (err) {
                const msg =
                  err instanceof ApiError
                    ? `Payment capture failed: ${err.message}`
                    : 'Server error while capturing payment'
                setErrorMessage(msg)
                onError?.(msg)
              }
            },
            onCancel: () => {
              setErrorMessage('PayPal checkout was cancelled by the customer.')
            },
            onError: (err) => {
              const msg = 'An error occurred during the PayPal approval process.'
              setErrorMessage(msg)
              onError?.(msg)
              console.error('PayPal Buttons error:', err)
            },
          })
          .render(containerRef.current)
          .then(() => {
            if (isMounted) setSdkLoading(false)
          })
          .catch((err) => {
            if (isMounted) {
              setSdkLoading(false)
              setErrorMessage('Failed to render PayPal buttons.')
              console.error('Failed to render PayPal buttons:', err)
            }
          })
      } catch (err) {
        if (isMounted) {
          setSdkLoading(false)
          setErrorMessage('Could not initialize PayPal button component.')
          console.error(err)
        }
      }
    }

    if (window.paypal) {
      initializeButtons()
      return
    }

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`
      script.async = true
      script.onload = () => {
        initializeButtons()
      }
      script.onerror = () => {
        if (isMounted) {
          setSdkLoading(false)
          setErrorMessage('Failed to load PayPal JavaScript SDK. Check your internet connection.')
        }
      }
      document.body.appendChild(script)
    } else {
      existingScript.addEventListener('load', initializeButtons)
    }

    return () => {
      isMounted = false
    }
  }, [cartId, clientId, onSuccess, onError])

  return (
    <div className="w-full space-y-4">
      {sdkLoading && (
        <div className="flex items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span>Loading official PayPal Sandbox buttons...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div ref={containerRef} className="w-full min-h-[50px] relative z-10" />
    </div>
  )
}
