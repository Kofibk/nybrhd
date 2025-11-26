import { removeBackground, loadImage } from './backgroundRemoval';

export const processLogoBackground = async (logoPath: string): Promise<string> => {
  try {
    // Fetch the logo image
    const response = await fetch(logoPath);
    const blob = await response.blob();
    
    // Load the image
    const img = await loadImage(blob);
    
    // Remove background
    const processedBlob = await removeBackground(img);
    
    // Create object URL for the processed image
    return URL.createObjectURL(processedBlob);
  } catch (error) {
    console.error('Error processing logo:', error);
    // Return original logo if processing fails
    return logoPath;
  }
};
