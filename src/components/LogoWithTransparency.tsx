import logo from '@/assets/naybourhood-logo.png';

interface LogoWithTransparencyProps {
  className?: string;
  alt?: string;
}

export const LogoWithTransparency = ({ className = "h-8 w-auto", alt = "Naybourhood" }: LogoWithTransparencyProps) => {
  return (
    <img 
      src={logo} 
      alt={alt} 
      className={className}
    />
  );
};
