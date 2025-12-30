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
import { Upload, FileSpreadsheet, FileText, Loader2, CheckCircle, AlertCircle, Users, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/lib/types";

interface Campaign {
  id: string;
  name: string;
  client: string;
  clientType: string;
  status: string;
  budget: number;
  spent: number;
  leads: number;
  cpl: number;
  startDate: string;
}

interface ReportUploadDialogProps {
  type: "leads" | "campaigns";
  onUploadComplete?: (data: any) => void;
  onLeadsImport?: (leads: Lead[]) => void;
  onCampaignsImport?: (campaigns: Campaign[]) => void;
}

type UploadStatus = "idle" | "uploading" | "processing" | "preview" | "importing" | "complete" | "error";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

const ReportUploadDialog = ({ type, onUploadComplete, onLeadsImport, onCampaignsImport }: ReportUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const [retryingIn, setRetryingIn] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ".csv,.xlsx,.xls,.pdf";
  const typeLabel = type === "leads" ? "Lead" : "Campaign";
  const dataKey = type === "leads" ? "leads" : "campaigns";

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setStatus("idle");
      setErrorMessage("");
      setProcessingResult(null);
      setSelectedItems(new Set());
      setRetryCount(0);
      setRetryingIn(null);
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
        setSelectedItems(new Set());
        setRetryCount(0);
        setRetryingIn(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV, Excel, or PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const processFileWithRetry = async (attempt: number = 0): Promise<void> => {
    if (!selectedFile) return;

    setStatus("uploading");
    setProgress(20);
    setRetryCount(attempt);
    setRetryingIn(null);

    try {
      const content = await readFileContent(selectedFile);
      setProgress(40);
      setStatus("processing");

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
      setRetryCount(0);
      
      const items = data[dataKey];
      if (items && items.length > 0) {
        setSelectedItems(new Set(items.map((_: any, i: number) => i)));
        setStatus("preview");
      } else {
        setStatus("complete");
      }

      toast({
        title: "Report processed successfully",
        description: `${data.recordsFound || 0} ${type} found.`,
      });

      if (onUploadComplete) {
        onUploadComplete(data);
      }
    } catch (error: any) {
      console.error(`Upload error (attempt ${attempt + 1}/${MAX_RETRIES}):`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
        setStatus("uploading");
        setRetryingIn(Math.ceil(delay / 1000));
        
        toast({
          title: `Retrying... (${attempt + 2}/${MAX_RETRIES})`,
          description: `Connection failed. Retrying in ${Math.ceil(delay / 1000)} seconds...`,
        });

        // Countdown timer
        let remaining = Math.ceil(delay / 1000);
        const countdown = setInterval(() => {
          remaining -= 1;
          if (remaining > 0) {
            setRetryingIn(remaining);
          } else {
            clearInterval(countdown);
          }
        }, 1000);

        await sleep(delay);
        clearInterval(countdown);
        return processFileWithRetry(attempt + 1);
      }
      
      setStatus("error");
      setErrorMessage(error.message || "Failed to process file after multiple attempts");
      setRetryCount(0);
      toast({
        title: "Processing failed",
        description: `Failed after ${MAX_RETRIES} attempts. ${error.message || "Please try again later."}`,
        variant: "destructive",
      });
    }
  };

  const processFile = () => processFileWithRetry(0);

  const handleImportLeads = async () => {
    if (!processingResult?.leads || !onLeadsImport) return;

    setStatus("importing");
    
    const leadsToImport = processingResult.leads.filter((_: any, i: number) => selectedItems.has(i));
    
    try {
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

  const handleImportCampaigns = () => {
    if (!processingResult?.campaigns || !onCampaignsImport) return;

    setStatus("importing");
    
    const campaignsToImport = processingResult.campaigns.filter((_: any, i: number) => selectedItems.has(i));
    
    onCampaignsImport(campaignsToImport);
    
    setStatus("complete");
    toast({
      title: "Campaigns imported",
      description: `Successfully imported ${campaignsToImport.length} campaigns.`,
    });
  };

  const handleImport = () => {
    if (type === "leads") {
      handleImportLeads();
    } else {
      handleImportCampaigns();
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
    setSelectedItems(new Set());
    setRetryCount(0);
    setRetryingIn(null);
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

  const toggleItemSelection = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    const items = processingResult?.[dataKey] || [];
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((_: any, i: number) => i)));
    }
  };

  const items = processingResult?.[dataKey] || [];
  const canImport = type === "leads" ? !!onLeadsImport : !!onCampaignsImport;

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
                <div className="flex-1">
                  <span className="text-sm">
                    {retryingIn !== null 
                      ? `Retrying in ${retryingIn}s...` 
                      : status === "uploading" 
                        ? "Uploading file..." 
                        : `AI is extracting ${type} data...`}
                  </span>
                  {retryCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Attempt {retryCount + 1} of {MAX_RETRIES}
                    </p>
                  )}
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Preview - Leads */}
          {status === "preview" && type === "leads" && processingResult?.leads && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {items.length} leads extracted
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                  {selectedItems.size === items.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-2">
                  {processingResult.leads.map((lead: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedItems.has(index) ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-transparent"
                      }`}
                      onClick={() => toggleItemSelection(index)}
                    >
                      <Checkbox
                        checked={selectedItems.has(index)}
                        onCheckedChange={() => toggleItemSelection(index)}
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
            </div>
          )}

          {/* Preview - Campaigns */}
          {status === "preview" && type === "campaigns" && processingResult?.campaigns && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {items.length} campaigns extracted
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                  {selectedItems.size === items.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-2 space-y-2">
                  {processingResult.campaigns.map((campaign: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedItems.has(index) ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-transparent"
                      }`}
                      onClick={() => toggleItemSelection(index)}
                    >
                      <Checkbox
                        checked={selectedItems.has(index)}
                        onCheckedChange={() => toggleItemSelection(index)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{campaign.client}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground capitalize">{campaign.status}</p>
                        <p className="text-xs font-medium">£{campaign.budget?.toLocaleString()}</p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-xs">{campaign.leads} leads</p>
                        <p className="text-xs">CPL: £{Math.round(campaign.cpl || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Insights */}
          {status === "preview" && processingResult?.insights && processingResult.insights.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium mb-1">AI Insights:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {processingResult.insights.slice(0, 3).map((insight: string, i: number) => (
                  <li key={i}>• {insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Importing state */}
          {status === "importing" && (
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Importing {type}...</span>
            </div>
          )}

          {/* Success state */}
          {status === "complete" && (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {typeLabel}s imported successfully!
              </span>
            </div>
          )}

          {/* Error state */}
          {status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Processing failed after {MAX_RETRIES} attempts</p>
                  <p className="text-xs">{errorMessage}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => processFileWithRetry(0)} 
                className="w-full"
              >
                Try Again
              </Button>
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
                onClick={handleImport} 
                disabled={selectedItems.size === 0 || !canImport}
              >
                Import {selectedItems.size} {typeLabel}{selectedItems.size !== 1 ? "s" : ""}
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
