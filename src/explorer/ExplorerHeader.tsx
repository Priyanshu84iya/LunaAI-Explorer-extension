import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ExplorerHeaderProps {
  onClose: () => void;
}

export function ExplorerHeader({ onClose }: ExplorerHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-[3px] border-luna-text bg-luna-accent"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex items-center justify-center w-7 h-7 border-[3px] border-luna-text bg-luna-surface text-sm font-black shrink-0">
          ✦
        </span>
        <span className="font-display font-black text-sm sm:text-base tracking-tight uppercase whitespace-nowrap">
          LunaAI Explorer
        </span>
        <span className="hidden sm:inline font-mono text-[10px] font-bold uppercase tracking-widest border-[2px] border-luna-text bg-luna-surface px-1.5 py-0.5">
          by AshnaAI
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="luna-brutal-btn flex items-center justify-center w-9 h-9 bg-luna-error text-luna-text hover:bg-luna-error"
          title="Close"
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
}
