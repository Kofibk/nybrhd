import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportUploadDialogProps {
  type: "leads" | "campaigns";
  onUploadComplete?: (data: any) => void;
}

type UploadStatus = "idle" | "uploading" | "processing" | "complete" | "error";

const ReportUploadDialog = ({ type, onUploadComplete }: ReportUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ".csv,.xlsx,.xls,.pdf";
  const typeLabel = type === "leads" ? "Lead" : "Campaign";

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus("idle");
      setErrorMessage("");
      setProcessingResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.toLowerCase();
      if (ext.endsWith(".csv") || ext.endsWith(".xlsx") || ext.endsWith(".xls") || ext.endsWith(".pdf")) {
        setSelectedFile(file);
        setStatus("idle");
        setErrorMessage("");
        setProcessingResult(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV, Excel, or PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    setProgress(20);

    try {
      // Read file content
      const content = await readFileContent(selectedFile);
      setProgress(40);
      setStatus("processing");

      // Call appropriate AI edge function based on type
      const functionName = type === "leads" ? "ai-lead-analysis" : "ai-campaign-intelligence";
      const analysisType = type === "leads" ? "bulk_analysis" : "report_analysis";

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          type: analysisType,
          fileContent: content,
          fileName: selectedFile.name,
          fileType: selectedFile.name.split('.').pop()?.toLowerCase(),
        },
      });

      setProgress(80);

      if (error) throw error;

      setProcessingResult(data);
      setProgress(100);
      setStatus("complete");

      toast({
        title: "Report processed successfully",
        description: `${typeLabel} report has been analysed with AI.`,
      });

      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to process file");
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process the uploaded file.",
        variant: "destructive",
      });
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.name.endsWith(".pdf")) {
        // For PDF, read as base64
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        // For CSV/Excel, read as text
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      }
    });
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setStatus("idle");
    setProgress(0);
    setProcessingResult(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetDialog();
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload {typeLabel} Report</DialogTitle>
          <DialogDescription>
            Upload a PDF, CSV, or Excel file containing {type} data for AI analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Drop zone */}
          {status === "idle" && (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, CSV, Excel (.xlsx, .xls)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Selected file display */}
          {selectedFile && status === "idle" && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              {getFileIcon(selectedFile.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetDialog}>
                Remove
              </Button>
            </div>
          )}

          {/* Processing state */}
          {(status === "uploading" || status === "processing") && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm">
                  {status === "uploading" ? "Uploading file..." : "AI is analysing your report..."}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Success state */}
          {status === "complete" && processingResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Analysis complete!</span>
              </div>
              
              {/* Results summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium">AI Analysis Summary:</p>
                {processingResult.summary && (
                  <p className="text-sm text-muted-foreground">{processingResult.summary}</p>
                )}
                {processingResult.recordsFound !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Records found: {processingResult.recordsFound}
                  </p>
                )}
                {processingResult.insights && processingResult.insights.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Key Insights:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {processingResult.insights.slice(0, 3).map((insight: string, i: number) => (
                        <li key={i}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Processing failed</p>
                <p className="text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Format hints */}
          {status === "idle" && !selectedFile && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Upload {type === "leads" ? "lead lists, CRM exports, or qualification reports" : "campaign performance reports, Meta/Google exports, or analytics summaries"} for AI-powered analysis and insights.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === "idle" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={processFile} disabled={!selectedFile}>
                Process with AI
              </Button>
            </>
          )}
          {status === "complete" && (
            <>
              <Button variant="outline" onClick={resetDialog}>
                Upload Another
              </Button>
              <Button onClick={() => handleClose(false)}>
                Done
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={resetDialog}>
                Try Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUploadDialog;
