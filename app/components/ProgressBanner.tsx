'use client';

import { motion } from 'framer-motion';

export default function ProgressBanner({ message }: { message: string }) {
    if (!message) return null;

    return (
        <div className="fixed top-0 left-0 w-full overflow-hidden bg-blue-600 z-[100] h-8 flex items-center">
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: '-100%' }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="whitespace-nowrap text-white text-xs font-semibold uppercase tracking-widest px-4"
            >
                {message} • {message} • {message} • {message} • {message} • {message}
            </motion.div>
        </div>
    );
}
