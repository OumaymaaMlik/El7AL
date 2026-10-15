import { useCallback, useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../../../services/api';

/** Uploads the identity photo as soon as it is chosen, and keeps a local preview. `url` is set once the upload succeeded. */
export function useCinUpload(onError: (message: string | null) => void) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const remove = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setUrl(null);
  }, []);

  const select = async (chosen: File | undefined) => {
    if (!chosen) return;
    setFile(chosen);
    setPreviewUrl(URL.createObjectURL(chosen));
    setUploading(true);
    onError(null);

    const formData = new FormData();
    formData.append('document', chosen);
    try {
      const res = await api.post('/uploads/document', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUrl(res.data.url || res.data.data?.url || null);
    } catch (err) {
      remove();
      onError(apiErrorMessage(err, "Le document n'a pas pu être téléversé. Réessayez."));
    } finally {
      setUploading(false);
    }
  };

  return { file, previewUrl, url, uploading, select, remove };
}
