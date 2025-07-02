import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface FileUploadItem {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onFilesChange?: (files: FileUploadItem[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  dragDropText?: string;
  browseText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = true,
  maxSize = 10, // 10MB default
  maxFiles = 10,
  onFilesChange,
  onUpload,
  className = '',
  disabled = false,
  showPreview = true,
  dragDropText = 'Drag and drop files here',
  browseText = 'or click to browse',
}) => {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return fileExtension === acceptedType.toLowerCase();
        }
        return mimeType.match(acceptedType.replace('*', '.*'));
      });

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles: FileUploadItem[] = [];
    
    for (const file of newFiles) {
      // Check if we've reached max files
      if (files.length + validFiles.length >= maxFiles) {
        break;
      }

      const error = validateFile(file);
      validFiles.push({
        file,
        id: generateId(),
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
      });
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, maxFiles, maxSize, accept, onFilesChange]);

  const removeFile = useCallback((id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles, disabled]);

  const handleUpload = async () => {
    if (!onUpload || isUploading) return;

    const filesToUpload = files.filter(f => f.status === 'pending').map(f => f.file);
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));

      // Simulate progress (in real implementation, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.status === 'uploading' 
            ? { ...f, progress: Math.min(f.progress + 10, 90) }
            : f
        ));
      }, 100);

      const uploadedUrls = await onUpload(filesToUpload);

      clearInterval(progressInterval);

      // Update with success status
      setFiles(prev => prev.map((f) => {
        if (f.status === 'uploading') {
          const urlIndex = prev.filter(file => file.status === 'uploading').indexOf(f);
          return {
            ...f,
            status: 'success' as const,
            progress: 100,
            url: uploadedUrls[urlIndex],
          };
        }
        return f;
      }));

    } catch (error) {
      console.error('Upload failed:', error);
      
      // Update with error status
      setFiles(prev => prev.map(f => 
        f.status === 'uploading' 
          ? { ...f, status: 'error' as const, error: 'Upload failed' }
          : f
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (item: FileUploadItem) => {
    switch (item.status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const hasValidFiles = pendingFiles.length > 0;

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            {dragDropText}
          </p>
          <p className="text-gray-600">
            {browseText}
          </p>
          <p className="text-sm text-gray-500">
            {accept && `Accepted formats: ${accept}`}
            {maxSize && ` • Max size: ${maxSize}MB`}
            {maxFiles && ` • Max files: ${maxFiles}`}
          </p>
        </div>
      </div>

      {/* Upload Button */}
      {hasValidFiles && onUpload && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={isUploading || disabled}
            className="min-w-32"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && showPreview && (
        <Card className="mt-4 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Files ({files.length})
          </h3>
          
          <div className="space-y-3">
            {files.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  {getFileIcon(item.file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item)}
                      {item.status !== 'uploading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(item.id)}
                          disabled={disabled}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {formatFileSize(item.file.size)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {item.status}
                    </p>
                  </div>
                  
                  {item.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {item.error && (
                    <p className="text-xs text-red-500 mt-1">{item.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};