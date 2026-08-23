import { motion } from 'framer-motion';
import type { StageUpdate } from '../ai/types';

interface LoadingExperienceProps {
  stage: StageUpdate;
}

export function LoadingExperience({ stage }: LoadingExperienceProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center w-20 h-20 mb-6 border-[3px] border-luna-text bg-luna-accent shadow-brutal text-4xl"
      >
        ✦
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-luna-muted mb-3"
      >
        Thinking...
      </motion.p>

      <motion.h2
        key={stage.stage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-luna-text"
      >
        {stage.message}
      </motion.h2>

      <div className="w-64 sm:w-80 mt-6 border-[3px] border-luna-text bg-luna-surface shadow-brutal p-1">
        <motion.div
          className="h-4 bg-luna-accent2"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.4, ease: 'easeInOut' }}
        />
      </div>

      <div className="mt-6 border-[3px] border-luna-text bg-luna-surface shadow-brutal px-4 py-2">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-luna-text">
          Powered by AshnaAI
        </p>
      </div>
    </div>
  );
}
