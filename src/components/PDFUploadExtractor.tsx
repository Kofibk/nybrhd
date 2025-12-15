import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, X, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExtractedItem {
  id: string;
  fileName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  data?: any;
  error?: string;
}

interface PDFUploadExtractorProps {
  userType: 'developer' | 'agent' | 'broker';
  onExtracted: (items: ExtractedItem[]) => void;
  maxFiles?: number;
}

export function PDFUploadExtractor({ userType, onExtracted, maxFiles = 10 }: PDFUploadExtractorProps) {
  const [files, setFiles] = useState<ExtractedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTypeLabel = () => {
    switch (userType) {
      case 'developer':
        return { singular: 'Development', plural: 'Developments', examples: 'brochures, price lists, fact sheets' };
      case 'agent':
        return { singular: 'Property', plural: 'Properties', examples: 'property details, listings, portfolios' };
      case 'broker':
        return { singular: 'Product', plural: 'Products', examples: 'mortgage products, rate sheets, lender guides' };
    }
  };

  const labels = getTypeLabel();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles: ExtractedItem[] = selectedFiles.map(file => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      status: 'pending',
      data: file,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const processFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.error('No files to process');
      return;
    }

    setIsProcessing(true);

    for (const file of pendingFiles) {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' as const } : f
      ));

      try {
        const base64 = await fileToBase64(file.data as File);
        
        const { data, error } = await supabase.functions.invoke('extract-pdf-data', {
          body: {
            pdfBase64: base64,
            pdfName: file.fileName,
            userType,
          },
        });

        if (error) throw error;

        if (data.success) {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'success' as const, data: data.data } : f
          ));
        } else {
          throw new Error(data.error || 'Extraction failed');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { 
            ...f, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Failed to extract data' 
          } : f
        ));
      }
    }

    setIsProcessing(false);
    
    // Notify parent of extracted items
    const updatedFiles = files.map(f => {
      const pending = pendingFiles.find(p => p.id === f.id);
      return pending ? { ...f } : f;
    });
    
    setTimeout(() => {
      onExtracted(files.filter(f => f.status === 'success'));
    }, 100);
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;
  const processingCount = files.filter(f => f.status === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-lg">Upload {labels.plural} PDFs</p>
            <p className="text-sm text-muted-foreground mt-1">
              Drop your {labels.examples} here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PDF files up to 20MB each • Maximum {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Uploaded Files ({files.length})</h3>
            {successCount > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {successCount} extracted
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  file.status === 'success' ? 'bg-green-500/10' :
                  file.status === 'error' ? 'bg-destructive/10' :
                  file.status === 'processing' ? 'bg-primary/10' :
                  'bg-muted'
                }`}>
                  {file.status === 'processing' ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : file.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : file.status === 'error' ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.status === 'pending' && 'Ready to extract'}
                    {file.status === 'processing' && 'Extracting data with AI...'}
                    {file.status === 'success' && (
                      <span className="text-green-600">
                        ✓ {file.data?.developmentName || file.data?.propertyName || file.data?.productName || 'Data extracted'}
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-destructive">{file.error}</span>
                    )}
                  </p>
                </div>

                {file.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Process Button */}
      {pendingCount > 0 && (
        <Button
          onClick={processFiles}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting Data ({processingCount}/{pendingCount})...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Extract Data from {pendingCount} {pendingCount === 1 ? 'File' : 'Files'}
            </>
          )}
        </Button>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">AI-Powered Extraction</p>
            <p className="text-muted-foreground mt-1">
              Our AI will automatically extract key information from your PDFs including names, prices, 
              features, and more. All data is editable after extraction.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
