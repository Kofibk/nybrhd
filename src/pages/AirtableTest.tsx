import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { airtable } from "@/lib/airtable";
import { AIRTABLE_TABLES } from "@/lib/airtableConstants";

// Get all table names from centralized constants
const TABLES = Object.values(AIRTABLE_TABLES);

type TestResult = {
  table: string;
  status: "idle" | "loading" | "success" | "error";
  recordCount?: number;
  error?: string;
};

export default function AirtableTest() {
  const [results, setResults] = useState<TestResult[]>(
    TABLES.map((table) => ({ table, status: "idle" }))
  );
  const [isRunning, setIsRunning] = useState(false);

  const testTable = async (tableName: string): Promise<TestResult> => {
    try {
      const response = await airtable.listTable(tableName, { maxRecords: 1 });
      return {
        table: tableName,
        status: "success",
        recordCount: response.records?.length ?? 0,
      };
    } catch (error) {
      return {
        table: tableName,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults(TABLES.map((table) => ({ table, status: "loading" })));

    const newResults: TestResult[] = [];
    for (const table of TABLES) {
      const result = await testTable(table);
      newResults.push(result);
      setResults([...newResults, ...TABLES.slice(newResults.length).map((t) => ({ table: t, status: "loading" as const }))]);
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Airtable Connection Test</h1>
            <p className="text-muted-foreground mt-1">
              Verify all {TABLES.length} table connections are working
            </p>
          </div>
          <Button onClick={runAllTests} disabled={isRunning} size="lg">
            {isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isRunning ? "Testing..." : "Run All Tests"}
          </Button>
        </div>

        {(successCount > 0 || errorCount > 0) && (
          <div className="flex gap-4">
            <Badge variant="outline" className="text-green-500 border-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              {successCount} Connected
            </Badge>
            {errorCount > 0 && (
              <Badge variant="outline" className="text-red-500 border-red-500">
                <XCircle className="mr-1 h-3 w-3" />
                {errorCount} Failed
              </Badge>
            )}
          </div>
        )}

        <div className="grid gap-3">
          {results.map((result) => (
            <Card key={result.table} className="border-border">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{result.table}</CardTitle>
                  <div className="flex items-center gap-2">
                    {result.status === "idle" && (
                      <Badge variant="secondary">Not tested</Badge>
                    )}
                    {result.status === "loading" && (
                      <Badge variant="secondary">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Testing...
                      </Badge>
                    )}
                    {result.status === "success" && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    )}
                    {result.status === "error" && (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {result.error && (
                <CardContent className="py-2 px-4 pt-0">
                  <p className="text-xs text-destructive">{result.error}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
