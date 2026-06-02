import { ArrowLeft, MessageCircle, PhoneCall, Mail, ChevronRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface SupportScreenProps {
  onBack: () => void;
}

export default function SupportScreen({ onBack }: SupportScreenProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Comment fonctionne le système d'acompte ?",
      answer: "L'acompte (généralement 30% ou 50%) est exigé pour sécuriser les commandes à fort volume ou sur une longue durée. Il est conservé sur un compte séquestre et n'est libéré qu'à la livraison."
    },
    {
      question: "Comment obtenir le badge Qualité Or ?",
      answer: "Vous devez faire une demande de certification depuis votre profil. Un expert CAA (Centre d'Appui Agricole) viendra inspecter votre production. Si votre score dépasse 80/100, vous obtenez le badge Or."
    },
    {
      question: "Que faire en cas de litige ?",
      answer: "Si une commande n'est pas conforme, vous pouvez ouvrir un litige depuis les détails de la commande. Un modérateur MAGRO instruira le dossier et rendra une décision sous 5 jours ouvrés."
    },
    {
      question: "Quand suis-je payé après une livraison ?",
      answer: "Une fois que l'acheteur confirme la bonne réception, les fonds sont libérés instantanément sur votre compte Mobile Money, déduction faite de la commission MAGRO (5 à 10%)."
    }
  ];

  const handleToggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="h-screen bg-muted flex flex-col">
      <div className="bg-primary px-6 pt-6 pb-12 text-white shadow-sm z-10">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Aide et Support</h1>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Comment pouvons-nous vous aider ?</h2>
          <p className="text-white/80 text-sm">Trouvez des réponses rapides ou contactez notre équipe.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 -mt-6">
        <div className="space-y-6">
          
          {/* Options de contact */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nous contacter</h3>
            <div className="space-y-3">
              <button 
                onClick={() => alert("Lancement de WhatsApp...")}
                className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer border border-green-100"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-semibold text-green-900">Chat WhatsApp</p>
                    <p className="text-xs text-green-700">Réponse en moins de 15 min</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-green-600" />
              </button>
              
              <button 
                onClick={() => alert("Appel en cours vers le support client...")}
                className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold text-blue-900">Assistance téléphonique</p>
                    <p className="text-xs text-blue-700">Appel gratuit (8h - 18h)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </button>

              <button 
                onClick={() => alert("Ouverture du client mail...")}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-gray-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Envoyer un email</p>
                    <p className="text-xs text-gray-500">support@magro.ml</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Foire aux questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleToggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                    <ChevronRight className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 text-sm text-muted-foreground bg-white border-t border-gray-100">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
