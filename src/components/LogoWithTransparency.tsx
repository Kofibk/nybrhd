import { useEffect, useState } from 'react';
import logo from '@/assets/naybourhood-logo.jpeg';
import { processLogoBackground } from '@/utils/processLogo';

interface LogoWithTransparencyProps {
  className?: string;
  alt?: string;
}

export const LogoWithTransparency = ({ className = "h-8 w-auto", alt = "Naybourhood" }: LogoWithTransparencyProps) => {
  const [processedLogo, setProcessedLogo] = useState<string>(logo);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const process = async () => {
      try {
        const processed = await processLogoBackground(logo);
        setProcessedLogo(processed);
      } catch (error) {
        console.error('Failed to process logo:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    process();
  }, []);

  return (
    <img 
      src={processedLogo} 
      alt={alt} 
      className={`${className} ${isProcessing ? 'opacity-50' : 'opacity-100'} transition-opacity`}
    />
  );
};
