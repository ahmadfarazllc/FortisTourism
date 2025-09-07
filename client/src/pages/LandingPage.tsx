import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Mic, Filter } from 'lucide-react'
import { Link } from 'wouter'
import { motion } from 'framer-motion'

import Globe3D from '../components/Globe3D'
import { useToast } from '../hooks/use-toast'
import type { SelectDestination } from '@shared/schema'

const categories = [
  { id: 'adventure', label: 'Adventure', color: 'from-orange-500 to-red-500' },
  { id: 'luxury', label: 'Luxury', color: 'from-yellow-400 to-yellow-600' },
  { id: 'culture', label: 'Culture', color: 'from-purple-500 to-pink-500' },
  { id: 'beaches', label: 'Beaches', color: 'from-blue-400 to-cyan-500' },
  { id: 'historical', label: 'Historical', color: 'from-amber-600 to-orange-700' },
]

const filters = [
  { id: 'budget', label: 'Budget' },
  { id: 'season', label: 'Season' },
  { id: 'activities', label: 'Activities' },
  { id: 'popularity', label: 'Popularity' },
]

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: destinations = [], isLoading } = useQuery<SelectDestination[]>({
    queryKey: ['/api/destinations'],
  })

  const { data: popularDestinations = [] } = useQuery<SelectDestination[]>({
    queryKey: ['/api/destinations?popular=true'],
  })

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a destination or activity to search for.",
        variant: "destructive"
      })
      return
    }
    
    // TODO: Implement search functionality
    toast({
      title: "Search Feature Coming Soon",
      description: "AI-powered search will be available soon!",
    })
  }

  const handleVoiceSearch = () => {
    toast({
      title: "Voice Search",
      description: "Voice search functionality coming soon!",
    })
  }

  const handleDestinationClick = (destination: SelectDestination) => {
    toast({
      title: `Exploring ${destination.name}`,
      description: `Loading details for ${destination.name}, ${destination.country}`,
    })
  }

  const filteredDestinations = selectedCategory
    ? destinations.filter(dest => dest.category === selectedCategory)
    : destinations

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2300D4FF\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-6xl lg:text-8xl font-bold mb-6">
                <span className="holographic">DISCOVER.</span>
                <br />
                <span className="holographic">BOOK.</span>
                <br />
                <span className="holographic">EXPERIENCE.</span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-lg">
                Explore the future of travel with our AI-powered platform. 
                Discover destinations through immersive 3D experiences.
              </p>

              {/* Search Bar */}
              <div className="glass-dark rounded-2xl p-2 flex items-center space-x-4 max-w-lg">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-transparent text-white placeholder-white/50 border-none outline-none px-4 py-3"
                    data-testid="input-search"
                  />
                </div>
                <button
                  onClick={handleVoiceSearch}
                  className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300"
                  data-testid="button-voice-search"
                >
                  <Mic className="h-5 w-5 text-neon-purple" />
                </button>
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-neon-blue to-neon-purple p-3 rounded-xl hover:shadow-lg hover:neon-blue transition-all duration-300"
                  data-testid="button-search"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
              </div>
            </motion.div>

            {/* Right Content - 3D Globe */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {isLoading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="animate-spin w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <Globe3D 
                  destinations={destinations} 
                  onDestinationClick={handleDestinationClick}
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold holographic mb-4">Popular Destinations</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Discover the most sought-after experiences chosen by fellow travelers
            </p>
          </motion.div>

          {/* Category Tags */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full border transition-all duration-300 ${
                !selectedCategory
                  ? 'border-neon-blue bg-neon-blue/20 text-neon-blue'
                  : 'border-white/20 text-white/60 hover:border-neon-blue hover:text-neon-blue'
              }`}
              data-testid="button-category-all"
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full border transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'border-neon-blue bg-neon-blue/20 text-neon-blue'
                    : 'border-white/20 text-white/60 hover:border-neon-blue hover:text-neon-blue'
                }`}
                data-testid={`button-category-${category.id}`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Destination Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDestinations.slice(0, 4).map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-dark rounded-2xl overflow-hidden hover:neon-blue transition-all duration-300 group cursor-pointer"
                data-testid={`card-destination-${destination.id}`}
              >
                <div className="h-48 bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 relative overflow-hidden">
                  <img
                    src={destination.images[0]}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    data-testid={`img-destination-${destination.id}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-neon-blue/80 text-white text-xs rounded-full">
                      {destination.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2" data-testid={`text-name-${destination.id}`}>
                    {destination.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4" data-testid={`text-country-${destination.id}`}>
                    {destination.country}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-neon-blue font-bold" data-testid={`text-price-${destination.id}`}>
                      ${destination.price}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white/80 text-sm" data-testid={`text-rating-${destination.id}`}>
                        {destination.rating}
                      </span>
                    </div>
                  </div>
                  
                  <Link href={`/checkout/${destination.id}`}>
                    <button 
                      className="w-full mt-4 bg-gradient-to-r from-neon-blue to-neon-purple py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                      data-testid={`button-book-${destination.id}`}
                    >
                      Book Now
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Filters */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold holographic mb-4">Smart Filters</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Find your perfect destination with our AI-powered filtering system
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-6">
            {filters.map((filter, index) => (
              <motion.button
                key={filter.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-dark px-8 py-4 rounded-2xl hover:neon-purple transition-all duration-300 group"
                data-testid={`button-filter-${filter.id}`}
              >
                <Filter className="h-6 w-6 text-neon-purple mb-2 mx-auto group-hover:animate-pulse" />
                <span className="text-white group-hover:text-neon-purple transition-colors duration-300">
                  {filter.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}