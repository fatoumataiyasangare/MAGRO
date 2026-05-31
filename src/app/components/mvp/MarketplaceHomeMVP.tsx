import { useState } from "react";
import { Search, Filter, MapPin, Star, User, MessageCircle, Home as HomeIcon } from "lucide-react";
import { motion } from "motion/react";

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

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-border">
        <h1 className="text-2xl mb-4">MAGRO</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full pl-12 pr-12 py-3 bg-muted border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
        <div className="space-y-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              onClick={() => onProductClick(product)}
              className="bg-white rounded-2xl overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
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
                    <h3 className="text-lg mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{product.region}</span>
                      {product.certified && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full ml-2">
                          🟢 Vérifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{product.quantity}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl text-primary">{product.price} FCFA</p>
                    <p className="text-xs text-muted-foreground">par kg</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm mb-1">{product.farmer}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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
