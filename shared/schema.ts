import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Data schemas for Fortis Tourism

// User schema
export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().url().optional(),
  preferences: z.array(z.string()).default([]),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const insertUserSchema = User.omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof User>;

// Destination schema
export const Destination = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  description: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  category: z.enum(["adventure", "luxury", "culture", "beaches", "historical"]),
  images: z.array(z.string().url()),
  videos: z.array(z.string().url()).default([]),
  price: z.number().positive(),
  rating: z.number().min(0).max(5),
  activities: z.array(z.string()),
  highlights: z.array(z.string()),
  bestSeason: z.string(),
  duration: z.string(),
  difficulty: z.enum(["easy", "moderate", "challenging"]),
  isPopular: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export const insertDestinationSchema = Destination.omit({ id: true, createdAt: true });
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type SelectDestination = z.infer<typeof Destination>;

// Booking schema
export const Booking = z.object({
  id: z.string(),
  userId: z.string(),
  destinationId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  travelers: z.number().positive(),
  totalPrice: z.number().positive(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  stripePaymentIntentId: z.string().optional(),
  specialRequests: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export const insertBookingSchema = Booking.omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type SelectBooking = z.infer<typeof Booking>;

// Wishlist schema
export const Wishlist = z.object({
  id: z.string(),
  userId: z.string(),
  destinationId: z.string(),
  createdAt: z.date().default(() => new Date()),
});

export const insertWishlistSchema = Wishlist.omit({ id: true, createdAt: true });
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type SelectWishlist = z.infer<typeof Wishlist>;

// Search query schema
export const SearchQuery = z.object({
  query: z.string(),
  categories: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  season: z.string().optional(),
  difficulty: z.string().optional(),
  duration: z.string().optional(),
});

export type SearchQueryType = z.infer<typeof SearchQuery>;

// Payment intent schema
export const PaymentIntent = z.object({
  destinationId: z.string(),
  travelers: z.number().positive(),
  startDate: z.string(),
  endDate: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  specialRequests: z.string().optional(),
});

export type PaymentIntentType = z.infer<typeof PaymentIntent>;