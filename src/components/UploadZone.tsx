import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Papa from 'papaparse';

interface UploadZoneProps {
  label: string;
  description: string;
  onDataParsed: (data: any[], fileName: string) => void;
  isUploaded: boolean;
  fileName?: string;
  onClear: () => void;
}

export function UploadZone({ 
  label, 
  description, 
  onDataParsed, 
  isUploaded, 
  fileName,
  onClear 
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      return;
    }

    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataParsed(results.data, file.name);
        setIsProcessing(false);
      },
      error: () => {
        setIsProcessing(false);
      }
    });
  }, [onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (isUploaded) {
    return (
      <div className="border-2 border-green-500/30 bg-green-500/5 rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
        ${isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleInputChange}
        className="hidden"
        id={`upload-${label}`}
      />
      <label htmlFor={`upload-${label}`} className="cursor-pointer block">
        <div className="flex flex-col items-center gap-3">
          {isProcessing ? (
            <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>CSV files only</span>
          </div>
        </div>
      </label>
    </div>
  );
}
