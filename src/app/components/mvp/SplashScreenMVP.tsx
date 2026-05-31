import { motion } from "motion/react";
import logoMagro from "../../../imports/MAGRO.png";

export default function SplashScreenMVP() {
  return (
    <div className="h-screen bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={logoMagro}
          alt="MAGRO"
          className="w-80 max-w-[90vw]"
          style={{ mixBlendMode: 'multiply' }}
        />
      </motion.div>
    </div>
  );
}
