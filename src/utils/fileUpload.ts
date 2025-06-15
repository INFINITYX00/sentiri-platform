
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
    console.log(`📤 Starting file upload: ${file.name} to ${bucket}/${folder || ''}`);
    console.log(`📊 File details: size=${file.size} bytes, type=${file.type}`);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log(`🎯 Upload path: ${bucket}/${filePath}`);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      console.error('Upload error details:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode
      });
      return {
        url: null,
        path: null,
        error: uploadError.message
      };
    }

    console.log('✅ File uploaded successfully, getting public URL...');

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('✅ Public URL generated:', data.publicUrl);

    return {
      url: data.publicUrl,
      path: filePath,
      error: null
    };
  } catch (error) {
    console.error('💥 File upload failed with exception:', error);
    console.error('Exception details:', {
      message: error.message,
      stack: error.stack
    });
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
