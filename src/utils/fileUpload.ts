
import { supabase } from '@/lib/supabase';

export interface UploadResult {
  url: string | null;
  path: string | null;
  error: string | null;
}

export const uploadFile = async (
  file: File, 
  bucket: string, 
  folder?: string
): Promise<UploadResult> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`Uploading ${file.name} to ${bucket}/${filePath}`);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        url: null,
        path: null,
        error: uploadError.message
      };
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
      error: null
    };
  } catch (error) {
    console.error('File upload failed:', error);
    return {
      url: null,
      path: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('File deletion failed:', error);
    return false;
  }
};
