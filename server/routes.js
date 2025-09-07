import { createServer } from "http";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { storage } from "./storage.js";
import {
  insertUserSchema,
  insertBookingSchema,
  PaymentIntent,
  SearchQuery,
} from "../shared/schema.js";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

export async function registerRoutes(app) {
  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    credentials: true,
  }));

  app.use(session({
    secret: process.env.JWT_SECRET || "fortis-tourism-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isValidPassword = await bcryptjs.compare(password, user.password || "");
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Helper function to ensure user is authenticated
  const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Authentication required" });
  };

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcryptjs.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const { password, ...userResponse } = req.user;
    res.json(userResponse);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", requireAuth, (req, res) => {
    const { password, ...userResponse } = req.user;
    res.json(userResponse);
  });

  // Destination routes
  app.get("/api/destinations", async (req, res) => {
    try {
      const { category, popular } = req.query;
      
      let destinations;
      if (category) {
        destinations = await storage.getDestinationsByCategory(category);
      } else if (popular === "true") {
        destinations = await storage.getPopularDestinations();
      } else {
        destinations = await storage.getAllDestinations();
      }
      
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get("/api/destinations/:id", async (req, res) => {
    try {
      const destination = await storage.getDestinationById(req.params.id);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });

  app.post("/api/search", async (req, res) => {
    try {
      const searchData = SearchQuery.parse(req.body);
      const destinations = await storage.searchDestinations(searchData.query);
      res.json(destinations);
    } catch (error) {
      console.error("Search error:", error);
      res.status(400).json({ message: "Search failed", error: error.message });
    }
  });

  // Booking routes
  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", requireAuth, async (req, res) => {
    try {
      const booking = await storage.getBookingById(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Ensure user owns this booking
      if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const wishlist = await storage.getUserWishlist(req.user.id);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const { destinationId } = req.body;
      const wishlistItem = await storage.addToWishlist({
        userId: req.user.id,
        destinationId,
      });
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:destinationId", requireAuth, async (req, res) => {
    try {
      await storage.removeFromWishlist(req.user.id, req.params.destinationId);
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      const paymentData = PaymentIntent.parse(req.body);
      
      // Get destination details to calculate price
      const destination = await storage.getDestinationById(paymentData.destinationId);
      if (!destination) {
        return res.status(404).json({ message: "Destination not found" });
      }

      const totalAmount = destination.price * paymentData.travelers;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          destinationId: paymentData.destinationId,
          travelers: paymentData.travelers.toString(),
          startDate: paymentData.startDate,
          endDate: paymentData.endDate,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent", error: error.message });
    }
  });

  app.post("/api/confirm-booking", requireAuth, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: "Failed to create booking", error: error.message });
    }
  });

  // Subscription route (if needed for premium features)
  app.post("/api/get-or-create-subscription", requireAuth, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      let user = req.user;

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
      }

      if (!user.email) {
        throw new Error("No user email on file");
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: \`\${user.firstName} \${user.lastName}\`,
      });

      user = await storage.updateStripeCustomerId(user.id, customer.id);

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || "price_default",
        }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      await storage.updateUserStripeInfo(user.id, {
        customerId: customer.id,
        subscriptionId: subscription.id,
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(400).json({ message: "Failed to create subscription", error: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, async (req, res) => {
    try {
      // Simple admin check (in real app, you'd have proper role-based auth)
      if (req.user.email !== "admin@fortistourism.com") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [bookingStats, userStats, revenueStats] = await Promise.all([
        storage.getBookingStats(),
        storage.getUserStats(),
        storage.getRevenueStats(),
      ]);

      res.json({
        bookings: bookingStats,
        users: userStats,
        revenue: revenueStats,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}