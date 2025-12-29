import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Filter,
  Plus,
  X,
  ChevronDown,
  Layers,
  ArrowUpDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { TransformedBuyer } from "@/hooks/useAirtableBuyers";
import { cn } from "@/lib/utils";

// Filter configuration
export interface FilterCondition {
  id: string;
  field: keyof TransformedBuyer | string;
  operator: FilterOperator;
  value: string;
}

export type FilterOperator = 
  | "equals" 
  | "not_equals" 
  | "contains" 
  | "not_contains" 
  | "greater_than" 
  | "less_than" 
  | "is_empty" 
  | "is_not_empty";

export interface SortConfig {
  field: keyof TransformedBuyer | string;
  direction: "asc" | "desc";
}

export interface GroupConfig {
  field: keyof TransformedBuyer | string | null;
}

// Field definitions for the filter UI
const FILTERABLE_FIELDS: Array<{
  key: keyof TransformedBuyer | string;
  label: string;
  type: "text" | "number" | "select" | "date";
  options?: string[];
}> = [
  { key: "createdTime", label: "Date Added", type: "date" },
  { key: "name", label: "Name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "status", label: "Status", type: "select" },
  { key: "intent", label: "Intent", type: "select", options: ["Hot", "Warm", "Low"] },
  { key: "score", label: "Score", type: "number" },
  { key: "budgetRange", label: "Budget Range", type: "text" },
  { key: "bedrooms", label: "Bedrooms", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "country", label: "Country", type: "select" },
  { key: "timeline", label: "Timeline", type: "text" },
  { key: "paymentMethod", label: "Payment Method", type: "select" },
  { key: "purpose", label: "Purpose", type: "text" },
  { key: "assignedCaller", label: "Assigned Caller", type: "select" },
  { key: "development", label: "Development", type: "select" },
  { key: "preferredComm", label: "Preferred Communication", type: "text" },
  { key: "summary", label: "Buyer Summary", type: "text" },
];

const OPERATORS: Array<{ value: FilterOperator; label: string; appliesTo: ("text" | "number" | "select" | "date")[] }> = [
  { value: "equals", label: "equals", appliesTo: ["text", "number", "select", "date"] },
  { value: "not_equals", label: "does not equal", appliesTo: ["text", "number", "select", "date"] },
  { value: "contains", label: "contains", appliesTo: ["text"] },
  { value: "not_contains", label: "does not contain", appliesTo: ["text"] },
  { value: "greater_than", label: "after", appliesTo: ["number", "date"] },
  { value: "less_than", label: "before", appliesTo: ["number", "date"] },
  { value: "is_empty", label: "is empty", appliesTo: ["text", "number", "select", "date"] },
  { value: "is_not_empty", label: "is not empty", appliesTo: ["text", "number", "select", "date"] },
];

const GROUPABLE_FIELDS: Array<{ key: keyof TransformedBuyer | string; label: string }> = [
  { key: "status", label: "Status" },
  { key: "intent", label: "Intent" },
  { key: "country", label: "Country" },
  { key: "assignedCaller", label: "Assigned Caller" },
  { key: "paymentMethod", label: "Payment Method" },
  { key: "development", label: "Development" },
];

interface BuyersFilterPanelProps {
  buyers: TransformedBuyer[];
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  sorts: SortConfig[];
  onSortsChange: (sorts: SortConfig[]) => void;
  groupBy: GroupConfig;
  onGroupByChange: (groupBy: GroupConfig) => void;
}

export function BuyersFilterPanel({
  buyers,
  filters,
  onFiltersChange,
  sorts,
  onSortsChange,
  groupBy,
  onGroupByChange,
}: BuyersFilterPanelProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);

  // Get unique values for select fields dynamically from data
  const uniqueValues = useMemo(() => {
    const values: Record<string, string[]> = {};
    
    FILTERABLE_FIELDS.filter(f => f.type === "select").forEach(field => {
      const unique = new Set<string>();
      buyers.forEach(buyer => {
        const val = buyer[field.key as keyof TransformedBuyer];
        if (val && typeof val === "string") unique.add(val);
      });
      values[field.key] = Array.from(unique).sort();
    });
    
    return values;
  }, [buyers]);

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: crypto.randomUUID(),
      field: "name",
      operator: "contains",
      value: "",
    };
    onFiltersChange([...filters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    onFiltersChange(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id));
  };

  const addSort = () => {
    const newSort: SortConfig = {
      field: "score",
      direction: "desc",
    };
    onSortsChange([...sorts, newSort]);
  };

  const updateSort = (index: number, updates: Partial<SortConfig>) => {
    const newSorts = [...sorts];
    newSorts[index] = { ...newSorts[index], ...updates };
    onSortsChange(newSorts);
  };

  const removeSort = (index: number) => {
    onSortsChange(sorts.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
    onSortsChange([]);
    onGroupByChange({ field: null });
  };

  const activeCount = filters.length + sorts.length + (groupBy.field ? 1 : 0);

  const getFieldConfig = (fieldKey: string) => {
    return FILTERABLE_FIELDS.find(f => f.key === fieldKey);
  };

  const getOperatorsForField = (fieldKey: string) => {
    const fieldConfig = getFieldConfig(fieldKey);
    if (!fieldConfig) return OPERATORS;
    return OPERATORS.filter(op => op.appliesTo.includes(fieldConfig.type));
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter Button & Popover */}
      <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filter
            {filters.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[480px] p-3" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filters</span>
              {filters.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onFiltersChange([])}>
                  Clear all
                </Button>
              )}
            </div>
            
            {filters.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No filters applied. Add a filter to refine your results.</p>
            ) : (
              <div className="space-y-2">
                {filters.map((filter, index) => {
                  const fieldConfig = getFieldConfig(filter.field);
                  const operators = getOperatorsForField(filter.field);
                  const needsValue = !["is_empty", "is_not_empty"].includes(filter.operator);
                  const fieldOptions = fieldConfig?.options || uniqueValues[filter.field] || [];
                  
                  return (
                    <div key={filter.id} className="flex items-center gap-2">
                      {index > 0 && (
                        <span className="text-xs text-muted-foreground w-8">and</span>
                      )}
                      {index === 0 && <span className="w-8" />}
                      
                      <Select
                        value={filter.field}
                        onValueChange={(value) => updateFilter(filter.id, { field: value, value: "" })}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTERABLE_FIELDS.map(f => (
                            <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(filter.id, { operator: value as FilterOperator })}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {needsValue && (
                        fieldConfig?.type === "select" && fieldOptions.length > 0 ? (
                          <Select
                            value={filter.value}
                            onValueChange={(value) => updateFilter(filter.id, { value })}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                            placeholder="Value..."
                            className="w-[120px] h-8 text-xs"
                          />
                        )
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeFilter(filter.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={addFilter}>
              <Plus className="h-3.5 w-3.5" />
              Add filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort Button & Popover */}
      <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort
            {sorts.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {sorts.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-3" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sort</span>
              {sorts.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onSortsChange([])}>
                  Clear all
                </Button>
              )}
            </div>
            
            {sorts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No sorting applied. Add a sort to order your results.</p>
            ) : (
              <div className="space-y-2">
                {sorts.map((sort, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground w-8">then</span>
                    )}
                    {index === 0 && <span className="w-8" />}
                    
                    <Select
                      value={sort.field}
                      onValueChange={(value) => updateSort(index, { field: value })}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILTERABLE_FIELDS.map(f => (
                          <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => updateSort(index, { direction: sort.direction === "asc" ? "desc" : "asc" })}
                    >
                      {sort.direction === "asc" ? (
                        <>
                          <SortAsc className="h-3.5 w-3.5" />
                          A→Z
                        </>
                      ) : (
                        <>
                          <SortDesc className="h-3.5 w-3.5" />
                          Z→A
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removeSort(index)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={addSort}>
              <Plus className="h-3.5 w-3.5" />
              Add sort
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Group By Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Group
            {groupBy.field && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                1
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onGroupByChange({ field: null })}>
            <span className={cn(!groupBy.field && "font-medium")}>No grouping</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {GROUPABLE_FIELDS.map(field => (
            <DropdownMenuItem
              key={field.key}
              onClick={() => onGroupByChange({ field: field.key })}
            >
              <span className={cn(groupBy.field === field.key && "font-medium")}>
                {field.label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filter Tags */}
      {activeCount > 0 && (
        <>
          <div className="h-4 w-px bg-border mx-1" />
          
          {filters.map(filter => {
            const fieldConfig = getFieldConfig(filter.field);
            const operatorLabel = OPERATORS.find(op => op.value === filter.operator)?.label || filter.operator;
            return (
              <Badge
                key={filter.id}
                variant="secondary"
                className="h-6 gap-1 pl-2 pr-1"
              >
                <span className="text-xs">
                  {fieldConfig?.label} {operatorLabel} {filter.value}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
          
          {sorts.map((sort, index) => {
            const fieldConfig = getFieldConfig(sort.field);
            return (
              <Badge
                key={`sort-${index}`}
                variant="outline"
                className="h-6 gap-1 pl-2 pr-1"
              >
                <span className="text-xs">
                  {fieldConfig?.label} {sort.direction === "asc" ? "↑" : "↓"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeSort(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
          
          {groupBy.field && (
            <Badge variant="outline" className="h-6 gap-1 pl-2 pr-1 border-dashed">
              <Layers className="h-3 w-3" />
              <span className="text-xs">
                {GROUPABLE_FIELDS.find(f => f.key === groupBy.field)?.label}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onGroupByChange({ field: null })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs text-muted-foreground"
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </>
      )}
    </div>
  );
}

// Utility function to apply filters to buyers
export function applyFilters(
  buyers: TransformedBuyer[],
  filters: FilterCondition[]
): TransformedBuyer[] {
  if (filters.length === 0) return buyers;
  
  return buyers.filter(buyer => {
    return filters.every(filter => {
      const value = buyer[filter.field as keyof TransformedBuyer];
      const strValue = String(value || "").toLowerCase();
      const filterValue = filter.value.toLowerCase();
      
      switch (filter.operator) {
        case "equals":
          return strValue === filterValue;
        case "not_equals":
          return strValue !== filterValue;
        case "contains":
          return strValue.includes(filterValue);
        case "not_contains":
          return !strValue.includes(filterValue);
        case "greater_than":
          return Number(value) > Number(filter.value);
        case "less_than":
          return Number(value) < Number(filter.value);
        case "is_empty":
          return !value || strValue === "";
        case "is_not_empty":
          return !!value && strValue !== "";
        default:
          return true;
      }
    });
  });
}

// Utility function to apply sorting to buyers
export function applySorts(
  buyers: TransformedBuyer[],
  sorts: SortConfig[]
): TransformedBuyer[] {
  if (sorts.length === 0) return buyers;
  
  return [...buyers].sort((a, b) => {
    for (const sort of sorts) {
      const aVal = a[sort.field as keyof TransformedBuyer];
      const bVal = b[sort.field as keyof TransformedBuyer];
      
      let comparison = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal || "").localeCompare(String(bVal || ""));
      }
      
      if (comparison !== 0) {
        return sort.direction === "asc" ? comparison : -comparison;
      }
    }
    return 0;
  });
}

// Utility function to group buyers
export function groupBuyers(
  buyers: TransformedBuyer[],
  groupBy: GroupConfig
): Map<string, TransformedBuyer[]> {
  const groups = new Map<string, TransformedBuyer[]>();
  
  if (!groupBy.field) {
    groups.set("all", buyers);
    return groups;
  }
  
  buyers.forEach(buyer => {
    const value = String(buyer[groupBy.field as keyof TransformedBuyer] || "Unassigned");
    const existing = groups.get(value) || [];
    existing.push(buyer);
    groups.set(value, existing);
  });
  
  // Sort groups by name
  return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}
