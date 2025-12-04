import logo from '@/assets/naybourhood-logo.png';

interface LogoWithTransparencyProps {
  className?: string;
  alt?: string;
  variant?: 'default' | 'light';
}

export const LogoWithTransparency = ({ 
  className = "h-8 w-auto", 
  alt = "Naybourhood",
  variant = 'default'
}: LogoWithTransparencyProps) => {
  return (
    <img 
      src={logo} 
      alt={alt} 
      className={`${className} ${variant === 'light' ? 'brightness-0 invert' : ''}`}
    />
  );
};
