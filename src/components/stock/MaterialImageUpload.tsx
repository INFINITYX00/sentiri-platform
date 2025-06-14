
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uploadFile } from '@/utils/fileUpload'
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Loader2, Image } from 'lucide-react'

interface MaterialImageUploadProps {
  imageUrl?: string
  onImageUpload: (url: string) => void
  onImageRemove: () => void
}

export function MaterialImageUpload({ imageUrl, onImageUpload, onImageRemove }: MaterialImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image must be less than 5MB",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      const result = await uploadFile(file, 'material-images', 'materials')
      
      if (result.error) {
        throw new Error(result.error)
      }

      if (result.url) {
        onImageUpload(result.url)
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Material Image</Label>
      
      {imageUrl ? (
        <div className="relative">
          <img 
            src={imageUrl} 
            alt="Material preview" 
            className="w-full h-32 object-cover rounded-md border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onImageRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
          <div className="text-center">
            <Image className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="text-sm text-gray-600">
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    <>
                      <span className="text-blue-600">Upload an image</span> or drag and drop
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </div>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
