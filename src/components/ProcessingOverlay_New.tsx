import { useState, useEffect } from 'react';
import { Download, Fingerprint, Search, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface ProcessingOverlayProps {
    isOpen: boolean;
    stage?: 'extracting' | 'identifying' | 'syncing' | 'error';
    statusText?: string;
    error?: string;
    onClose?: () => void;
}

export function ProcessingOverlay({
    isOpen,
    stage: manualStage,
    statusText,
    error,
    onClose
}: ProcessingOverlayProps) {
    const [progress, setProgress] = useState(0);

    // Map statusText to stage if stage isn't directly provided
    let stage: 'extracting' | 'identifying' | 'syncing' | 'error' = manualStage || 'extracting';
    if (statusText) {
        if (statusText.includes('Download') || statusText.includes('Extract')) stage = 'extracting';
        else if (statusText.includes('Identify') || statusText.includes('Recognize')) stage = 'identifying';
        else if (statusText.includes('Sync') || statusText.includes('Add')) stage = 'syncing';
    }
    if (error) stage = 'error';

    const stages = [
        {
            id: 'extracting',
            label: 'Extracting Audio',
            icon: Download,
            color: 'text-emerald-400'
        },
        {
            id: 'identifying',
            label: 'Identifying Song',
            icon: Fingerprint,
            color: 'text-purple-400'
        },
        {
            id: 'syncing',
            label: 'Syncing Spotify',
            icon: Search,
            color: 'text-[#1DB954]'
        },
    ];

    const currentStageIndex = stages.findIndex(s => s.id === stage);

    useEffect(() => {
        if (!isOpen || stage === 'error') {
            setProgress(0);
            return;
        }

        // Progress simulation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const targetProgress = ((currentStageIndex + 1) / stages.length) * 100;
                if (prev >= targetProgress) return prev;
                return prev + Math.random() * 5;
            });
        }, 200);

        return () => clearInterval(progressInterval);
    }, [isOpen, stage, currentStageIndex, stages.length]);

    if (!isOpen) return null;

    const isError = stage === 'error';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl">
            <div className="max-w-md w-full mx-4">
                {/* Pulsing Core Icon */}
                <div className="relative flex items-center justify-center mb-12">
                    {/* Rotating Border Rings */}
                    <motion.div
                        className={`absolute w-32 h-32 rounded-full ${isError ? 'border-2 border-red-500/30' : 'border-2 border-[#1DB954]/30'
                            }`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                        className={`absolute w-40 h-40 rounded-full ${isError ? 'border border-red-500/20' : 'border border-emerald-500/20'
                            }`}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Ping Animation */}
                    {!isError && (
                        <>
                            <motion.div
                                className="absolute w-32 h-32 rounded-full bg-[#1DB954]/20"
                                animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute w-32 h-32 rounded-full bg-emerald-500/20"
                                animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            />
                        </>
                    )}

                    {/* Center Music Icon */}
                    <motion.div
                        className={`relative w-24 h-24 rounded-full flex items-center justify-center ${isError
                                ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/40'
                                : 'bg-gradient-to-br from-[#1DB954]/20 to-emerald-500/20 border border-[#1DB954]/40'
                            }`}
                        animate={!isError ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Music className={`w-12 h-12 ${isError ? 'text-red-500' : 'text-[#1DB954]'}`} />
                    </motion.div>
                </div>

                {/* Error Message or Stepper */}
                {isError ? (
                    <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold text-red-500">
                            {error || 'Something went wrong'}
                        </h3>
                        <p className="text-sm text-gray-400">
                            Please try again with a different link
                        </p>
                        {onClose && (
                            <button
                                className="mt-6 px-8 py-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Visual Stepper */}
                        <div className="space-y-6 mb-8">
                            {stages.map((stageItem, index) => {
                                const Icon = stageItem.icon;
                                const isActive = index === currentStageIndex;
                                const isCompleted = index < currentStageIndex;

                                return (
                                    <motion.div
                                        key={stageItem.id}
                                        className="flex items-center gap-4"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.2 }}
                                    >
                                        {/* Icon Circle */}
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isActive
                                                    ? `${stageItem.color} border-current bg-current/10 scale-110 shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                                                    : isCompleted
                                                        ? 'border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954]'
                                                        : 'border-gray-700 bg-gray-800/50 text-gray-600'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>

                                        {/* Label */}
                                        <div className="flex-1">
                                            <p
                                                className={`font-medium transition-colors ${isActive
                                                        ? 'text-white'
                                                        : isCompleted
                                                            ? 'text-gray-300'
                                                            : 'text-gray-600'
                                                    }`}
                                            >
                                                {stageItem.label}
                                            </p>
                                        </div>

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <motion.div
                                                className="w-2 h-2 rounded-full bg-[#1DB954]"
                                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1DB954] to-emerald-400"
                                initial={{ width: '0%' }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 0.5 }}
                            />
                            {/* Shimmer Effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>

                        {/* Status Text */}
                        <p className="text-center text-xs text-gray-500 mt-6 tracking-wide">
                            {statusText || 'This usually takes a few seconds...'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
