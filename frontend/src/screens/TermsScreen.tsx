import { motion } from "motion/react";
import { ArrowLeft, Shield, FileText, Scale, Lock } from "lucide-react";

interface TermsScreenProps {
  onBack: () => void;
}

export default function TermsScreen({ onBack }: TermsScreenProps) {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-4 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Conditions d'Utilisation</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentions Légales & CGU</h2>
            <p className="text-muted-foreground text-sm">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-gray-900">1. Objet de la Plateforme</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              MAGRO est une place de marché agricole numérique facilitant la mise en relation sécurisée entre agriculteurs (producteurs) et acheteurs professionnels (commerçants, industriels, institutions) au Mali. MAGRO n'est ni propriétaire ni vendeur des produits listés.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-gray-900">2. Frais et Paiements Sécurisés</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              MAGRO applique une politique stricte de paiement séquestré. Les fonds de l'acheteur sont bloqués et ne sont libérés à l'agriculteur qu'après confirmation de la livraison conforme. En contrepartie du service, MAGRO prélève une commission de mise en relation fixée lors de la signature du contrat final ou spécifiée sur la facture.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-gray-900">3. Litiges et Médiation</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              En cas de non-conformité de la marchandise signalée dans les 48 heures suivant la livraison, MAGRO bloque les fonds et initie une procédure de médiation via son Régulateur indépendant. MAGRO se réserve le droit d'exiger des preuves photographiques et documentaires avant de trancher sur un litige (remboursement partiel, total, ou rejet).
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">4. Responsabilités</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
              Les agriculteurs s'engagent à fournir des informations exactes sur leurs produits et leurs certifications. MAGRO se décharge de toute responsabilité en cas de fausse déclaration, mais sanctionnera les utilisateurs frauduleux (bannissement définitif).
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
