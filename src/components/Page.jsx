import { motion } from 'framer-motion'
export default function Page({ children, className = '' }) {
  return (
    <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className={`relative z-10 ${className}`}>
      {children}
    </motion.main>
  )
}
