-- Script d'amorçage SQL pour MAGRO (à exécuter dans le SQL Editor de Supabase)

-- 1. Nettoyage des anciennes données
DELETE FROM "AuditLog";
DELETE FROM "TransportNegotiation";
DELETE FROM "Dispute";
DELETE FROM "Order";
DELETE FROM "AvailabilityAlert";
DELETE FROM "VerificationRequest";
DELETE FROM "SeasonalContract";
DELETE FROM "TrustedPair";
DELETE FROM "CooperativeMember";
DELETE FROM "LoginOtp";
DELETE FROM "Certification";
DELETE FROM "Listing";
DELETE FROM "RefreshToken";
DELETE FROM "User";

-- 2. Création des Utilisateurs
-- On utilise des UUIDs prédéfinis pour pouvoir lier les tables
DO $$
DECLARE
  farmer1_id UUID := 'f1111111-1111-1111-1111-111111111111';
  farmer2_id UUID := 'f2222222-2222-2222-2222-222222222222';
  buyer1_id UUID := 'b1111111-1111-1111-1111-111111111111';
  regulator_id UUID := 'r1111111-1111-1111-1111-111111111111';
  
  listing1_id UUID := 'l1111111-1111-1111-1111-111111111111';
  listing2_id UUID := 'l2222222-2222-2222-2222-222222222222';
  listing3_id UUID := 'l3333333-3333-3333-3333-333333333333';
  
  -- Mot de passe haché pour '123456'
  pass_hash TEXT := '$2b$10$EPfP.9XmS0D3C9D5V3U46O1Nqf7f4l8b5pA2yD2/8e3/qXhX6bS'; 
BEGIN

  -- Insertion Agriculteur 1
  INSERT INTO "User" ("id", "phone", "name", "passwordHash", "role", "region", "isVerified", "rating", "updatedAt")
  VALUES (farmer1_id, '+22370000001', 'Amadou Traoré', pass_hash, 'FARMER', 'Sikasso', true, 4.8, NOW());

  -- Insertion Agriculteur 2
  INSERT INTO "User" ("id", "phone", "name", "passwordHash", "role", "region", "isVerified", "rating", "updatedAt")
  VALUES (farmer2_id, '+22370000002', 'Oumar Kéita', pass_hash, 'FARMER', 'Koulikoro', false, 4.5, NOW());

  -- Insertion Acheteur 1
  INSERT INTO "User" ("id", "phone", "name", "passwordHash", "role", "buyerType", "region", "isVerified", "rating", "updatedAt")
  VALUES (buyer1_id, '+22370000003', 'Fatoumata K.', pass_hash, 'BUYER', 'TRADER', 'Bamako', true, 4.9, NOW());

  -- Insertion Régulateur
  INSERT INTO "User" ("id", "phone", "name", "passwordHash", "role", "region", "isVerified", "updatedAt")
  VALUES (regulator_id, '+22370000004', 'Modérateur MAGRO', pass_hash, 'MODERATOR', 'Bamako', true, NOW());

  -- 3. Création des Produits (Listings)
  INSERT INTO "Listing" ("id", "title", "description", "price", "quantity", "quantityRemaining", "unit", "region", "image", "imageUrls", "farmerId", "updatedAt")
  VALUES (listing1_id, 'Tomates Fraîches', 'Belles tomates de la région de Sikasso', 350, 500, 500, 'kg', 'Sikasso', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=60', ARRAY[]::TEXT[], farmer1_id, NOW());

  INSERT INTO "Listing" ("id", "title", "description", "price", "quantity", "quantityRemaining", "unit", "region", "image", "imageUrls", "farmerId", "updatedAt")
  VALUES (listing2_id, 'Oignons Blancs', 'Oignons de conservation, très bonne qualité.', 250, 1000, 1000, 'kg', 'Koulikoro', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=60', ARRAY[]::TEXT[], farmer2_id, NOW());

  INSERT INTO "Listing" ("id", "title", "description", "price", "quantity", "quantityRemaining", "unit", "region", "image", "imageUrls", "farmerId", "updatedAt")
  VALUES (listing3_id, 'Mangues Kent', 'Mangues douces pour exportation.', 1500, 300, 300, 'kg', 'Sikasso', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop&q=60', ARRAY[]::TEXT[], farmer1_id, NOW());

  -- 4. Création des Commandes (Orders)
  INSERT INTO "Order" ("id", "buyerId", "listingId", "quantity", "totalPrice", "status", "paymentStatus", "updatedAt")
  VALUES (gen_random_uuid(), buyer1_id, listing1_id, 50, 17500, 'EN_ATTENTE', 'ESCROW', NOW());

  INSERT INTO "Order" ("id", "buyerId", "listingId", "quantity", "totalPrice", "status", "paymentStatus", "updatedAt")
  VALUES (gen_random_uuid(), buyer1_id, listing2_id, 100, 25000, 'CONFIRMEE', 'ESCROW', NOW());

END $$;
