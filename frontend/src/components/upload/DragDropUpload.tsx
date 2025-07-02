import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface DragDropUploadProps {
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFilesSelected,
  accept = '*/*',
  multiple = true,
  maxSize = 10,
  disabled = false,
  children,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList): string | null => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize * 1024 * 1024) {
        return `File "${file.name}" is too large. Maximum size is ${maxSize}MB.`;
      }
    }
    return null;
  }, [maxSize]);

  const handleFiles = useCallback((files: FileList) => {
    setError(null);
    
    if (files.length === 0) return;

    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    onFilesSelected(files);
  }, [onFilesSelected, validateFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const clearError = () => setError(null);

  return (
    <div className={className}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200
          ${isDragOver 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        {children || (
          <div className="p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Drop files here
              </p>
              <p className="text-gray-600">
                or click to browse
              </p>
              <p className="text-sm text-gray-500">
                {accept !== '*/*' && `Supported formats: ${accept}`}
                {maxSize && ` • Max size: ${maxSize}MB each`}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};