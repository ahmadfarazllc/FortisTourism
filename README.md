# Fortis Tourism - The Future of Travel Exploration

A cutting-edge, futuristic travel marketplace platform built with React, Supabase, and modern web technologies.

## 🚀 Features

### Core Features
- **Interactive 3D Globe**: Explore destinations through an immersive 3D globe interface
- **AI-Powered Search**: Intelligent search with text and voice input capabilities
- **Supabase Authentication**: Secure authentication with Google OAuth integration
- **Professional Admin Dashboard**: Comprehensive admin panel for platform management
- **Stripe Payment Integration**: Secure payment processing for bookings
- **Responsive Design**: Mobile-first approach with glassmorphism and holographic effects

### User Features
- User registration and authentication (email/password + Google OAuth)
- Interactive destination exploration
- Booking management and history
- Wishlist functionality
- User profile management
- Real-time search and filtering

### Admin Features
- User management and analytics
- Destination CRUD operations
- Booking oversight and management
- Revenue tracking and analytics
- System settings and configuration
- Real-time platform statistics

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** for styling with custom glassmorphism effects
- **Framer Motion** for animations
- **Three.js** with React Three Fiber for 3D globe
- **React Query** for data fetching and caching
- **Wouter** for routing

### Backend & Database
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** with Row Level Security (RLS)
- **Stripe** for payment processing

### Development Tools
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Vite** for fast development and building

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd fortis-tourism
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your credentials:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Application Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5000

# Admin Configuration
ADMIN_EMAIL=admin@fortistourism.com
```

### Supabase Setup

1. Create a new Supabase project
2. Run the migration file in your Supabase SQL editor:
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in Supabase SQL editor

3. Enable Google OAuth in Supabase:
   - Go to Authentication > Settings > Auth Providers
   - Enable Google provider
   - Add your Google OAuth credentials

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Building for Production

```bash
npm run build
```

## 📁 Project Structure

```
fortis-tourism/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries (Supabase, etc.)
│   │   ├── pages/          # Page components
│   │   └── index.css       # Global styles with custom CSS
│   └── package.json
├── server/                 # Backend Express server
│   ├── routes.js          # API routes
│   ├── storage.js         # Data storage layer
│   └── index.js           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Zod schemas for data validation
├── supabase/              # Supabase configuration
│   └── migrations/        # Database migration files
├── .env.example           # Environment variables template
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary**: Deep navy, charcoal grey, obsidian black
- **Accents**: Neon Blue (#00D4FF), Vibrant Purple (#B347D9)
- **Effects**: Glassmorphism, holographic elements, neon glows

### Key UI Elements
- **Glassmorphism**: Translucent cards and panels with blur effects
- **Holographic Elements**: Shimmering buttons and text effects
- **Neon Glows**: Soft, pulsating accent lighting
- **Micro-animations**: Smooth transitions and hover states
- **3D Interactivity**: Interactive globe and destination previews

## 🔐 Authentication & Authorization

### User Roles
- **Regular Users**: Can browse, book, and manage their travel plans
- **Admins**: Full platform management capabilities

### Authentication Methods
- Email/Password registration and login
- Google OAuth integration
- Secure session management with Supabase

## 💳 Payment Integration

- **Stripe Elements**: Secure card input forms
- **Payment Intents**: Server-side payment processing
- **Webhook Handling**: Real-time payment status updates
- **Refund Management**: Admin refund capabilities

## 📊 Admin Dashboard Features

### Overview
- Platform statistics and KPIs
- Recent activity feed
- Popular destinations overview
- Revenue tracking

### User Management
- User list with search and filtering
- Account status management
- User activity monitoring

### Destination Management
- CRUD operations for destinations
- Media upload and management
- Category and pricing management

### Booking Management
- Booking oversight and status updates
- Payment status monitoring
- Customer communication tools

### Analytics
- Revenue trends and forecasting
- User growth metrics
- Booking conversion rates
- Popular destination insights

## 🚀 Deployment

### Recommended Deployment Stack
- **Frontend**: Vercel, Netlify, or similar
- **Backend**: Railway, Render, or similar
- **Database**: Supabase (managed PostgreSQL)
- **File Storage**: Supabase Storage or AWS S3
- **CDN**: Cloudflare or similar

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment, especially:
- Supabase URLs and keys
- Stripe keys (use live keys for production)
- Admin email configuration
- CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: support@fortistourism.com

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ Authentication system
- ✅ Admin dashboard
- ✅ Payment integration

### Phase 2 (Upcoming)
- [ ] AI-powered recommendations
- [ ] Real-time chat support
- [ ] Mobile app development
- [ ] Advanced analytics

### Phase 3 (Future)
- [ ] AR/VR destination previews
- [ ] Social features and community
- [ ] Multi-language support
- [ ] Advanced booking management

---

Built with ❤️ by the Fortis Tourism team