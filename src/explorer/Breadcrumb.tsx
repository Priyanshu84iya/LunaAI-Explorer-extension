import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  trail: string[];
  onNavigate: (index: number) => void;
}

export function Breadcrumb({ trail, onNavigate }: BreadcrumbProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1 px-4 sm:px-5 py-2 overflow-x-auto luna-scroll font-mono text-xs font-bold text-luna-muted border-b-[3px] border-luna-text bg-luna-surface"
    >
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={i} className="flex items-center gap-1 whitespace-nowrap">
            {i > 0 && <ChevronRight size={13} strokeWidth={3} className="opacity-60" />}
            <button
              onClick={() => onNavigate(i)}
              className={`uppercase transition-all ${isLast ? 'text-luna-text' : 'hover:text-luna-text'}`}
            >
              {item}
            </button>
          </span>
        );
      })}
    </motion.div>
  );
}
