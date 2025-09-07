/*
  # Initial Schema for Fortis Tourism

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
    - `destinations` - Travel destinations with coordinates and details
    - `bookings` - User bookings for destinations
    - `wishlist` - User saved destinations
    - `reviews` - User reviews for destinations
    - `categories` - Destination categories

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add admin policies for destination management

  3. Functions
    - Handle user profile creation on signup
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'challenging');

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  description text NOT NULL,
  coordinates jsonb NOT NULL, -- {lat: number, lng: number}
  category_id uuid REFERENCES categories(id),
  images text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  price decimal(10,2) NOT NULL,
  rating decimal(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  activities text[] DEFAULT '{}',
  highlights text[] DEFAULT '{}',
  best_season text,
  duration text,
  difficulty difficulty_level DEFAULT 'easy',
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  preferences text[] DEFAULT '{}',
  is_admin boolean DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  travelers integer NOT NULL CHECK (travelers > 0),
  total_price decimal(10,2) NOT NULL,
  status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id text,
  special_requests text,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, destination_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  images text[] DEFAULT '{}',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, destination_id)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Destinations policies (public read, admin write)
CREATE POLICY "Destinations are viewable by everyone"
  ON destinations FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Only admins can manage destinations"
  ON destinations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist"
  ON wishlist FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = reviews.booking_id 
      AND bookings.user_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'firstName',
    NEW.raw_user_meta_data->>'lastName'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Adventure', 'adventure', 'Thrilling outdoor experiences and extreme sports', '🏔️', '#FF6B35'),
  ('Luxury', 'luxury', 'Premium accommodations and exclusive experiences', '💎', '#FFD700'),
  ('Culture', 'culture', 'Historical sites and cultural immersion', '🏛️', '#8B5CF6'),
  ('Beaches', 'beaches', 'Tropical paradises and coastal destinations', '🏖️', '#06B6D4'),
  ('Historical', 'historical', 'Ancient monuments and heritage sites', '🏺', '#D97706')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample destinations
INSERT INTO destinations (name, country, description, coordinates, category_id, images, price, rating, activities, highlights, best_season, duration, difficulty, is_popular) VALUES
  (
    'Paris',
    'France',
    'The City of Light awaits with its iconic landmarks, world-class museums, and romantic atmosphere.',
    '{"lat": 48.8566, "lng": 2.3522}',
    (SELECT id FROM categories WHERE slug = 'culture'),
    ARRAY['https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800'],
    2500.00,
    4.8,
    ARRAY['Eiffel Tower', 'Louvre Museum', 'Seine River Cruise'],
    ARRAY['Iconic landmarks', 'World-class cuisine', 'Rich history'],
    'Spring-Summer',
    '5-7 days',
    'easy',
    true
  ),
  (
    'Bali',
    'Indonesia',
    'Tropical paradise with stunning beaches, ancient temples, and vibrant culture.',
    '{"lat": -8.3405, "lng": 115.0920}',
    (SELECT id FROM categories WHERE slug = 'beaches'),
    ARRAY['https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'],
    1800.00,
    4.7,
    ARRAY['Beach relaxation', 'Temple visits', 'Rice terrace tours'],
    ARRAY['Beautiful beaches', 'Cultural heritage', 'Tropical climate'],
    'Year-round',
    '7-10 days',
    'easy',
    true
  ),
  (
    'Mount Fuji',
    'Japan',
    'Sacred mountain offering breathtaking views and spiritual experiences.',
    '{"lat": 35.3606, "lng": 138.7274}',
    (SELECT id FROM categories WHERE slug = 'adventure'),
    ARRAY['https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800'],
    3200.00,
    4.9,
    ARRAY['Mountain climbing', 'Hot springs', 'Cultural sites'],
    ARRAY['Iconic peak', 'Spiritual journey', 'Stunning landscapes'],
    'Summer',
    '4-6 days',
    'challenging',
    true
  ),
  (
    'Maldives',
    'Maldives',
    'Ultimate luxury destination with crystal-clear waters and overwater bungalows.',
    '{"lat": 3.2028, "lng": 73.2207}',
    (SELECT id FROM categories WHERE slug = 'luxury'),
    ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    5500.00,
    4.9,
    ARRAY['Snorkeling', 'Spa treatments', 'Water sports'],
    ARRAY['Luxury resorts', 'Marine life', 'Perfect beaches'],
    'Year-round',
    '5-8 days',
    'easy',
    true
  )
ON CONFLICT DO NOTHING;