import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ocarinaComposer_photo';

export function useOcarinaPhoto() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || null;
    } catch (error) {
      console.error('Failed to load ocarina photo from localStorage:', error);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (photoUrl) {
        localStorage.setItem(STORAGE_KEY, photoUrl);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save ocarina photo to localStorage:', error);
    }
  }, [photoUrl]);

  const uploadPhoto = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPhotoUrl(dataUrl);
        resolve();
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = () => {
    setPhotoUrl(null);
  };

  return {
    photoUrl,
    uploadPhoto,
    removePhoto,
  };
}
