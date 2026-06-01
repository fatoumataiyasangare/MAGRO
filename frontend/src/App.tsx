import { useEffect, useState } from "react";
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
import ProjectorsRegulatorsScreen from "./screens/ProjectorsRegulatorsScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import OrdersScreen from "./screens/OrdersScreen";
import TransportNegotiationScreen from "./screens/TransportNegotiationScreen";
import ProductionPlanningScreen from "./screens/ProductionPlanningScreen";
import OfflineBanner from "./components/OfflineBanner";
import { ToastProvider, useToast } from "./components/ToastProvider";
import { Product } from "./screens/MarketplaceHome";
import {
  fetchProfile,
  logout as logoutUser,
  updateRole,
  UserProfile
} from "./services/auth";
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
  | "signup"
  | "marketplace"
  | "product-detail"
  | "order"
  | "farmer-dashboard"
  | "create-listing"
  | "my-listings"
  | "orders"
  | "chat"
  | "profile"
  | "transport"
  | "production-planning"
  | "terms";

function mapListingToProduct(listing: ListingItem): Product {
  return {
    id: listing.id,
    name: listing.title,
    image: listing.image,
    price: listing.price,
    quantity: `${listing.quantity} kg disponibles`,
    region: listing.region,
    farmer: listing.farmer?.name || "Votre ferme",
    rating: 4.7,
    certified: false
  };
}

function AppContent() {
  const { showToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [userRole, setUserRole] = useState<"buyer" | "farmer" | "regulator" | null>(null);
  const [userName, setUserName] = useState("Moussa");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const profile = await fetchProfile();
        setUserProfile(profile);
        setUserName(profile.name);
        setUserRole(profile.role.toLowerCase() as "buyer" | "farmer" | "regulator");
        
        // Wait for splash screen
        setTimeout(() => {
          if (profile.role === "BUYER") {
            setCurrentScreen("marketplace");
          } else if (profile.role === "FARMER") {
            setCurrentScreen("farmer-dashboard");
          } else {
            setCurrentScreen("regulator-dashboard");
          }
        }, 1500);
      } catch {
        // no active session, go to welcome screen
        setTimeout(() => {
          setCurrentScreen("welcome");
        }, 1500);
      }
    }

    loadSession();
  }, []);

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await fetchListings();
        setListings(data.map(mapListingToProduct));
      } catch {
        // ignore load errors for UI
      }
    }

    async function loadMyListings() {
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
      const role = profile.role.toLowerCase() as "buyer" | "farmer";
      setUserRole(role);
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
    if (userRole === "buyer") return "marketplace";
    if (userRole === "farmer") return "farmer-dashboard";
    return "marketplace";
  };

  const handleBackToHome = () => {
    setCurrentScreen(getHomePage());
  };

  const handleNavigate = (screen: string) => {
    if (screen === "chat") {
      setCurrentScreen("chat");
    } else if (screen === "profile") {
      setCurrentScreen("profile");
    } else if (screen === "create-listing") {
      setCurrentScreen("create-listing");
    } else if (screen === "my-listings") {
      setCurrentScreen("my-listings");
    } else if (screen === "orders") {
      setCurrentScreen("orders");
    }
  };

  const handlePublishProduct = async (product: Product) => {
    try {
      const created = await createListing({
        title: product.name,
        description: "",
        price: product.price,
        quantity: parseInt(product.quantity.replace(/\D/g, "")) || 0,
        region: product.region,
        image: product.image
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

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
        quantity: parseInt(product.quantity.replace(/\D/g, "")) || 0
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
    setCurrentScreen("welcome");
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
            />
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
              products={listings}
              onProductClick={handleProductClick}
              onNavigate={handleNavigate}
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
              onChat={() => setCurrentScreen("chat")}
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

        {/* Regulator dashboard removed from public app */}

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
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
