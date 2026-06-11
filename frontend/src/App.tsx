import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { motion, AnimatePresence } from "motion/react";
import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupFlow from "./screens/SignupFlow";
import TermsScreen from "./screens/TermsScreen";
import MarketplaceHome from "./screens/MarketplaceHome";
import ProductDetail from "./screens/ProductDetail";
import OrderScreen from "./screens/OrderScreen";
import FarmerDashboard from "./screens/FarmerDashboard";
import CreateProductScreen from "./screens/CreateProductScreen";
import MyListingsScreen from "./screens/MyListingsScreen";
import AdminDashboard from "./screens/AdminDashboard";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OrdersScreen from "./screens/OrdersScreen";
import TransportNegotiationScreen from "./screens/TransportNegotiationScreen";
import ProductionPlanningScreen from "./screens/ProductionPlanningScreen";
import SubscriptionScreen from "./screens/SubscriptionScreen";
import SupportScreen from "./screens/SupportScreen";
import OfflineBanner from "./components/OfflineBanner";

import { ToastProvider, useToast } from "./components/ToastProvider";
import { Product } from "./screens/MarketplaceHome";
import {
  fetchProfile,
  logout as logoutUser,
  updateRole,
  UserProfile
} from "./services/auth";
import { getStoredAccessToken } from "./services/api";
import {
  createListing,
  deleteListing,
  fetchListings,
  fetchMyListings,
  updateListing,
  ListingItem
} from "./services/listings";
import { placeOrder } from "./services/orders";

type Screen =
  | "splash"
  | "welcome"
  | "login"
  | "admin-login"
  | "signup"
  | "marketplace"
  | "product-detail"
  | "order"
  | "farmer-dashboard"
  | "create-listing"
  | "my-listings"
  | "regulator-dashboard"
  | "orders"
  | "chat"
  | "profile"
  | "transport"
  | "production-planning"
  | "terms"
  | "subscription"
  | "support";

function mapListingToProduct(listing: ListingItem): Product {
  return {
    id: listing.id,
    name: listing.title,
    image: listing.image,
    price: listing.price,
    quantity: `${listing.quantity} kg disponibles`,
    region: listing.region,
    farmerId: listing.farmerId || "unknown",
    farmer: listing.farmer?.name || "Votre ferme",
    farmerPhone: listing.farmer?.phone || undefined,
    rating: listing.farmer?.rating ? Number(listing.farmer.rating) : 0,
    certified: listing.farmer?.isVerified || false,
    videoUrl: listing.videoUrl,
    description: listing.description
  };
}

function AppContent() {
  const { showToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  const [userRole, setUserRole] = useState<"buyer" | "farmer" | "regulator" | "moderator" | "super_admin" | "analyst" | null>(null);
  const [userName, setUserName] = useState("Moussa");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initialSearchQuery, setInitialSearchQuery] = useState("");

  useEffect(() => {
    async function loadSession() {
      try {
        const profile = await fetchProfile();
        setUserProfile(profile);
        setUserName(profile.name);
        const r = profile.role.toLowerCase() as NonNullable<typeof userRole>;
        setUserRole(r);
        
        const isAdmin = ["super_admin", "moderator", "analyst", "regulator"].includes(r);
        
        // Wait for splash screen
        setTimeout(() => {
          if (isAdminRoute) {
            if (isAdmin) {
              setCurrentScreen("regulator-dashboard");
            } else {
              setCurrentScreen("admin-login");
            }
          } else {
            // Un admin sur la route publique accède comme un utilisateur normal (par ex. marketplace)
            if (r === "farmer") {
              setCurrentScreen("farmer-dashboard");
            } else {
              setCurrentScreen("marketplace");
            }
          }
        }, 1500);
      } catch {
        // no active session
        setTimeout(() => {
          if (isAdminRoute) {
            setCurrentScreen("admin-login");
          } else {
            setCurrentScreen("welcome");
          }
        }, 1500);
      }
    }

    loadSession();
  }, []);

  useEffect(() => {
    // Don't load listings on admin portal — no auth token available
    if (isAdminRoute) return;

    async function loadListings() {
      setIsLoadingListings(true);
      try {
        const data = await fetchListings();
        setListings(data.map(mapListingToProduct));
      } catch {
        // ignore load errors for UI
      } finally {
        setIsLoadingListings(false);
      }
    }

    async function loadMyListings() {
      if (!getStoredAccessToken()) return; // guard: no 401 when not logged in
      try {
        const data = await fetchMyListings();
        setFarmerProducts(data.map(mapListingToProduct));
      } catch {
        // ignore load errors for UI
      }
    }

    loadListings();
    loadMyListings();
  }, []);

  // Login completed: detect role from profile and redirect
  const handleLoginComplete = async () => {
    try {
      const profile = await fetchProfile();
      setUserProfile(profile);
      setUserName(profile.name);
      const role = profile.role.toLowerCase() as NonNullable<typeof userRole>;
      setUserRole(role);
      
      // Re-fetch listings now that we are authenticated
      try {
        const allListings = await fetchListings();
        setListings(allListings.map(mapListingToProduct));
        const myListings = await fetchMyListings();
        setFarmerProducts(myListings.map(mapListingToProduct));
      } catch (err) {
        console.error("Failed to fetch listings on login", err);
      }

      if (role === "farmer") {
        setCurrentScreen("farmer-dashboard");
      } else {
        setCurrentScreen("marketplace");
      }
    } catch {
      // Fallback: if no profile yet, default to marketplace
      setUserRole("buyer");
      setCurrentScreen("marketplace");
    }
  };

  // Signup completed: set role and redirect
  const handleSignupComplete = async (role: "buyer" | "farmer") => {
    setUserRole(role);
    try {
      await updateRole(role.toUpperCase() as "BUYER" | "FARMER");
      const profile = await fetchProfile();
      setUserProfile(profile);
      setUserName(profile.name);
    } catch {
      // ignore
    }
    if (role === "farmer") {
      setCurrentScreen("farmer-dashboard");
    } else {
      setCurrentScreen("marketplace");
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen("product-detail");
  };

  const handleOrderClick = () => {
    setCurrentScreen("order");
  };

  const handleOrderConfirm = async (
    quantity: number,
    depositRequired: boolean,
    depositAmount: number,
    riskScore: number
  ) => {
    if (!selectedProduct) {
      return;
    }

    try {
      await placeOrder(selectedProduct.id, quantity, {
        depositRequired,
        depositAmount,
        riskScore,
        cropName: selectedProduct.name
      });
      const paymentMsg = depositRequired
        ? `Acompte de ${depositAmount.toLocaleString()} FCFA réglé par Mobile Money. La commande est confirmée et en pré-production !`
        : `Paiement de ${(quantity * selectedProduct.price).toLocaleString()} FCFA séquestré avec succès. Commande confirmée !`;
      showToast(paymentMsg, "success");
      setCurrentScreen("orders");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible de passer la commande", "error");
    }
  };

  const getHomePage = (): Screen => {
    if (isAdminRoute) return "regulator-dashboard";
    
    if (userRole === "farmer") return "farmer-dashboard";
    return "marketplace";
  };

  const handleBackToHome = () => {
    setInitialSearchQuery(""); // clear when navigating normally
    setCurrentScreen(getHomePage());
  };

  const handleFarmerClick = (farmerName: string) => {
    setInitialSearchQuery(farmerName);
    setCurrentScreen("marketplace");
  };

  const handleNavigate = (screen: string) => {
    if (screen === "chat") setCurrentScreen("chat");
    else if (screen === "profile") setCurrentScreen("profile");
    else if (screen === "create-listing") setCurrentScreen("create-listing");
    else if (screen === "my-listings") setCurrentScreen("my-listings");
    else if (screen === "orders") setCurrentScreen("orders");
    else if (screen === "transport") setCurrentScreen("transport");
    else if (screen === "subscription") setCurrentScreen("subscription");
    else if (screen === "support") setCurrentScreen("support");
    else if (screen === "production-planning") setCurrentScreen("production-planning");
  };

  const handlePublishProduct = async (product: Product) => {
    try {
      const productImage = product.image;

      const created = await createListing({
        title: product.name,
        description: product.description || "",
        price: product.price,
        quantity: parseInt(product.quantity.replace(/\D/g, "")) || 0,
        region: product.region,
        image: productImage,
        videoUrl: product.videoUrl
      });

      setFarmerProducts((current) => [mapListingToProduct(created), ...current]);
      setListings((current) => [mapListingToProduct(created), ...current]);
      showToast("Produit publié avec succès !", "success");
      setCurrentScreen("farmer-dashboard");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible de publier le produit", "error");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteListing(productId);
      setFarmerProducts((current) => current.filter((p) => p.id !== productId));
      setListings((current) => current.filter((p) => p.id !== productId));
      showToast("Annonce supprimée", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible de supprimer l'annonce", "error");
    }
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const updatedListing = await updateListing(product.id, {
        price: product.price,
        quantity: parseInt(product.quantity.replace(/\D/g, "")) || 0,
        image: product.image
      });
      const updatedProduct = mapListingToProduct(updatedListing);
      
      // Update local state
      setFarmerProducts((current) =>
        current.map((p) => (p.id === product.id ? updatedProduct : p))
      );
      setListings((current) =>
        current.map((p) => (p.id === product.id ? updatedProduct : p))
      );
      showToast("Produit mis à jour avec succès !", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Impossible de modifier le produit", "error");
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserRole(null);
    setUserProfile(null);
    setCurrentScreen(isAdminRoute ? "admin-login" : "welcome");
  };

  const handleAdminLoginComplete = async (role: "MODERATOR" | "SUPER_ADMIN" | "ANALYST") => {
    try {
      const profile = await fetchProfile();
      setUserProfile(profile);
      setUserName(profile.name);
      setUserRole(role.toLowerCase() as any);
      setCurrentScreen("regulator-dashboard");
    } catch {
      showToast("Erreur lors du chargement du profil", "error");
    }
  };

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-white shadow-2xl relative overflow-hidden flex flex-col">
      <OfflineBanner />

      <AnimatePresence mode="wait">
        {currentScreen === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SplashScreen />
          </motion.div>
        )}

        {currentScreen === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen
              onLogin={() => setCurrentScreen("login")}
              onSignup={() => setCurrentScreen("signup")}
              onTerms={() => setCurrentScreen("terms")}
            />
          </motion.div>
        )}

        {currentScreen === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <LoginScreen
              onComplete={handleLoginComplete}
              onBack={() => setCurrentScreen("welcome")}
              onNavigateToSignup={() => setCurrentScreen("signup")}
            />
          </motion.div>
        )}

        {currentScreen === "admin-login" && (
          <motion.div
            key="admin-login"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <AdminLoginScreen onLoginComplete={handleAdminLoginComplete} />
          </motion.div>
        )}

        {currentScreen === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <SignupFlow
              onComplete={handleSignupComplete}
              onBack={() => setCurrentScreen("welcome")}
              onNavigateToLogin={() => setCurrentScreen("login")}
            />
          </motion.div>
        )}

        {currentScreen === "terms" && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
          >
            <TermsScreen onBack={() => setCurrentScreen("welcome")} />
          </motion.div>
        )}

        {currentScreen === "marketplace" && (
          <motion.div
            key="marketplace"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <MarketplaceHome
              userName={userName}
              products={listings}
              isLoading={isLoadingListings}
              onProductClick={handleProductClick}
              onNavigate={handleNavigate}
              initialSearchQuery={initialSearchQuery}
            />
          </motion.div>
        )}

        {currentScreen === "product-detail" && selectedProduct && (
          <motion.div
            key="product-detail"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ProductDetail
              product={selectedProduct}
              onBack={handleBackToHome}
              onOrder={handleOrderClick}
              onChat={() => {
                setCurrentScreen("chat");
              }}
              onFarmerClick={handleFarmerClick}
            />
          </motion.div>
        )}

        {currentScreen === "order" && selectedProduct && (
          <motion.div
            key="order"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <OrderScreen
              product={selectedProduct}
              onBack={() => setCurrentScreen("product-detail")}
              onConfirm={handleOrderConfirm}
            />
          </motion.div>
        )}

        {currentScreen === "farmer-dashboard" && (
          <motion.div
            key="farmer-dashboard"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <FarmerDashboard
              userName={userName}
              onNavigate={handleNavigate}
              totalProducts={farmerProducts.length}
            />
          </motion.div>
        )}

        {currentScreen === "create-listing" && (
          <motion.div
            key="create-listing"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <CreateProductScreen
              onBack={() => setCurrentScreen("farmer-dashboard")}
              onPublish={handlePublishProduct}
            />
          </motion.div>
        )}

        {currentScreen === "my-listings" && (
          <motion.div
            key="my-listings"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <MyListingsScreen
              products={farmerProducts}
              onBack={() => setCurrentScreen("farmer-dashboard")}
              onCreate={() => setCurrentScreen("create-listing")}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </motion.div>
        )}

        {currentScreen === "regulator-dashboard" && (
          <motion.div
            key="regulator-dashboard"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDashboard
              userName={userName}
              onNavigate={handleNavigate}
              propRole={userRole?.toUpperCase() as "MODERATOR" | "SUPER_ADMIN" | "ANALYST" | undefined}
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {currentScreen === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ChatScreen
              onBack={handleBackToHome}
              contactName={selectedProduct?.farmer}
              contactId={selectedProduct?.farmerId}
            />
          </motion.div>
        )}

        {currentScreen === "profile" && userRole && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileScreen
              userProfile={userProfile}
              userName={userName}
              userRole={userRole}
              onBack={handleBackToHome}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          </motion.div>
        )}
        {currentScreen === "orders" && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <OrdersScreen onBack={handleBackToHome} onNavigate={handleNavigate} userRole={userRole} />
          </motion.div>
        )}
        {currentScreen === "transport" && (
          <motion.div
            key="transport"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <TransportNegotiationScreen
              onBack={handleBackToHome}
              orderCrop={selectedProduct?.name}
              orderRegion={selectedProduct?.region}
              orderQuantity={selectedProduct?.quantity}
            />
          </motion.div>
        )}
        {currentScreen === "production-planning" && (
          <motion.div
            key="production-planning"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <ProductionPlanningScreen onBack={() => setCurrentScreen("farmer-dashboard")} />
          </motion.div>
        )}
        {currentScreen === "subscription" && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <SubscriptionScreen onBack={handleBackToHome} />
          </motion.div>
        )}
        {currentScreen === "support" && (
          <motion.div
            key="support"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <SupportScreen onBack={handleBackToHome} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "987571438907-83nojnou0ks6qsc5dopu0rf5d4prf7bu.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}
