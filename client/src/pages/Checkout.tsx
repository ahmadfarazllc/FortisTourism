import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { Calendar, Users, Phone, Mail, MessageSquare } from 'lucide-react'

import { apiRequest } from '../lib/queryClient'
import { useToast } from '../hooks/use-toast'
import type { SelectDestination } from '@shared/schema'

// Initialize Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null

interface CheckoutFormProps {
  destination: SelectDestination
  bookingDetails: {
    startDate: string
    endDate: string
    travelers: number
    contactEmail: string
    contactPhone: string
    specialRequests: string
  }
}

function CheckoutForm({ destination, bookingDetails }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Payment Successful",
          description: `Your booking for ${destination.name} has been confirmed!`,
        })
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-dark p-6 rounded-2xl">
        <h3 className="text-xl font-bold holographic mb-4">Payment Details</h3>
        <PaymentElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                  color: '#9ca3af',
                },
              },
            },
          }}
        />
      </div>
      
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-neon-blue to-neon-purple py-4 rounded-2xl font-bold text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid="button-complete-payment"
      >
        {isProcessing ? 'Processing...' : `Complete Payment - $${destination.price * bookingDetails.travelers}`}
      </motion.button>
    </form>
  )
}

export default function Checkout() {
  const { destinationId } = useParams<{ destinationId: string }>()
  const { toast } = useToast()
  const [clientSecret, setClientSecret] = useState('')
  const [bookingDetails, setBookingDetails] = useState({
    startDate: '',
    endDate: '',
    travelers: 1,
    contactEmail: '',
    contactPhone: '',
    specialRequests: '',
  })

  const { data: destination, isLoading } = useQuery<SelectDestination>({
    queryKey: [`/api/destinations/${destinationId}`],
    enabled: !!destinationId,
  })

  useEffect(() => {
    if (destination && bookingDetails.startDate && bookingDetails.endDate) {
      // Create payment intent
      apiRequest('POST', '/api/create-payment-intent', {
        destinationId: destination.id,
        travelers: bookingDetails.travelers,
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate,
        contactEmail: bookingDetails.contactEmail,
        contactPhone: bookingDetails.contactPhone,
        specialRequests: bookingDetails.specialRequests,
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret)
        })
        .catch((error) => {
          toast({
            title: "Payment Setup Failed",
            description: "Unable to initialize payment. Please try again.",
            variant: "destructive",
          })
        })
    }
  }, [destination, bookingDetails, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold holographic mb-4">Destination Not Found</h1>
          <p className="text-white/60">The destination you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const totalPrice = destination.price * bookingDetails.travelers

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Left Column - Trip Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold holographic mb-4">Book Your Adventure</h1>
              <p className="text-white/60">Complete your booking for an unforgettable experience</p>
            </div>

            {/* Destination Summary */}
            <div className="glass-dark p-6 rounded-2xl">
              <div className="flex items-start space-x-4">
                <img
                  src={destination.images[0]}
                  alt={destination.name}
                  className="w-24 h-24 rounded-xl object-cover"
                  data-testid="img-destination-summary"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white" data-testid="text-destination-name">
                    {destination.name}
                  </h3>
                  <p className="text-white/60" data-testid="text-destination-country">
                    {destination.country}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white/80 text-sm" data-testid="text-destination-rating">
                      {destination.rating}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-neon-blue" data-testid="text-price-per-person">
                    ${destination.price}
                  </div>
                  <div className="text-sm text-white/60">per person</div>
                </div>
              </div>
            </div>

            {/* Booking Details Form */}
            <div className="glass-dark p-6 rounded-2xl">
              <h3 className="text-xl font-bold holographic mb-6">Trip Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.startDate}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                    data-testid="input-start-date"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={bookingDetails.endDate}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                    data-testid="input-end-date"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Users className="inline h-4 w-4 mr-2" />
                    Travelers
                  </label>
                  <select
                    value={bookingDetails.travelers}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                    data-testid="select-travelers"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={bookingDetails.contactEmail}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                    placeholder="your@email.com"
                    data-testid="input-email"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={bookingDetails.contactPhone}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <MessageSquare className="inline h-4 w-4 mr-2" />
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={bookingDetails.specialRequests}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue resize-none"
                    placeholder="Any special dietary requirements, accessibility needs, or preferences..."
                    data-testid="textarea-special-requests"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-8">
            {/* Price Summary */}
            <div className="glass-dark p-6 rounded-2xl">
              <h3 className="text-xl font-bold holographic mb-6">Price Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/80">Price per person</span>
                  <span className="text-white" data-testid="text-price-breakdown">
                    ${destination.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Number of travelers</span>
                  <span className="text-white" data-testid="text-travelers-count">
                    {bookingDetails.travelers}
                  </span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="holographic">Total</span>
                    <span className="text-neon-blue" data-testid="text-total-price">
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            {!stripePromise ? (
              <div className="glass-dark p-6 rounded-2xl text-center">
                <h3 className="text-xl font-bold text-red-400 mb-4">Payment Configuration Missing</h3>
                <p className="text-white/60">
                  Stripe configuration is required to process payments. 
                  Please contact support to complete your booking.
                </p>
              </div>
            ) : !clientSecret ? (
              <div className="glass-dark p-6 rounded-2xl text-center">
                <div className="animate-spin w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white/60">Preparing payment...</p>
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm destination={destination} bookingDetails={bookingDetails} />
              </Elements>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}