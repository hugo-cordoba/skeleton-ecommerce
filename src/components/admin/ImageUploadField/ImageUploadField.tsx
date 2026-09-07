'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { uploadProductImageAction } from '@/lib/actions/admin/upload.actions';
import styles from './ImageUploadField.module.css';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}

/**
 * Campo de imagen del formulario de producto: sube un archivo a R2 (el
 * campo se rellena solo con la URL pública) o permite pegar una URL a
 * mano, por si se quiere reutilizar una imagen ya subida antes.
 */
export default function ImageUploadField({ value, onChange, required }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite volver a elegir el mismo archivo si falla
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadProductImageAction(formData);

    setIsUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange(result.data.url);
  }

  return (
    <div className={styles.field}>
      <div className={styles.row}>
        {value && (
          <div className={styles.preview}>
            <Image src={value} alt="" fill sizes="56px" className={styles.previewImage} />
          </div>
        )}

        <input
          type="text"
          required={required}
          placeholder="https://.../producto.jpg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.urlInput}
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          className={styles.hiddenFileInput}
        />
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Subiendo...' : 'Subir imagen'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}