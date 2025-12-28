import React from 'react';
import { Music, CheckCircle2, Download, Fingerprint, Search } from 'lucide-react';

interface ProcessingOverlayProps {
    status: string;
}

export function ProcessingOverlay({ status }: ProcessingOverlayProps) {
    // Determine the current step based on status string
    const getStep = () => {
        if (!status) return 0;
        const s = status.toLowerCase();
        if (s.includes("downloading") || s.includes("extracting")) return 0;
        if (s.includes("identifying") || s.includes("analyzing")) return 1;
        if (s.includes("matching") || s.includes("spotify")) return 2;
        return 1;
    };

    const currentStep = getStep();

    const steps = [
        { label: "Extracting Audio", icon: Download },
        { label: "Identifying Song", icon: Fingerprint },
        { label: "Syncing Spotify", icon: Search },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Ultra-Heavy Backdrop Blur for Focus */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />

            <div className="relative glass-card bg-zinc-900/40 border border-white/10 p-10 md:p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5 max-w-[340px] w-full text-center space-y-8 overflow-hidden">

                {/* Magical Glow Background */}
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#1DB954]/20 rounded-full blur-[80px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none animate-pulse delay-500" />

                {/* Pulsing Music Core - Larger & More Minimal */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#1DB954]/20 rounded-full animate-ping duration-[3000ms]" />
                    <div className="absolute inset-2 border border-[#1DB954]/30 rounded-full animate-spin duration-[5000ms]" />
                    <div className="w-16 h-16 bg-[#1DB954] rounded-[1.5rem] flex items-center justify-center shadow-[0_0_30px_rgba(29,185,84,0.4)] animate-bounce relative z-10">
                        <Music className="text-black w-7 h-7" />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <h2 className="text-2xl font-black text-white tracking-tighter">
                        Magical Recovery
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse" />
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                            {status}
                        </p>
                    </div>
                </div>

                {/* Progress Visualizer */}
                <div className="space-y-6">
                    {/* Visual Stepper */}
                    <div className="flex justify-between items-center relative gap-4">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isCompleted = idx < currentStep;
                            const isActive = idx === currentStep;

                            return (
                                <div key={idx} className="flex flex-col items-center gap-2.5 relative z-10 flex-1">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 ${isCompleted ? "bg-[#1DB954] border-[#1DB954] text-black shadow-[0_0_20px_rgba(29,185,84,0.3)]" :
                                            isActive ? "bg-white/10 border-[#1DB954] text-[#1DB954] scale-110" :
                                                "bg-white/5 border-white/5 text-gray-700 opacity-50"
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`} />}
                                    </div>
                                    <span className={`text-[8px] uppercase tracking-[0.15em] font-black ${isActive ? "text-[#1DB954]" : "text-gray-700"}`}>
                                        {step.label.split(" ")[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Minimal Shimmering Progress Bar */}
                    <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-400 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(29,185,84,0.5)]"
                            style={{ width: `${(currentStep + 1) * 33.3}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
