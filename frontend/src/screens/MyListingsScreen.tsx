import { useToast } from "../components/ToastProvider";
import { Plus, Edit2, Trash2, ArrowLeft, Camera, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState, useRef } from "react";
import { Product } from "./MarketplaceHome";

interface MyListingsScreenProps {
  products: Product[];
  onBack: () => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function MyListingsScreen({
  products,
  onBack,
  onCreate,
  onEdit,
  onDelete
}: MyListingsScreenProps) {
  const { showToast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editImage, setEditImage] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB
      showToast("L'image est trop volumineuse.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onEdit({
        ...editingProduct,
        price: parseInt(editPrice) || editingProduct.price,
        quantity: editQuantity || editingProduct.quantity,
        image: editImage || editingProduct.image,
      });
      setEditingProduct(null);
    }
  };

  const startEditing = (p: Product) => {
    setEditingProduct(p);
    setEditPrice(p.price.toString());
    setEditQuantity(p.quantity.toString());
    setEditImage(p.image || "");
  };
  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl">Mes annonces</h1>
          </div>
          <button
            onClick={onCreate}
            className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl mb-2">Aucune annonce</h2>
            <p className="text-muted-foreground mb-6">
              Commencez par publier votre première annonce
            </p>
            <button
              onClick={onCreate}
              className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-xl transition-colors"
            >
              Publier une annonce
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex gap-4 p-4">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {product.region}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.quantity}
                    </p>
                    <p className="text-lg text-primary">
                      {product.price} FCFA/kg
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEditing(product)}
                      className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
          >
            <h3 className="text-lg font-bold text-gray-900">Modifier l'annonce</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Prix (FCFA/kg)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité (ex: 500 kg)</label>
                <input
                  type="text"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full text-sm p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Image du produit</label>
                <div className="flex items-center gap-4">
                  {editImage ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                      <img src={editImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border-2 border-dashed border-secondary/40 hover:border-secondary bg-secondary/5 hover:bg-secondary/10 py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium text-secondary"
                  >
                    <Camera className="w-4 h-4" />
                    Changer l'image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Supprimer l'annonce</h3>
              <p className="text-sm text-gray-500">Êtes-vous sûr de vouloir supprimer "{productToDelete.name}" ? Cette action est irréversible.</p>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  onDelete(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setProductToDelete(null)}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}

      </div>
  );
}

export type { Product };
