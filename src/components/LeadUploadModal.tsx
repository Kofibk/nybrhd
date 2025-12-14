import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import { toast } from "sonner";

interface LeadUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (count: number) => void;
}

interface UploadPreview {
  headers: string[];
  rows: string[][];
  mapping: Record<string, string>;
  fileName: string;
}

type UploadStep = "upload" | "preview" | "mapping" | "processing" | "results";

const fieldOptions = [
  { value: "first_name", label: "First Name" },
  { value: "last_name", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "budget", label: "Budget" },
  { value: "timeline", label: "Timeline" },
  { value: "bedrooms", label: "Bedrooms" },
  { value: "country", label: "Country" },
  { value: "development", label: "Development" },
  { value: "source", label: "Source" },
  { value: "notes", label: "Notes" },
  { value: "skip", label: "Skip Column" },
];

export const LeadUploadModal = ({ open, onOpenChange, onImportComplete }: LeadUploadModalProps) => {
  const [uploadStep, setUploadStep] = useState<UploadStep>("upload");
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const [uploadResults, setUploadResults] = useState<{ success: number; skipped: number; duplicates: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast.error("Invalid file format. Please upload CSV or Excel file.");
      return;
    }

    // Mock CSV parsing - in production, use a proper parser
    const mockHeaders = ["Full Name", "Email Address", "Phone", "Budget Range", "Property Interest"];
    const mockRows = [
      ["John Smith", "john@email.com", "+44 7700 900456", "£500k-£750k", "Marina Heights"],
      ["Sarah Jones", "sarah@email.com", "+44 7700 900789", "£750k-£1M", "Skyline Tower"],
      ["Mike Wilson", "mike@email.com", "+44 7700 900123", "£600k-£800k", "Garden Residences"],
      ["Emma Brown", "emma@email.com", "+44 7700 900234", "£400k-£500k", "City View"],
      ["James Taylor", "james@email.com", "+44 7700 900345", "£1M+", "Penthouse Collection"],
    ];

    // Auto-map common field names
    const autoMapping: Record<string, string> = {};
    mockHeaders.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes("name")) autoMapping[header] = "first_name";
      else if (lowerHeader.includes("email")) autoMapping[header] = "email";
      else if (lowerHeader.includes("phone")) autoMapping[header] = "phone";
      else if (lowerHeader.includes("budget")) autoMapping[header] = "budget";
      else if (lowerHeader.includes("property") || lowerHeader.includes("development")) autoMapping[header] = "development";
      else autoMapping[header] = "skip";
    });

    setUploadPreview({
      headers: mockHeaders,
      rows: mockRows,
      mapping: autoMapping,
      fileName: file.name,
    });
    setUploadStep("preview");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleMappingChange = (header: string, value: string) => {
    if (uploadPreview) {
      setUploadPreview({
        ...uploadPreview,
        mapping: { ...uploadPreview.mapping, [header]: value },
      });
    }
  };

  const handleProcessUpload = async () => {
    setUploadStep("processing");
    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const successCount = uploadPreview?.rows.length || 0;
    setUploadResults({
      success: successCount * 50 + Math.floor(Math.random() * 200),
      skipped: Math.floor(Math.random() * 30),
      duplicates: Math.floor(Math.random() * 10),
    });
    setIsProcessing(false);
    setUploadStep("results");
  };

  const resetAndClose = () => {
    setUploadStep("upload");
    setUploadPreview(null);
    setUploadResults(null);
    onOpenChange(false);
  };

  const handleComplete = () => {
    if (uploadResults) {
      onImportComplete?.(uploadResults.success);
    }
    resetAndClose();
  };

  const downloadTemplate = () => {
    const template = "First Name,Last Name,Email,Phone,Budget,Timeline,Bedrooms,Country,Development,Notes\nJohn,Smith,john@email.com,+44 7700 900123,£500k-£750k,1-3 months,2,UK,Marina Heights,Interested in waterfront";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naybourhood_leads_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragOver 
            ? "border-primary bg-primary/10" 
            : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <p className="font-medium text-lg mb-1">Drag & drop your file here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
          
          <Button onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Choose File
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Supported formats: CSV, XLSX, XLS</p>
            <p>Max file size: 10MB (up to 1,000 leads)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Need a template?</p>
            <p className="text-xs text-muted-foreground">Download our CSV template with all fields</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          Download Template
        </Button>
      </div>

      <div className="p-4 border rounded-lg space-y-2">
        <p className="text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          Required columns
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">First Name</Badge>
          <Badge variant="outline">Last Name</Badge>
          <Badge variant="secondary">Email OR Phone (at least one)</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Optional: Budget, Timeline, Bedrooms, Country, Development, Source, Notes
        </p>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-sm">{uploadPreview?.fileName}</p>
            <p className="text-xs text-muted-foreground">{uploadPreview?.rows.length} rows detected</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setUploadStep("upload")}>
          <X className="h-4 w-4 mr-1" />
          Change File
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <p className="text-sm font-medium p-3 bg-muted/30 border-b">Preview (first 5 rows)</p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {uploadPreview?.headers.map((header, idx) => (
                  <TableHead key={idx} className="text-xs whitespace-nowrap">{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadPreview?.rows.slice(0, 5).map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <TableCell key={cellIdx} className="text-xs whitespace-nowrap">{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => setUploadStep("upload")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={() => setUploadStep("mapping")}>
          Continue to Mapping
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Map your CSV columns to Naybourhood fields. We've auto-detected some matches.
      </p>

      <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
        {uploadPreview?.headers.map((header, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant="outline" className="text-xs shrink-0">{header}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <Select 
              value={uploadPreview?.mapping[header] || "skip"} 
              onValueChange={(v) => handleMappingChange(header, v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => setUploadStep("preview")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button onClick={handleProcessUpload}>
          Import Leads
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="py-12 text-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
      <div>
        <p className="font-medium text-lg">Processing your leads...</p>
        <p className="text-sm text-muted-foreground">Validating, scoring, and classifying each lead</p>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="py-6 text-center space-y-6">
      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-500" />
      </div>

      <div>
        <p className="font-medium text-lg mb-1">Import Complete!</p>
        <p className="text-sm text-muted-foreground">Your leads have been scored and classified</p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-500">{uploadResults?.success}</p>
          <p className="text-xs text-muted-foreground">Imported</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-orange-500">{uploadResults?.skipped}</p>
          <p className="text-xs text-muted-foreground">Skipped</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{uploadResults?.duplicates}</p>
          <p className="text-xs text-muted-foreground">Duplicates</p>
        </Card>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-left max-w-sm mx-auto">
        <p className="text-sm font-medium mb-1">🎯 Lead Scoring Complete</p>
        <p className="text-xs text-muted-foreground">
          Each lead has been assigned Quality and Intent scores. View your prioritised leads in the Leads dashboard.
        </p>
      </div>

      <Button onClick={handleComplete} className="w-full max-w-sm">
        View My Leads
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {uploadStep === "upload" && "Upload Leads"}
            {uploadStep === "preview" && "Preview Data"}
            {uploadStep === "mapping" && "Map Columns"}
            {uploadStep === "processing" && "Processing..."}
            {uploadStep === "results" && "Import Complete"}
          </DialogTitle>
          {uploadStep === "upload" && (
            <DialogDescription>
              Import your existing leads to get instant scoring and identify priority buyers
            </DialogDescription>
          )}
        </DialogHeader>

        {uploadStep === "upload" && renderUploadStep()}
        {uploadStep === "preview" && renderPreviewStep()}
        {uploadStep === "mapping" && renderMappingStep()}
        {uploadStep === "processing" && renderProcessingStep()}
        {uploadStep === "results" && renderResultsStep()}
      </DialogContent>
    </Dialog>
  );
};
