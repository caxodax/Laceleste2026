/**
 * Client-side image optimization utility.
 * Resizes images using Canvas and converts them to WebP format.
 */

interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.8,
    format = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintainig aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image in canvas (this performs the resize)
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          format,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Generates both HD and Thumbnail versions of an image.
 */
export async function generateProductVersions(file: File): Promise<{ full: Blob; thumb: Blob }> {
  const [full, thumb] = await Promise.all([
    // Full HD Version (max 2560px, better quality)
    optimizeImage(file, { maxWidth: 2560, maxHeight: 2560, quality: 0.85 }),
    // Thumbnail Version (max 800px, medium quality)
    optimizeImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.7 }),
  ]);

  return { full, thumb };
}
