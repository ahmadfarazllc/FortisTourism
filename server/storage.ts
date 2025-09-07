import type { 
  SelectUser, 
  InsertUser, 
  SelectDestination, 
  InsertDestination, 
  SelectBooking, 
  InsertBooking, 
  SelectWishlist, 
  InsertWishlist 
} from "@shared/schema";

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<SelectUser>;
  getUserById(id: string): Promise<SelectUser | null>;
  getUserByEmail(email: string): Promise<SelectUser | null>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<SelectUser>;
  updateStripeCustomerId(userId: string, customerId: string): Promise<SelectUser>;
  updateUserStripeInfo(userId: string, info: { customerId: string; subscriptionId: string }): Promise<SelectUser>;
  
  // Destination methods
  getAllDestinations(): Promise<SelectDestination[]>;
  getDestinationById(id: string): Promise<SelectDestination | null>;
  getDestinationsByCategory(category: string): Promise<SelectDestination[]>;
  getPopularDestinations(): Promise<SelectDestination[]>;
  searchDestinations(query: string): Promise<SelectDestination[]>;
  createDestination(destination: InsertDestination): Promise<SelectDestination>;
  updateDestination(id: string, updates: Partial<InsertDestination>): Promise<SelectDestination>;
  deleteDestination(id: string): Promise<void>;
  
  // Booking methods
  createBooking(booking: InsertBooking): Promise<SelectBooking>;
  getBookingById(id: string): Promise<SelectBooking | null>;
  getUserBookings(userId: string): Promise<SelectBooking[]>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<SelectBooking>;
  deleteBooking(id: string): Promise<void>;
  
  // Wishlist methods
  addToWishlist(wishlist: InsertWishlist): Promise<SelectWishlist>;
  removeFromWishlist(userId: string, destinationId: string): Promise<void>;
  getUserWishlist(userId: string): Promise<SelectWishlist[]>;
  
  // Analytics methods (for admin)
  getBookingStats(): Promise<any>;
  getUserStats(): Promise<any>;
  getRevenueStats(): Promise<any>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, SelectUser> = new Map();
  private destinations: Map<string, SelectDestination> = new Map();
  private bookings: Map<string, SelectBooking> = new Map();
  private wishlist: Map<string, SelectWishlist> = new Map();

  constructor() {
    this.seedData();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private seedData() {
    // Seed popular destinations
    const sampleDestinations: SelectDestination[] = [
      {
        id: "dest_1",
        name: "Paris",
        country: "France",
        description: "The City of Light awaits with its iconic landmarks, world-class museums, and romantic atmosphere.",
        coordinates: { lat: 48.8566, lng: 2.3522 },
        category: "culture",
        images: ["https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800"],
        videos: [],
        price: 2500,
        rating: 4.8,
        activities: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"],
        highlights: ["Iconic landmarks", "World-class cuisine", "Rich history"],
        bestSeason: "Spring-Summer",
        duration: "5-7 days",
        difficulty: "easy",
        isPopular: true,
        createdAt: new Date(),
      },
      {
        id: "dest_2",
        name: "Bali",
        country: "Indonesia",
        description: "Tropical paradise with stunning beaches, ancient temples, and vibrant culture.",
        coordinates: { lat: -8.3405, lng: 115.0920 },
        category: "beaches",
        images: ["https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800"],
        videos: [],
        price: 1800,
        rating: 4.7,
        activities: ["Beach relaxation", "Temple visits", "Rice terrace tours"],
        highlights: ["Beautiful beaches", "Cultural heritage", "Tropical climate"],
        bestSeason: "Year-round",
        duration: "7-10 days",
        difficulty: "easy",
        isPopular: true,
        createdAt: new Date(),
      },
      {
        id: "dest_3",
        name: "Mount Fuji",
        country: "Japan",
        description: "Sacred mountain offering breathtaking views and spiritual experiences.",
        coordinates: { lat: 35.3606, lng: 138.7274 },
        category: "adventure",
        images: ["https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800"],
        videos: [],
        price: 3200,
        rating: 4.9,
        activities: ["Mountain climbing", "Hot springs", "Cultural sites"],
        highlights: ["Iconic peak", "Spiritual journey", "Stunning landscapes"],
        bestSeason: "Summer",
        duration: "4-6 days",
        difficulty: "challenging",
        isPopular: true,
        createdAt: new Date(),
      },
      {
        id: "dest_4",
        name: "Maldives",
        country: "Maldives",
        description: "Ultimate luxury destination with crystal-clear waters and overwater bungalows.",
        coordinates: { lat: 3.2028, lng: 73.2207 },
        category: "luxury",
        images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"],
        videos: [],
        price: 5500,
        rating: 4.9,
        activities: ["Snorkeling", "Spa treatments", "Water sports"],
        highlights: ["Luxury resorts", "Marine life", "Perfect beaches"],
        bestSeason: "Year-round",
        duration: "5-8 days",
        difficulty: "easy",
        isPopular: true,
        createdAt: new Date(),
      },
    ];

    sampleDestinations.forEach(dest => {
      this.destinations.set(dest.id, dest);
    });
  }

  // User methods
  async createUser(user: InsertUser): Promise<SelectUser> {
    const newUser: SelectUser = {
      ...user,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<SelectUser | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<SelectUser | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<SelectUser> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(userId: string, customerId: string): Promise<SelectUser> {
    return this.updateUser(userId, { stripeCustomerId: customerId });
  }

  async updateUserStripeInfo(userId: string, info: { customerId: string; subscriptionId: string }): Promise<SelectUser> {
    return this.updateUser(userId, { 
      stripeCustomerId: info.customerId, 
      stripeSubscriptionId: info.subscriptionId 
    });
  }

  // Destination methods
  async getAllDestinations(): Promise<SelectDestination[]> {
    return Array.from(this.destinations.values());
  }

  async getDestinationById(id: string): Promise<SelectDestination | null> {
    return this.destinations.get(id) || null;
  }

  async getDestinationsByCategory(category: string): Promise<SelectDestination[]> {
    return Array.from(this.destinations.values()).filter(dest => dest.category === category);
  }

  async getPopularDestinations(): Promise<SelectDestination[]> {
    return Array.from(this.destinations.values()).filter(dest => dest.isPopular);
  }

  async searchDestinations(query: string): Promise<SelectDestination[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.destinations.values()).filter(dest => 
      dest.name.toLowerCase().includes(lowercaseQuery) ||
      dest.country.toLowerCase().includes(lowercaseQuery) ||
      dest.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createDestination(destination: InsertDestination): Promise<SelectDestination> {
    const newDestination: SelectDestination = {
      ...destination,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.destinations.set(newDestination.id, newDestination);
    return newDestination;
  }

  async updateDestination(id: string, updates: Partial<InsertDestination>): Promise<SelectDestination> {
    const destination = this.destinations.get(id);
    if (!destination) throw new Error("Destination not found");
    
    const updatedDestination = { ...destination, ...updates };
    this.destinations.set(id, updatedDestination);
    return updatedDestination;
  }

  async deleteDestination(id: string): Promise<void> {
    this.destinations.delete(id);
  }

  // Booking methods
  async createBooking(booking: InsertBooking): Promise<SelectBooking> {
    const newBooking: SelectBooking = {
      ...booking,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.bookings.set(newBooking.id, newBooking);
    return newBooking;
  }

  async getBookingById(id: string): Promise<SelectBooking | null> {
    return this.bookings.get(id) || null;
  }

  async getUserBookings(userId: string): Promise<SelectBooking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<SelectBooking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    this.bookings.delete(id);
  }

  // Wishlist methods
  async addToWishlist(wishlist: InsertWishlist): Promise<SelectWishlist> {
    const newWishlist: SelectWishlist = {
      ...wishlist,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.wishlist.set(newWishlist.id, newWishlist);
    return newWishlist;
  }

  async removeFromWishlist(userId: string, destinationId: string): Promise<void> {
    for (const [id, item] of this.wishlist.entries()) {
      if (item.userId === userId && item.destinationId === destinationId) {
        this.wishlist.delete(id);
        return;
      }
    }
  }

  async getUserWishlist(userId: string): Promise<SelectWishlist[]> {
    return Array.from(this.wishlist.values()).filter(item => item.userId === userId);
  }

  // Analytics methods
  async getBookingStats(): Promise<any> {
    const bookings = Array.from(this.bookings.values());
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      pending: bookings.filter(b => b.status === "pending").length,
      revenue: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    };
  }

  async getUserStats(): Promise<any> {
    return {
      total: this.users.size,
      active: this.users.size, // Simplified
    };
  }

  async getRevenueStats(): Promise<any> {
    const bookings = Array.from(this.bookings.values());
    const revenue = bookings
      .filter(b => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    return {
      total: revenue,
      thisMonth: revenue, // Simplified
      growth: 15.5, // Mock data
    };
  }
}

export const storage = new MemStorage();