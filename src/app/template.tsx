"use client";

import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0 },
};

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="enter"
      transition={{ 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        duration: 0.5
      }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
