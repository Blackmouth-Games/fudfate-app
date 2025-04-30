import { Environment } from '@/config/webhooks';

interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Upload an image to a temporary storage service
 * You can use services like ImgBB, Cloudinary, or your own server
 */
export const uploadImage = async (
  imageBlob: Blob,
  environment: Environment = 'production'
): Promise<UploadResponse> => {
  try {
    // Aquí usaremos ImgBB como ejemplo, pero puedes usar cualquier servicio
    const formData = new FormData();
    formData.append('image', imageBlob);
    
    // Reemplaza esto con tu API key de ImgBB
    const API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
    
    if (!API_KEY) {
      console.error('ImgBB API key not found');
      return {
        success: false,
        error: 'Image upload service not configured'
      };
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        imageUrl: data.data.url
      };
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 