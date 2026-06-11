import { X, Shield, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export type PolicyType = "terms" | "privacy" | null;

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
}

const TERMS_CONTENT = {
  title: "Conditions d'utilisation",
  icon: FileText,
  sections: [
    {
      heading: "1. Acceptation des conditions",
      text: "En vous inscrivant sur MAGRO, vous acceptez les présentes conditions d'utilisation dans leur intégralité. MAGRO est une plateforme numérique qui met en relation agriculteurs et acheteurs professionnels au Mali."
    },
    {
      heading: "2. Utilisation du service",
      text: "Vous vous engagez à utiliser MAGRO uniquement à des fins légales et conformément aux lois maliennes. Toute tentative de fraude, de falsification ou d'usurpation d'identité entraînera la suspension immédiate de votre compte."
    },
    {
      heading: "3. Responsabilité des annonces",
      text: "Les agriculteurs sont responsables de l'exactitude des informations publiées (quantités, prix, qualité). MAGRO n'est pas responsable des litiges commerciaux entre utilisateurs, bien que nous proposions un service de médiation."
    },
    {
      heading: "4. Paiements et transactions",
      text: "MAGRO facilite les transactions via des mécanismes de séquestre sécurisés. Les paiements ne sont libérés qu'après confirmation de livraison par l'acheteur. MAGRO perçoit une commission de 2% sur chaque transaction."
    },
    {
      heading: "5. Modification des conditions",
      text: "MAGRO se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés par SMS ou notification in-app au moins 7 jours avant toute modification importante."
    }
  ]
};

const PRIVACY_CONTENT = {
  title: "Politique de confidentialité",
  icon: Shield,
  sections: [
    {
      heading: "1. Données collectées",
      text: "MAGRO collecte votre numéro de téléphone, votre nom, votre région et les données relatives à vos transactions agricoles. Ces données sont nécessaires au fonctionnement du service."
    },
    {
      heading: "2. Utilisation des données",
      text: "Vos données sont utilisées pour : vous connecter à la plateforme, afficher vos annonces et commandes, vous envoyer des notifications importantes (OTP, livraisons, litiges) et améliorer nos services."
    },
    {
      heading: "3. Partage des données",
      text: "Vos coordonnées (nom, région) sont visibles par les utilisateurs qui consultent vos annonces. Votre numéro de téléphone n'est partagé qu'avec les parties prenantes d'une transaction confirmée."
    },
    {
      heading: "4. Sécurité",
      text: "Vos données sont chiffrées en transit (HTTPS) et au repos. L'accès à la plateforme est sécurisé via OTP à usage unique. Nous ne stockons jamais vos mots de passe."
    },
    {
      heading: "5. Vos droits",
      text: "Conformément à la loi malienne sur la protection des données, vous avez le droit d'accéder à vos données, de les corriger ou de les supprimer. Contactez-nous à : privacy@magro.ml"
    }
  ]
};

export function PolicyModal({ type, onClose }: PolicyModalProps) {
  const content = type === "terms" ? TERMS_CONTENT : type === "privacy" ? PRIVACY_CONTENT : null;

  return (
    <AnimatePresence>
      {type && content && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />

            <div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <content.icon className="w-5 h-5 text-secondary" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{content.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {content.sections.map((section, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{section.heading}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.text}</p>
                </div>
              ))}
              <div className="h-4" />
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="w-full bg-secondary text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-secondary/90 active:scale-[0.98] transition-all cursor-pointer"
              >
                J'ai compris
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
