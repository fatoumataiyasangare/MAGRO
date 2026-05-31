import { motion } from "motion/react";
import logoMagro from "../../imports/MAGRO.png";

export default function SplashScreen() {
  return (
    <div className="h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 300C240 350 480 250 720 300C960 350 1200 250 1440 300V900H0V300Z"
          fill="#A5D6A7"
          opacity="0.2"
        />
        <path
          d="M0 450C240 500 480 400 720 450C960 500 1200 400 1440 450V900H0V450Z"
          fill="#66BB6A"
          opacity="0.15"
        />
      </svg>

      <motion.div
        className="relative z-10 text-center px-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <img
            src={logoMagro}
            alt="MAGRO"
            className="w-80 max-w-full mx-auto mb-6"
            style={{ mixBlendMode: 'multiply' }}
          />
          <p className="text-white/90 text-lg tracking-wide">Mali & Agronomie</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
