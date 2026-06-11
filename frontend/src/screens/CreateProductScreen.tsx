import { useToast } from "../components/ToastProvider";
import { useState, useRef } from "react";
import { ArrowLeft, Upload, X, Image, Camera, Video } from "lucide-react";
import { motion } from "motion/react";

interface CreateProductScreenProps {
  onBack: () => void;
  onPublish: (product: any) => void | Promise<void>;
}

export default function CreateProductScreen({ onBack, onPublish }: CreateProductScreenProps) {
  const { showToast } = useToast();
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cultures = [
    "Tomates", "Oignons", "Mangues", "Pommes de terre",
    "Salades", "Arachides", "Maïs", "Riz", "Mil", "Sorgho",
    "Haricots", "Piment", "Pastèques", "Aubergines"
  ];

  const regions = [
    "Bamako", "Kayes", "Koulikoro", "Sikasso",
    "Ségou", "Mopti", "Tombouctou", "Gao", "Kidal", "Taoudénit", "Ménaka"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 4 - images.length;
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      // Check size for video (max 50MB)
      if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) {
        showToast("La vidéo est trop volumineuse. La taille maximum est de 50 Mo (environ 1 minute).", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImages((prev) => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!productName || !quantity || !price || !region) {
      showToast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    setIsLoading(true);
    try {
      const firstImage = images[0] || "";
      await onPublish({
        id: "pending",
        name: productName,
        title: productName,
        quantity: `${quantity} kg disponibles`,
        price: parseInt(price),
        region,
        description,
        images,
        image: firstImage,
        farmer: "Vous",
        rating: 5.0,
        certified: false,
        videoUrl: videoUrl.trim() || undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-muted flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="cursor-pointer hover:bg-gray-100 rounded-lg p-1 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Nouveau produit</h1>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Photos du produit - REAL UPLOAD */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photos du produit <span className="text-muted-foreground font-normal">(max 4)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  {image.startsWith("data:video/") || image.endsWith(".mp4") ? (
                    <video
                      src={image}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={image}
                      alt={`Produit ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-secondary/40 hover:border-secondary bg-secondary/5 hover:bg-secondary/10 rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-xs font-medium text-secondary">Ajouter média</span>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Image className="w-3 h-3" />
              {images.length}/4 photos • Depuis votre galerie ou caméra
            </p>
          </div>

          {/* Culture */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Culture <span className="text-red-500">*</span>
            </label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">Sélectionner une culture</option>
              {cultures.map((culture) => (
                <option key={culture} value={culture}>{culture}</option>
              ))}
            </select>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Quantité estimée (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 500"
              min="1"
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Prix unitaire (FCFA/kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 750"
              min="1"
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Région */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Région de production <span className="text-red-500">*</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">Sélectionner une région</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          {/* Vidéo de présentation */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <span className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Vidéo de présentation
                <span className="text-muted-foreground font-normal text-xs">(optionnel — max 1 min)</span>
              </span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Lien YouTube, TikTok ou autre... (ex: https://youtube.com/watch?v=...)"
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Collez un lien vers une vidéo de max 1 minute montrant votre produit ou votre champ.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit, sa qualité, vos pratiques agricoles..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="space-y-3 pb-6">
            <button
              onClick={handlePublish}
              disabled={isLoading || !productName || !quantity || !price || !region}
              className="w-full bg-secondary hover:bg-secondary/90 active:scale-[0.98] text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publication...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Publier l'annonce
                </>
              )}
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white border border-border hover:bg-muted text-foreground py-4 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
