import { supabase } from '@/lib/supabase';
import { generateProductVersions } from '@/lib/utils/image-optimizer';

const BUCKET_NAME = 'products';

interface UploadResult {
  image: string;
  thumbnail: string;
}

export async function uploadProductImage(file: File): Promise<UploadResult> {
  // 1. Generate optimized versions (WebP)
  const { full, thumb } = await generateProductVersions(file);
  
  const baseName = `${Math.random().toString(36).substring(2)}-${Date.now()}`;
  const fullPath = `${baseName}-full.webp`;
  const thumbPath = `${baseName}-thumb.webp`;

  // 2. Upload versions
  const [fullUpload, thumbUpload] = await Promise.all([
    supabase.storage.from(BUCKET_NAME).upload(fullPath, full, { contentType: 'image/webp' }),
    supabase.storage.from(BUCKET_NAME).upload(thumbPath, thumb, { contentType: 'image/webp' }),
  ]);

  if (fullUpload.error) throw new Error(`Error uploading HD image: ${fullUpload.error.message}`);
  if (thumbUpload.error) throw new Error(`Error uploading thumbnail: ${thumbUpload.error.message}`);

  // 3. Get Public URLs
  const { data: fullUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
  const { data: thumbUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(thumbPath);

  return {
    image: fullUrlData.publicUrl,
    thumbnail: thumbUrlData.publicUrl,
  };
}

export async function deleteProductImage(url: string, thumbnailUrl?: string): Promise<void> {
  try {
    const filesToDelete = [];
    
    // Extract full image filename
    if (url && url.includes(BUCKET_NAME)) {
      const parts = url.split('/');
      filesToDelete.push(parts[parts.length - 1]);
    }
    
    // Extract thumbnail filename
    if (thumbnailUrl && thumbnailUrl.includes(BUCKET_NAME)) {
      const parts = thumbnailUrl.split('/');
      filesToDelete.push(parts[parts.length - 1]);
    }

    if (filesToDelete.length > 0) {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filesToDelete);

      if (error) throw error;
    }
  } catch (err) {
    console.error('Error deleting image:', err);
  }
}
