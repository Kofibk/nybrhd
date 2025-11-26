import removeBackground from '@imgly/background-removal';

export const removeBackgroundFromImage = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    
    // Use @imgly/background-removal for high-quality background removal
    const blob = await removeBackground(imageElement.src, {
      output: {
        format: 'image/png',
        quality: 1.0,
      }
    });
    
    console.log('Background removed successfully');
    return blob;
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
