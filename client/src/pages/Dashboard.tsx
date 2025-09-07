import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Star, Settings, Heart, BookOpen } from 'lucide-react'

import type { SelectBooking, SelectWishlist, SelectDestination } from '@shared/schema'

const tabs = [
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'profile', label: 'Profile', icon: Settings },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('bookings')

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<SelectBooking[]>({
    queryKey: ['/api/bookings'],
  })

  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery<SelectWishlist[]>({
    queryKey: ['/api/wishlist'],
  })

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold holographic">My Bookings</h2>
        <span className="text-white/60">{bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}</span>
      </div>

      {bookingsLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">No bookings yet</h3>
          <p className="text-white/40">Start exploring and book your first adventure!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-dark p-6 rounded-2xl hover:neon-blue transition-all duration-300"
              data-testid={`card-booking-${booking.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white" data-testid={`text-booking-destination-${booking.id}`}>
                    Destination Booking
                  </h3>
                  <p className="text-white/60 text-sm">Booking ID: {booking.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : booking.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`} data-testid={`status-booking-${booking.id}`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-neon-blue" />
                  <div>
                    <p className="text-white text-sm" data-testid={`text-dates-${booking.id}`}>
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-white/60 text-xs">Travel dates</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-neon-purple" />
                  <div>
                    <p className="text-white text-sm" data-testid={`text-travelers-${booking.id}`}>
                      {booking.travelers} {booking.travelers === 1 ? 'traveler' : 'travelers'}
                    </p>
                    <p className="text-white/60 text-xs">Group size</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-neon-blue font-bold text-lg" data-testid={`text-total-${booking.id}`}>
                    ${booking.totalPrice}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.paymentStatus === 'paid' 
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`} data-testid={`payment-status-${booking.id}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  const renderWishlist = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold holographic">My Wishlist</h2>
        <span className="text-white/60">{wishlist.length} {wishlist.length === 1 ? 'destination' : 'destinations'}</span>
      </div>

      {wishlistLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full"></div>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">Your wishlist is empty</h3>
          <p className="text-white/40">Save destinations you'd love to visit later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-dark rounded-2xl overflow-hidden hover:neon-purple transition-all duration-300"
              data-testid={`card-wishlist-${item.id}`}
            >
              <div className="h-40 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20" />
              <div className="p-4">
                <h3 className="font-bold text-white mb-2">Saved Destination</h3>
                <p className="text-white/60 text-sm mb-4">Added on {new Date(item.createdAt).toLocaleDateString()}</p>
                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm">
                  Remove from Wishlist
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold holographic">Profile Settings</h2>
      
      <div className="glass-dark p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
              placeholder="your@email.com"
              data-testid="input-profile-email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
            <input
              type="text"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
              placeholder="Your full name"
              data-testid="input-profile-name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Travel Preferences</label>
            <textarea
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue resize-none"
              placeholder="Tell us about your travel preferences..."
              data-testid="textarea-travel-preferences"
            />
          </div>
          <button 
            className="bg-gradient-to-r from-neon-blue to-neon-purple py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-300"
            data-testid="button-save-profile"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold holographic mb-4">Travel Dashboard</h1>
            <p className="text-white/60">Manage your bookings, wishlist, and profile</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-white/5 rounded-2xl p-1 max-w-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`button-tab-${tab.id}`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'bookings' && renderBookings()}
            {activeTab === 'wishlist' && renderWishlist()}
            {activeTab === 'profile' && renderProfile()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}