import { Plus, Edit } from "lucide-react";
import { motion } from "motion/react";

interface MyListingsProps {
  onCreateListing: () => void;
  onEditListing: (id: string) => void;
}

export default function MyListings({ onCreateListing, onEditListing }: MyListingsProps) {
  const listings = [
    {
      id: "1",
      crop: "Tomates fraîches",
      image: "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?w=200",
      remaining: 340,
      total: 500,
      price: 750,
      dateRange: "15 mai - 30 juin",
      status: "published",
      badge: "premium"
    },
    {
      id: "2",
      crop: "Oignons blancs",
      image: "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?w=200",
      remaining: 800,
      total: 800,
      price: 500,
      dateRange: "1 juin - 15 juil",
      status: "published",
      badge: "good"
    }
  ];

  return (
    <div className="h-screen bg-muted flex flex-col pb-20">
      <div className="bg-white border-b border-border px-6 py-4">
        <h1 className="text-xl">Mes annonces</h1>
      </div>

      <div className="px-6 py-4">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button className="px-4 py-2 bg-primary text-white rounded-full text-sm whitespace-nowrap">
            Toutes
          </button>
          <button className="px-4 py-2 bg-white border border-border rounded-full text-sm whitespace-nowrap">
            Publiées
          </button>
          <button className="px-4 py-2 bg-white border border-border rounded-full text-sm whitespace-nowrap">
            Brouillons
          </button>
          <button className="px-4 py-2 bg-white border border-border rounded-full text-sm whitespace-nowrap">
            Épuisées
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-4">
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              className="bg-white rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex gap-4 p-4">
                <img
                  src={listing.image}
                  alt={listing.crop}
                  className="w-24 h-24 object-cover rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base">{listing.crop}</h3>
                        {listing.badge === "premium" && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                            🟡 Or
                          </span>
                        )}
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Stock restant</span>
                          <span>{listing.remaining}kg / {listing.total}kg</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(listing.remaining / listing.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-primary text-lg mb-1">{listing.price} FCFA/kg</p>
                      <p className="text-xs text-muted-foreground">{listing.dateRange}</p>
                    </div>
                    <button
                      onClick={() => onEditListing(listing.id)}
                      className="ml-2 p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <button
        onClick={onCreateListing}
        className="fixed bottom-24 right-6 w-14 h-14 bg-secondary rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
