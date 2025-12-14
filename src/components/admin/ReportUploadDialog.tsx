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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileSpreadsheet, FileText, Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/lib/types";

interface ReportUploadDialogProps {
  type: "leads" | "campaigns";
  onUploadComplete?: (data: any) => void;
  onLeadsImport?: (leads: Lead[]) => void;
}

type UploadStatus = "idle" | "uploading" | "processing" | "preview" | "importing" | "complete" | "error";

const ReportUploadDialog = ({ type, onUploadComplete, onLeadsImport }: ReportUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
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
      setSelectedLeads(new Set());
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
        setSelectedLeads(new Set());
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

      // Call AI edge function for lead extraction
      const functionName = type === "leads" ? "ai-lead-analysis" : "ai-campaign-intelligence";

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          type: "bulk_analysis",
          fileContent: content,
          fileName: selectedFile.name,
          fileType: selectedFile.name.split('.').pop()?.toLowerCase(),
        },
      });

      setProgress(80);

      if (error) throw error;

      if (data.error) throw new Error(data.error);

      setProcessingResult(data);
      setProgress(100);
      
      // If leads were extracted, show preview
      if (type === "leads" && data.leads && data.leads.length > 0) {
        // Select all leads by default
        setSelectedLeads(new Set(data.leads.map((_: any, i: number) => i)));
        setStatus("preview");
      } else {
        setStatus("complete");
      }

      toast({
        title: "Report processed successfully",
        description: `${data.recordsFound || 0} records found.`,
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

  const handleImportLeads = async () => {
    if (!processingResult?.leads || !onLeadsImport) return;

    setStatus("importing");
    
    const leadsToImport = processingResult.leads.filter((_: any, i: number) => selectedLeads.has(i));
    
    try {
      // Call AI to score all leads
      const { data: scoringResult, error } = await supabase.functions.invoke('ai-lead-analysis', {
        body: {
          action: 'bulk_scoring',
          leads: leadsToImport.map((lead: any) => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            country: lead.country,
            budget: lead.budget,
            bedrooms: lead.bedrooms,
            notes: lead.notes,
          })),
        },
      });

      let scoredLeads = leadsToImport;

      if (!error && scoringResult && Array.isArray(scoringResult)) {
        // Merge AI scores with leads
        scoredLeads = leadsToImport.map((lead: any) => {
          const aiScore = scoringResult.find((s: any) => s.leadId === lead.id);
          if (aiScore) {
            return {
              ...lead,
              qualityScore: aiScore.qualityScore ?? lead.qualityScore,
              intentScore: aiScore.intentScore ?? lead.intentScore,
              classification: aiScore.classification || getClassification(
                aiScore.qualityScore ?? lead.qualityScore,
                aiScore.intentScore ?? lead.intentScore
              ),
            };
          }
          return {
            ...lead,
            classification: getClassification(lead.qualityScore, lead.intentScore),
          };
        });

        toast({
          title: "AI Scoring Complete",
          description: `Scored ${scoringResult.length} leads with AI analysis.`,
        });
      } else {
        // Fallback: use initial scores with classification
        scoredLeads = leadsToImport.map((lead: Lead) => ({
          ...lead,
          classification: getClassification(lead.qualityScore, lead.intentScore),
        }));
      }

      onLeadsImport(scoredLeads);
      
      setStatus("complete");
      toast({
        title: "Leads imported",
        description: `Successfully imported ${scoredLeads.length} leads with AI scoring.`,
      });
    } catch (err) {
      console.error("Scoring error:", err);
      // Import anyway with basic classification
      const processedLeads = leadsToImport.map((lead: Lead) => ({
        ...lead,
        classification: getClassification(lead.qualityScore, lead.intentScore),
      }));
      
      onLeadsImport(processedLeads);
      setStatus("complete");
      toast({
        title: "Leads imported",
        description: `Imported ${processedLeads.length} leads (AI scoring unavailable).`,
      });
    }
  };

  const getClassification = (quality: number, intent: number) => {
    if (quality >= 80 && intent >= 80) return "hot";
    if (quality >= 70 && intent >= 50) return "star";
    if (intent >= 70 && quality >= 50) return "lightning";
    if (quality >= 50 && intent >= 50) return "verified";
    if (quality < 40 && intent < 40) return "cold";
    if (quality < 50 || intent < 50) return "dormant";
    return "verified";
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.name.endsWith(".pdf")) {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
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
    setSelectedLeads(new Set());
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

  const toggleLeadSelection = (index: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === processingResult?.leads?.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(processingResult.leads.map((_: any, i: number) => i)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Upload {typeLabel} Report</DialogTitle>
          <DialogDescription>
            Upload a PDF, CSV, or Excel file containing {type} data for AI analysis and import.
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
                  {status === "uploading" ? "Uploading file..." : "AI is extracting lead data..."}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Lead Preview */}
          {status === "preview" && processingResult?.leads && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {processingResult.leads.length} leads extracted
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                  {selectedLeads.size === processingResult.leads.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-2">
                  {processingResult.leads.map((lead: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedLeads.has(index) ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-transparent"
                      }`}
                      onClick={() => toggleLeadSelection(index)}
                    >
                      <Checkbox
                        checked={selectedLeads.has(index)}
                        onCheckedChange={() => toggleLeadSelection(index)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{lead.country}</p>
                        <p className="text-xs font-medium">{lead.budget}</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="text-xs">Q: {lead.qualityScore}</p>
                        <p className="text-xs">I: {lead.intentScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {processingResult.insights && processingResult.insights.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium mb-1">AI Insights:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {processingResult.insights.slice(0, 3).map((insight: string, i: number) => (
                      <li key={i}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Importing state */}
          {status === "importing" && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Importing leads...</span>
            </div>
          )}

          {/* Success state */}
          {status === "complete" && (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {type === "leads" ? "Leads imported successfully!" : "Analysis complete!"}
              </span>
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
                <strong>Tip:</strong> Upload {type === "leads" ? "lead lists, CRM exports, or qualification reports" : "campaign performance reports, Meta/Google exports, or analytics summaries"} for AI-powered extraction and import.
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
          {status === "preview" && (
            <>
              <Button variant="outline" onClick={resetDialog}>
                Upload Different File
              </Button>
              <Button 
                onClick={handleImportLeads} 
                disabled={selectedLeads.size === 0 || !onLeadsImport}
              >
                Import {selectedLeads.size} Lead{selectedLeads.size !== 1 ? "s" : ""}
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
