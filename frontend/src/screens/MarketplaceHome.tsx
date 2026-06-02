import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, User, MessageCircle, Home as HomeIcon, Bell, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { createAlert } from "../services/alerts";
import { fetchCertificationRequests } from "../services/certifications";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: string;
  region: string;
  farmer: string;
  rating: number;
  certified: boolean;
}

interface MarketplaceHomeMVPProps {
  products?: Product[];
  onProductClick: (product: Product) => void;
  onNavigate: (screen: string) => void;
}

export default function MarketplaceHomeMVP({ products: externalProducts, onProductClick, onNavigate }: MarketplaceHomeMVPProps) {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertCrop, setAlertCrop] = useState("Mangues Kent");
  const [alertRegion, setAlertRegion] = useState("Koulikoro");
  const [activeCategory, setActiveCategory] = useState("Tous");
  
  // List of actual quality badges from certifications database
  const [certs, setCerts] = useState<any[]>([]);

  useEffect(() => {
    fetchCertificationRequests()
      .then(data => setCerts(data))
      .catch(err => console.error(err));
  }, []);

  const getBadgeForProduct = (product: Product) => {
    // Look up in certifications database
    const match = certs.find(
      c => c.status === "ACTIVE" && 
      (c.cropName.toLowerCase().includes(product.name.toLowerCase()) || 
       product.name.toLowerCase().includes(c.cropName.toLowerCase()))
    );

    if (match) {
      if (match.badgeLevel === "GOLD") {
        return { label: "Or – Premium", color: "bg-amber-100 text-amber-800 border-amber-300 border font-semibold", icon: "🟡" };
      }
      return { label: "Argent – Qualité", color: "bg-gray-100 text-gray-800 border-gray-300 border", icon: "⚪" };
    }

    if (product.certified) {
      return { label: "Vert – Vérifié", color: "bg-green-100 text-green-800 border-green-300 border", icon: "🟢" };
    }

    return null;
  };

  const handleCreateAlert = async () => {
    try {
      await createAlert(alertCrop, alertRegion);
      alert(`Alerte de disponibilité enregistrée ! Vous serez notifié par push/SMS dès que des ${alertCrop} seront publiées à ${alertRegion}.`);
      setShowAlertDialog(false);
    } catch (err) {
      alert("Erreur lors de la création de l'alerte.");
    }
  };

  const products: Product[] = externalProducts ?? [
    {
      id: "1",
      name: "Tomates fraîches",
      image: "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?w=400",
      price: 750,
      quantity: "500 kg disponibles",
      region: "Sikasso",
      farmer: "Amadou Traoré",
      rating: 4.8,
      certified: true
    },
    {
      id: "2",
      name: "Oignons blancs",
      image: "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?w=400",
      price: 500,
      quantity: "800 kg disponibles",
      region: "Kayes",
      farmer: "Fatoumata Keita",
      rating: 4.5,
      certified: false
    },
    {
      id: "3",
      name: "Mangues Kent",
      image: "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?w=400",
      price: 1200,
      quantity: "300 kg disponibles",
      region: "Koulikoro",
      farmer: "Ibrahim Coulibaly",
      rating: 4.9,
      certified: true
    }
  ];

  const categories = [
    { label: "Tous", emoji: "🛒" },
    { label: "Légumes", emoji: "🍅", keywords: ["tomate", "oignon", "aubergine", "chou", "carotte", "laitue", "piment", "gombo"] },
    { label: "Fruits", emoji: "🥭", keywords: ["mangue", "banane", "orange", "papaye", "pastèque", "citron", "ananas"] },
    { label: "Céréales", emoji: "🌾", keywords: ["riz", "mil", "sorgho", "maïs", "blé", "fonio"] },
    { label: "Légumineuses", emoji: "🫘", keywords: ["arachide", "niébé", "haricot", "soja", "pois"] },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === "Tous") return matchesSearch;
    
    const cat = categories.find(c => c.label === activeCategory);
    if (!cat || !cat.keywords) return matchesSearch;
    
    const matchesCategory = cat.keywords.some(kw =>
      p.name.toLowerCase().includes(kw)
    );
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">MAGRO</h1>
          <button
            onClick={() => setShowAlertDialog(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-2 rounded-xl"
            title="S'abonner à une alerte de disponibilité"
          >
            <Bell className="w-4 h-4" />
            <span>Alerte</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher tomates, oignons, régions..."
            className="w-full pl-12 pr-12 py-3 bg-muted border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white px-6 py-3 border-b border-border">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat.label
                  ? "bg-secondary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-24">
        <div className="space-y-4">
          {filteredProducts.length === 0 && searchQuery === "" ? (
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={`skeleton-${i}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 animate-pulse rounded-md w-1/2" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded-md w-1/3" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded-md w-1/4" />
                  <div className="flex justify-between pt-2">
                    <div className="h-6 bg-gray-200 animate-pulse rounded-md w-1/4" />
                    <div className="h-4 bg-gray-200 animate-pulse rounded-md w-1/5" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            filteredProducts.map((product, index) => {
            const badge = getBadgeForProduct(product);
            return (
              <motion.div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="bg-white rounded-2xl overflow-hidden active:scale-[0.98] hover:scale-[1.02] hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm border border-border"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {product.region}
                        </span>
                        
                        {/* 3-level quality badges rendering */}
                        {badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                            {badge.icon} {badge.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{product.quantity}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">{product.price} FCFA</p>
                      <p className="text-[10px] text-muted-foreground">par kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-800 mb-1">{product.farmer}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          }))}
        </div>
      </div>

      {/* Availability Alert Setup Modal */}
      <AnimatePresence>
        {showAlertDialog && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-xl"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Créer une alerte de disponibilité
              </h3>
              <p className="text-xs text-muted-foreground">
                Soyez alerté en priorité dès qu'une nouvelle récolte correspondant à vos critères est publiée par un agriculteur.
              </p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Culture</label>
                  <input
                    type="text"
                    value={alertCrop}
                    onChange={(e) => setAlertCrop(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Ex: Oignons, Riz, Tomates..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Région</label>
                  <select
                    value={alertRegion}
                    onChange={(e) => setAlertRegion(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none"
                  >
                    <option value="Sikasso">Sikasso</option>
                    <option value="Koulikoro">Koulikoro</option>
                    <option value="Ségou">Ségou</option>
                    <option value="Kayes">Kayes</option>
                    <option value="Bamako">Bamako</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 bg-primary hover:bg-primary/95 text-white text-xs py-3 rounded-xl font-bold transition-colors"
                >
                  Enregistrer l'alerte
                </button>
                <button
                  onClick={() => setShowAlertDialog(false)}
                  className="bg-gray-100 text-gray-700 text-xs px-4 py-3 rounded-xl font-bold hover:bg-gray-200"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "home" ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs">Accueil</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("orders");
              onNavigate("orders");
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "orders" ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            <Award className="w-6 h-6" />
            <span className="text-xs">Commandes</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("chat");
              onNavigate("chat");
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "chat" ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("profile");
              onNavigate("profile");
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "profile" ? "text-secondary" : "text-muted-foreground"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Product };
