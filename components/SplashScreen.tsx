import React from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center animate-fadeIn">
                {/* Logo */}
                <div className="mb-10 relative">
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
                    <div className="w-32 h-32 mx-auto flex items-center justify-center relative p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl animate-scaleIn">
                        <img src="/school-logo.png" alt="School Logo" className="w-full h-full object-contain filter drop-shadow-xl" />
                    </div>
                </div>

                {/* App Name */}
                <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
                    <span className="text-yellow-400">Ustaz</span>.AI
                </h1>
                <p className="text-white/70 text-lg mb-8">Your Intelligent Classroom Assistant</p>

                {/* Loading indicator */}
                <div className="flex justify-center gap-2 mb-12">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* School name */}
                <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl inline-block mb-8">
                    <p className="text-white/90 font-medium">ROOTS OF WISDOM SCHOOL & COLLEGE</p>
                </div>
            </div>

            {/* Developer credit */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white/40 text-sm">Developed by</p>
                <p className="text-white/80 font-bold text-lg">Adil Rahman</p>
            </div>
        </div>
    );
};

export default SplashScreen;
