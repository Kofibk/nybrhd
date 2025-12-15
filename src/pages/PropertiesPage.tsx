import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInventory, Property } from '@/contexts/InventoryContext';
import { Home, Plus, Edit, Trash2, MapPin, Bed, Bath, Ruler, PoundSterling, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PDFUploadExtractor } from '@/components/PDFUploadExtractor';

const PropertiesPage = () => {
  const { properties, addProperty, updateProperty, deleteProperty } = useInventory();
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleExtracted = (items: any[]) => {
    items.forEach(item => {
      if (item.data) {
        addProperty({
          propertyName: item.data.propertyName || 'Untitled Property',
          propertyType: item.data.propertyType || '',
          country: item.data.country || '',
          city: item.data.city || '',
          area: item.data.area || '',
          postcode: item.data.postcode,
          price: item.data.price || 0,
          currency: item.data.currency || 'GBP',
          priceType: item.data.priceType || 'sale',
          bedrooms: item.data.bedrooms || 0,
          bathrooms: item.data.bathrooms || 0,
          squareFootage: item.data.squareFootage,
          features: item.data.features || [],
          description: item.data.description || '',
          status: item.data.status || 'Available',
        });
      }
    });
    
    toast.success(`${items.length} property/properties added successfully`);
    setShowUploadDialog(false);
  };

  const handleSaveEdit = () => {
    if (editingProp) {
      updateProperty(editingProp.id, editingProp);
      toast.success('Property updated');
      setEditingProp(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteProperty(id);
    toast.success('Property deleted');
  };

  const formatPrice = (price: number, currency: string = 'GBP') => {
    const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
    return `${symbol}${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'under offer': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'sold': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'let': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return '';
    }
  };

  return (
    <DashboardLayout title="Properties" userType="agent">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Properties</h1>
            <p className="text-muted-foreground">Manage your property listings and portfolios</p>
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
                  <DialogTitle>Extract Properties from PDFs</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <PDFUploadExtractor 
                    userType="agent" 
                    onExtracted={handleExtracted}
                  />
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Manually
            </Button>
          </div>
        </div>

        {/* Properties Grid */}
        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <Home className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Properties Yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload property details, listings, or portfolios to automatically extract property information.
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Upload PDFs to Get Started
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <Card key={prop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  {prop.heroImageUrl ? (
                    <img src={prop.heroImageUrl} alt={prop.propertyName} className="w-full h-full object-cover" />
                  ) : (
                    <Home className="h-16 w-16 text-primary/30" />
                  )}
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight">{prop.propertyName}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProp(prop)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(prop.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {[prop.area, prop.city, prop.postcode].filter(Boolean).join(', ') || 'Location not set'}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{prop.propertyType || 'Property'}</Badge>
                    <Badge className={getStatusColor(prop.status)}>{prop.status}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <PoundSterling className="h-4 w-4 text-primary" />
                    {formatPrice(prop.price, prop.currency)}
                    {prop.priceType === 'rent' && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                  </div>

                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {prop.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {prop.bedrooms}
                      </span>
                    )}
                    {prop.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {prop.bathrooms}
                      </span>
                    )}
                    {prop.squareFootage && (
                      <span className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" />
                        {prop.squareFootage.toLocaleString()} sq ft
                      </span>
                    )}
                  </div>

                  {prop.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{prop.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingProp} onOpenChange={(open) => !open && setEditingProp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Property</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              {editingProp && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Property Name/Address</Label>
                      <Input 
                        value={editingProp.propertyName}
                        onChange={(e) => setEditingProp({ ...editingProp, propertyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Property Type</Label>
                      <Input 
                        value={editingProp.propertyType}
                        onChange={(e) => setEditingProp({ ...editingProp, propertyType: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input 
                        value={editingProp.city}
                        onChange={(e) => setEditingProp({ ...editingProp, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Area</Label>
                      <Input 
                        value={editingProp.area}
                        onChange={(e) => setEditingProp({ ...editingProp, area: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postcode</Label>
                      <Input 
                        value={editingProp.postcode || ''}
                        onChange={(e) => setEditingProp({ ...editingProp, postcode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input 
                        type="number"
                        value={editingProp.price}
                        onChange={(e) => setEditingProp({ ...editingProp, price: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bedrooms</Label>
                      <Input 
                        type="number"
                        value={editingProp.bedrooms}
                        onChange={(e) => setEditingProp({ ...editingProp, bedrooms: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bathrooms</Label>
                      <Input 
                        type="number"
                        value={editingProp.bathrooms}
                        onChange={(e) => setEditingProp({ ...editingProp, bathrooms: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={editingProp.description}
                      onChange={(e) => setEditingProp({ ...editingProp, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Features (comma-separated)</Label>
                    <Input 
                      value={editingProp.features.join(', ')}
                      onChange={(e) => setEditingProp({ ...editingProp, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProp(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PropertiesPage;
