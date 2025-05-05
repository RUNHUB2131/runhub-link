
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  userId: string;
  currentImageUrl?: string;
  onImageUpload: (url: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ImageUpload({ userId, currentImageUrl, onImageUpload, className, size = "md" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarSize = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError('Image size should be less than 1MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Create a local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Upload to Supabase Storage
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('profile-logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('profile-logos')
        .getPublicUrl(filePath);

      // Call the onImageUpload callback with the new URL
      onImageUpload(urlData.publicUrl);

    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
      setPreviewUrl(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload(''); // Clear the image URL
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {previewUrl ? (
        <div className="relative">
          <Avatar className={`${avatarSize[size]} border-2 border-muted`}>
            <AvatarImage src={previewUrl} alt="Logo" />
            <AvatarFallback>Logo</AvatarFallback>
          </Avatar>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full" 
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div 
          className={`${avatarSize[size]} rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors`}
          onClick={triggerFileSelect}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <Button 
        type="button" 
        variant={previewUrl ? "outline" : "default"}
        size="sm"
        onClick={triggerFileSelect} 
        disabled={isUploading}
      >
        {isUploading 
          ? "Uploading..." 
          : previewUrl 
            ? "Change Logo" 
            : "Upload Logo"
        }
      </Button>

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
