import { useState } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { motion } from "motion/react";

interface CreateProductScreenProps {
  onBack: () => void;
  onPublish: (product: any) => void;
}

export default function CreateProductScreen({ onBack, onPublish }: CreateProductScreenProps) {
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const cultures = [
    "Tomates",
    "Oignons",
    "Mangues",
    "Pommes de terre",
    "Salades",
    "Arachides",
    "Maïs",
    "Riz"
  ];

  const regions = [
    "Bamako",
    "Kayes",
    "Koulikoro",
    "Sikasso",
    "Ségou",
    "Mopti",
    "Tombouctou",
    "Gao"
  ];

  const handleAddImage = () => {
    const imageUrls = [
      "https://images.unsplash.com/photo-1758487405872-8e179dfe703e?w=400",
      "https://images.unsplash.com/photo-1534383346555-6cff1eaca960?w=400",
      "https://images.unsplash.com/photo-1772984613890-e3bfbca7f245?w=400"
    ];
    const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    if (images.length < 4) {
      setImages([...images, randomImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (!productName || !quantity || !price || !region) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: productName,
      quantity: `${quantity} kg disponibles`,
      price: parseInt(price),
      region,
      description,
      images,
      farmer: "Vous",
      rating: 5.0,
      certified: false
    };

    onPublish(newProduct);
  };

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl">Nouveau produit</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Culture */}
          <div>
            <label className="block text-sm mb-2">
              Culture <span className="text-red-500">*</span>
            </label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner une culture</option>
              {cultures.map((culture) => (
                <option key={culture} value={culture}>
                  {culture}
                </option>
              ))}
            </select>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm mb-2">
              Quantité estimée (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 500"
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm mb-2">
              Prix unitaire (FCFA/kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 750"
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Région */}
          <div>
            <label className="block text-sm mb-2">
              Région de production <span className="text-red-500">*</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner une région</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm mb-2">Photos du produit</label>
            <div className="grid grid-cols-2 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Produit ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <button
                  onClick={handleAddImage}
                  className="aspect-square border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ajouter</span>
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {images.length}/4 photos ajoutées
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pb-6">
            <button
              onClick={handlePublish}
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl transition-colors"
            >
              Publier l'annonce
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white border border-border hover:bg-muted text-foreground py-4 rounded-xl transition-colors"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
