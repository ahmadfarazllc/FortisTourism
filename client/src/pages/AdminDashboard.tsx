import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Users, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/use-toast'
import { supabase } from '../lib/supabase'

interface AdminStats {
  totalUsers: number
  totalDestinations: number
  totalBookings: number
  totalRevenue: number
  monthlyGrowth: number
  activeUsers: number
}

interface Destination {
  id: string
  name: string
  country: string
  category: string
  price: number
  rating: number
  isPopular: boolean
  createdAt: string
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  lastSignIn: string
}

interface Booking {
  id: string
  userId: string
  destinationId: string
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt: string
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/dashboard'
    }
  }, [isAdmin])

  // Mock data - replace with real API calls
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 1247,
    totalDestinations: 89,
    totalBookings: 342,
    totalRevenue: 125000,
    monthlyGrowth: 12.5,
    activeUsers: 89
  })

  const [destinations, setDestinations] = useState<Destination[]>([
    {
      id: '1',
      name: 'Paris',
      country: 'France',
      category: 'culture',
      price: 2500,
      rating: 4.8,
      isPopular: true,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Bali',
      country: 'Indonesia',
      category: 'beaches',
      price: 1800,
      rating: 4.7,
      isPopular: true,
      createdAt: '2024-01-10'
    }
  ])

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: '2024-01-15',
      lastSignIn: '2024-01-20'
    }
  ])

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      userId: '1',
      destinationId: '1',
      totalPrice: 2500,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: '2024-01-18'
    }
  ])

  const StatCard = ({ title, value, icon: Icon, change, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark p-6 rounded-2xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          change={8.2}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Destinations"
          value={stats.totalDestinations}
          icon={MapPin}
          change={5.1}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          change={12.5}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={15.3}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark p-6 rounded-2xl"
        >
          <h3 className="text-xl font-bold holographic mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'New user registered', user: 'john@example.com', time: '2 minutes ago' },
              { action: 'Booking confirmed', user: 'jane@example.com', time: '15 minutes ago' },
              { action: 'New destination added', user: 'admin', time: '1 hour ago' },
              { action: 'Payment processed', user: 'mike@example.com', time: '2 hours ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Activity className="h-5 w-5 text-neon-blue" />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-white/60 text-xs">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark p-6 rounded-2xl"
        >
          <h3 className="text-xl font-bold holographic mb-4">Popular Destinations</h3>
          <div className="space-y-4">
            {destinations.filter(d => d.isPopular).map((destination) => (
              <div key={destination.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{destination.name}</p>
                  <p className="text-white/60 text-sm">{destination.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-neon-blue font-bold">${destination.price}</p>
                  <p className="text-white/60 text-sm">★ {destination.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold holographic">User Management</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-neon-blue"
            />
          </div>
        </div>
      </div>

      <div className="glass-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">User</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Joined</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Last Active</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/80">{user.email}</td>
                  <td className="px-6 py-4 text-white/80">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-white/80">{new Date(user.lastSignIn).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-white/60" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="h-4 w-4 text-white/60" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderDestinations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold holographic">Destination Management</h2>
        <button className="bg-gradient-to-r from-neon-blue to-neon-purple px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Destination</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl overflow-hidden hover:neon-blue transition-all duration-300"
          >
            <div className="h-48 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{destination.name}</h3>
                  <p className="text-white/60">{destination.country}</p>
                </div>
                {destination.isPopular && (
                  <span className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded-full">
                    Popular
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-neon-blue font-bold">${destination.price}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white/80 text-sm">{destination.rating}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-white/10 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button className="flex-1 bg-red-500/20 py-2 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold holographic">Booking Management</h2>
        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-blue"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="glass-dark rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">Booking ID</th>
                <th className="px-6 py-4 text-left text-white font-semibold">User</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Destination</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 text-white/80 font-mono">#{booking.id}</td>
                  <td className="px-6 py-4 text-white/80">{booking.userId}</td>
                  <td className="px-6 py-4 text-white/80">{booking.destinationId}</td>
                  <td className="px-6 py-4 text-white/80">${booking.totalPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : booking.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/80">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-white/60" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="h-4 w-4 text-white/60" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold holographic">Analytics & Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark p-6 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-white/60">Chart visualization would go here</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark p-6 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-white/60">Chart visualization would go here</p>
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold holographic">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark p-6 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Fortis Tourism"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@fortistourism.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark p-6 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-4">Payment Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Stripe Public Key
              </label>
              <input
                type="text"
                placeholder="pk_test_..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Currency
              </label>
              <select className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon-blue">
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold holographic mb-4">Access Denied</h1>
          <p className="text-white/60">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold holographic mb-4">Admin Dashboard</h1>
            <p className="text-white/60">Manage your Fortis Tourism platform</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-white/5 rounded-2xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`button-admin-tab-${tab.id}`}
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
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'destinations' && renderDestinations()}
            {activeTab === 'bookings' && renderBookings()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && renderSettings()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}