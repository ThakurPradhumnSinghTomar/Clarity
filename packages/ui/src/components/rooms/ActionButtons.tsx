import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE }}
      onClick={onClick}
      disabled={loading}
      className="
        flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border
        bg-white/70 dark:bg-[#151B22]/70
        border-[#CBD5E1] dark:border-[#334155]
        text-[#0F172A] dark:text-[#E6EDF3]
        disabled:opacity-60
      "
    >
      {loading ? <Loader2 className="animate-spin" /> : <Icon size={20} />}
      {label}
    </motion.button>
  );
}