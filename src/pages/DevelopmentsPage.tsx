import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInventory, Development } from '@/contexts/InventoryContext';
import { Building2, Plus, Edit, Trash2, MapPin, Home, PoundSterling, Users, Calendar, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { PDFUploadExtractor } from '@/components/PDFUploadExtractor';

const DevelopmentsPage = () => {
  const { developments, addDevelopment, updateDevelopment, deleteDevelopment } = useInventory();
  const [editingDev, setEditingDev] = useState<Development | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleExtracted = (items: any[]) => {
    items.forEach(item => {
      if (item.data) {
        addDevelopment({
          developmentName: item.data.developmentName || 'Untitled Development',
          developerName: item.data.developerName || '',
          country: item.data.country || '',
          city: item.data.city || '',
          area: item.data.area || '',
          propertyType: item.data.propertyType || '',
          minPrice: item.data.minPrice || 0,
          maxPrice: item.data.maxPrice || 0,
          currency: item.data.currency || 'GBP',
          bedrooms: item.data.bedrooms || [],
          totalUnits: item.data.totalUnits || 0,
          availableUnits: item.data.availableUnits,
          amenities: item.data.amenities || [],
          keyFeatures: item.data.keyFeatures || [],
          completionDate: item.data.completionDate,
          summary: item.data.summary || '',
        });
      }
    });
    
    toast.success(`${items.length} development(s) added successfully`);
    setShowUploadDialog(false);
  };

  const handleSaveEdit = () => {
    if (editingDev) {
      updateDevelopment(editingDev.id, editingDev);
      toast.success('Development updated');
      setEditingDev(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteDevelopment(id);
    toast.success('Development deleted');
  };

  const formatPrice = (price: number, currency: string = 'GBP') => {
    const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
    return `${symbol}${price.toLocaleString()}`;
  };

  return (
    <DashboardLayout title="Developments" userType="developer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Developments</h1>
            <p className="text-muted-foreground">Manage your property developments and their details</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upload PDFs
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Extract Developments from PDFs</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <PDFUploadExtractor 
                    userType="developer" 
                    onExtracted={handleExtracted}
                  />
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
          </div>
        </div>

        {/* Developments Grid */}
        {developments.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Developments Yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload brochures, price lists, or fact sheets to automatically extract development details.
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Upload PDFs to Get Started
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developments.map((dev) => (
              <Card key={dev.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Hero Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {dev.heroImageUrl ? (
                    <img src={dev.heroImageUrl} alt={dev.developmentName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-16 w-16 text-primary/30" />
                  )}
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{dev.developmentName}</h3>
                      {dev.developerName && (
                        <p className="text-sm text-muted-foreground">by {dev.developerName}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingDev(dev)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(dev.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {[dev.area, dev.city, dev.country].filter(Boolean).join(', ') || 'Location not set'}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dev.propertyType && (
                      <Badge variant="secondary">
                        <Home className="h-3 w-3 mr-1" />
                        {dev.propertyType}
                      </Badge>
                    )}
                    {dev.totalUnits > 0 && (
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {dev.totalUnits} units
                      </Badge>
                    )}
                  </div>

                  {(dev.minPrice > 0 || dev.maxPrice > 0) && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <PoundSterling className="h-4 w-4 text-primary" />
                      {formatPrice(dev.minPrice, dev.currency)} - {formatPrice(dev.maxPrice, dev.currency)}
                    </div>
                  )}

                  {dev.bedrooms && dev.bedrooms.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dev.bedrooms.map((bed) => (
                        <Badge key={bed} variant="outline" className="text-xs">{bed}</Badge>
                      ))}
                    </div>
                  )}

                  {dev.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{dev.summary}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingDev} onOpenChange={(open) => !open && setEditingDev(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Development</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              {editingDev && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Development Name</Label>
                      <Input 
                        value={editingDev.developmentName}
                        onChange={(e) => setEditingDev({ ...editingDev, developmentName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Developer Name</Label>
                      <Input 
                        value={editingDev.developerName}
                        onChange={(e) => setEditingDev({ ...editingDev, developerName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input 
                        value={editingDev.country}
                        onChange={(e) => setEditingDev({ ...editingDev, country: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input 
                        value={editingDev.city}
                        onChange={(e) => setEditingDev({ ...editingDev, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Area</Label>
                      <Input 
                        value={editingDev.area}
                        onChange={(e) => setEditingDev({ ...editingDev, area: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Property Type</Label>
                      <Input 
                        value={editingDev.propertyType}
                        onChange={(e) => setEditingDev({ ...editingDev, propertyType: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min Price</Label>
                      <Input 
                        type="number"
                        value={editingDev.minPrice}
                        onChange={(e) => setEditingDev({ ...editingDev, minPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Price</Label>
                      <Input 
                        type="number"
                        value={editingDev.maxPrice}
                        onChange={(e) => setEditingDev({ ...editingDev, maxPrice: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Units</Label>
                      <Input 
                        type="number"
                        value={editingDev.totalUnits}
                        onChange={(e) => setEditingDev({ ...editingDev, totalUnits: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Available Units</Label>
                      <Input 
                        type="number"
                        value={editingDev.availableUnits || ''}
                        onChange={(e) => setEditingDev({ ...editingDev, availableUnits: Number(e.target.value) || null })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bedrooms (comma-separated)</Label>
                    <Input 
                      value={editingDev.bedrooms.join(', ')}
                      onChange={(e) => setEditingDev({ ...editingDev, bedrooms: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      placeholder="Studio, 1 Bed, 2 Bed, 3 Bed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea 
                      value={editingDev.summary}
                      onChange={(e) => setEditingDev({ ...editingDev, summary: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amenities (comma-separated)</Label>
                    <Input 
                      value={editingDev.amenities.join(', ')}
                      onChange={(e) => setEditingDev({ ...editingDev, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Features (comma-separated)</Label>
                    <Input 
                      value={editingDev.keyFeatures.join(', ')}
                      onChange={(e) => setEditingDev({ ...editingDev, keyFeatures: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingDev(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DevelopmentsPage;
