import { useState } from "react";
import { Search, Filter, Star, MapPin, ShoppingCart, User, MessageCircle, Home } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoMagro from "../../imports/MAGRO.png";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: string;
  region: string;
  image: string;
  rating: number;
  verified: boolean;
  quality: "premium" | "good" | null;
  farmer: string;
}

interface HomeScreenProps {
  onProductClick: (product: Product) => void;
  onNavigate: (screen: string) => void;
}

const products: Product[] = [
  {
    id: "1",
    name: "Tomates fraîches",
    price: 750,
    quantity: "500 kg disponibles",
    region: "Sikasso",
    image: "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHRvbWF0b2VzJTIwdmVnZXRhYmxlcyUyMGZhcm18ZW58MXx8fHwxNzc1OTk3ODU2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    verified: true,
    quality: "premium",
    farmer: "Amadou Traoré"
  },
  {
    id: "2",
    name: "Oignons blancs",
    price: 500,
    quantity: "800 kg disponibles",
    region: "Kayes",
    image: "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbnMlMjB2ZWdldGFibGVzJTIwbWFya2V0fGVufDF8fHx8MTc3NTk5Nzg1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.5,
    verified: true,
    quality: "good",
    farmer: "Fatoumata Keita"
  },
  {
    id: "3",
    name: "Mangues Kent",
    price: 1200,
    quantity: "300 kg disponibles",
    region: "Koulikoro",
    image: "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtYW5nbyUyMGZydWl0JTIwdHJvcGljYWx8ZW58MXx8fHwxNzc1OTk3ODU3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    verified: true,
    quality: "premium",
    farmer: "Ibrahim Coulibaly"
  },
  {
    id: "4",
    name: "Tomates cerises",
    price: 900,
    quantity: "200 kg disponibles",
    region: "Bamako",
    image: "https://images.unsplash.com/photo-1601078130531-934965191641?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxmcmVzaCUyMHRvbWF0b2VzJTIwdmVnZXRhYmxlcyUyMGZhcm18ZW58MXx8fHwxNzc1OTk3ODU2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.6,
    verified: false,
    quality: null,
    farmer: "Mamadou Diarra"
  }
];

export default function HomeScreen({ onProductClick, onNavigate }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState("home");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="bg-primary text-white px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img
              src={logoMagro}
              alt="MAGRO"
              className="h-10"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <button
            onClick={() => onNavigate("cart")}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des produits..."
            className="w-full pl-12 pr-4 py-3 bg-white text-foreground rounded-xl focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-border overflow-x-auto">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full whitespace-nowrap"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtres</span>
        </button>
        <button className="px-4 py-2 bg-primary text-white rounded-full text-sm whitespace-nowrap">
          Tous
        </button>
        <button className="px-4 py-2 bg-muted rounded-full text-sm whitespace-nowrap">
          Légumes
        </button>
        <button className="px-4 py-2 bg-muted rounded-full text-sm whitespace-nowrap">
          Fruits
        </button>
        <button className="px-4 py-2 bg-muted rounded-full text-sm whitespace-nowrap">
          Céréales
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Produits disponibles</h2>
          <span className="text-sm text-muted-foreground">{products.length} produits</span>
        </div>

        <div className="space-y-4 pb-24">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onProductClick(product)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {product.quality && (
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                      product.quality === "premium" ? "bg-yellow-500" : "bg-gray-400"
                    }`}>
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base truncate">{product.name}</h3>
                    {product.verified && (
                      <div className="flex-shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Vérifié
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{product.region}</span>
                    <span className="mx-1">•</span>
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs">{product.rating}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{product.quantity}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg text-primary">{product.price} FCFA/kg</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "home" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Accueil</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("chat");
              onNavigate("chat");
            }}
            className={`flex flex-col items-center gap-1 ${
              activeTab === "chat" ? "text-primary" : "text-muted-foreground"
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
              activeTab === "profile" ? "text-primary" : "text-muted-foreground"
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

export { type Product };
