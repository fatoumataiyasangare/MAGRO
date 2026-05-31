import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SplashScreenMVP from "./components/mvp/SplashScreenMVP";
import LoginSignupMVP from "./components/mvp/LoginSignupMVP";
import UserRoleSelectionMVP from "./components/mvp/UserRoleSelectionMVP";
import MarketplaceHomeMVP from "./components/mvp/MarketplaceHomeMVP";
import ProductDetailMVP from "./components/mvp/ProductDetailMVP";
import OrderScreenMVP from "./components/mvp/OrderScreenMVP";
import FarmerDashboardMVP from "./components/mvp/FarmerDashboardMVP";
import CreateProductScreen from "./components/mvp/CreateProductScreen";
import MyListingsScreen from "./components/mvp/MyListingsScreen";
import ProjectorsRegulatorsScreen from "./components/mvp/ProjectorsRegulatorsScreen";
import ChatScreenMVP from "./components/mvp/ChatScreenMVP";
import ProfileScreenMVP from "./components/mvp/ProfileScreenMVP";
import OrdersScreenMVP from "./components/mvp/OrdersScreenMVP";
import { Product } from "./components/mvp/MarketplaceHomeMVP";
import {
  fetchProfile,
  logout as logoutUser,
  updateRole,
  UserProfile
} from "../services/auth";
import {
  createListing,
  deleteListing,
  fetchListings,
  fetchMyListings,
  ListingItem
} from "../services/listings";
import { placeOrder } from "../services/orders";

type Screen =
  | "splash"
  | "login"
  | "role-selection"
  | "marketplace"
  | "product-detail"
  | "order"
  | "farmer-dashboard"
  | "create-listing"
  | "my-listings"
  | "orders"
  | "regulator-dashboard"
  | "chat"
  | "profile";

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

export default function AppMVP() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [userRole, setUserRole] = useState<"buyer" | "farmer" | "regulator" | null>(null);
  const [userName, setUserName] = useState("Moussa");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [listings, setListings] = useState<Product[]>([]);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen("login");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function loadSession() {
      try {
        const profile = await fetchProfile();
        setUserProfile(profile);
        setUserName(profile.name);
        setUserRole(profile.role.toLowerCase() as "buyer" | "farmer" | "regulator");
        if (profile.role === "BUYER") {
          setCurrentScreen("marketplace");
        } else if (profile.role === "FARMER") {
          setCurrentScreen("farmer-dashboard");
        } else {
          setCurrentScreen("regulator-dashboard");
        }
      } catch {
        // no active session
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

  const handleLoginComplete = () => {
    setCurrentScreen("role-selection");
  };

  const handleRoleSelect = async (role: "buyer" | "farmer" | "regulator") => {
    setUserRole(role);

    try {
      await updateRole(role.toUpperCase() as "BUYER" | "FARMER" | "REGULATOR");
    } catch {
      // ignore role update failures, preserve UI flow
    }

    if (role === "buyer") {
      setCurrentScreen("marketplace");
    } else if (role === "farmer") {
      setCurrentScreen("farmer-dashboard");
    } else {
      setCurrentScreen("regulator-dashboard");
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen("product-detail");
  };

  const handleOrderClick = () => {
    setCurrentScreen("order");
  };

  const handleOrderConfirm = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      await placeOrder(selectedProduct.id, 10);
      alert("Commande confirmée !");
      setCurrentScreen(getHomePage());
    } catch (error) {
      alert(error instanceof Error ? error.message : "Impossible de passer la commande");
    }
  };

  const getHomePage = (): Screen => {
    if (userRole === "buyer") return "marketplace";
    if (userRole === "farmer") return "farmer-dashboard";
    return "regulator-dashboard";
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

      setFarmerProducts((current) => [...current, mapListingToProduct(created)]);
      alert("Produit publié avec succès !");
      setCurrentScreen("farmer-dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Impossible de publier le produit");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      await deleteListing(productId);
      setFarmerProducts((current) => current.filter((p) => p.id !== productId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Impossible de supprimer l'annonce");
    }
  };

  const handleEditProduct = (product: Product) => {
    alert("Fonctionnalité d'édition en cours de développement");
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserRole(null);
    setUserProfile(null);
    setCurrentScreen("login");
  };

  return (
    <div className="size-full bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SplashScreenMVP />
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
            <LoginSignupMVP onComplete={handleLoginComplete} />
          </motion.div>
        )}

        {currentScreen === "role-selection" && (
          <motion.div
            key="role-selection"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <UserRoleSelectionMVP onSelectRole={handleRoleSelect} />
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
            <MarketplaceHomeMVP
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
            <ProductDetailMVP
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
            <OrderScreenMVP
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
            <FarmerDashboardMVP
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
            <ProjectorsRegulatorsScreen
              userName={userName}
              onNavigate={handleNavigate}
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
            <ChatScreenMVP
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
            <ProfileScreenMVP
              userName={userName}
              userRole={userRole}
              onBack={handleBackToHome}
              onLogout={handleLogout}
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
            <OrdersScreenMVP onBack={handleBackToHome} />
          </motion.div>
        )}      </AnimatePresence>
    </div>
  );
}
