import logo from '@/assets/naybourhood-logo.png';
import whiteLogo from '@/assets/naybourhood-logo-white.svg';

interface LogoWithTransparencyProps {
  className?: string;
  alt?: string;
  variant?: 'default' | 'light' | 'white';
}

export const LogoWithTransparency = ({ 
  className = "h-8 w-auto", 
  alt = "Naybourhood",
  variant = 'default'
}: LogoWithTransparencyProps) => {
  // Use white logo directly for light/white variants on dark backgrounds
  const logoSrc = variant === 'light' || variant === 'white' ? whiteLogo : logo;
  
  return (
    <img 
      src={logoSrc} 
      alt={alt} 
      className={className}
    />
  );
};
