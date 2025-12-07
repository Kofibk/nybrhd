import { useEffect, useState } from "react";
import { LogoWithTransparency } from "./LogoWithTransparency";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    // Complete and unmount after fade animation (1.5s + 0.5s fade)
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 blur-3xl bg-primary/20 animate-pulse rounded-full scale-150" />
        
        {/* Logo with scale animation */}
        <div className="relative animate-[scale-in_0.6s_ease-out]">
          <LogoWithTransparency className="h-24 w-auto" variant="white" />
        </div>
        
        {/* Loading dots */}
        <div className="flex gap-1.5 mt-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
        
        {/* Tagline */}
        <p className="mt-6 text-muted-foreground text-sm animate-[fade-in_0.8s_ease-out_0.3s_both]">
          AI-Powered Property Sales
        </p>
      </div>
    </div>
  );
};
