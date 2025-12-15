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
import { useInventory, Product } from '@/contexts/InventoryContext';
import { Briefcase, Plus, Edit, Trash2, Percent, PoundSterling, Building, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PDFUploadExtractor } from '@/components/PDFUploadExtractor';

const ProductsPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useInventory();
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleExtracted = (items: any[]) => {
    items.forEach(item => {
      if (item.data) {
        addProduct({
          productName: item.data.productName || 'Untitled Product',
          productType: item.data.productType || '',
          lender: item.data.lender || '',
          interestRate: item.data.interestRate || '',
          ltv: item.data.ltv || '',
          termOptions: item.data.termOptions || [],
          minLoan: item.data.minLoan || 0,
          maxLoan: item.data.maxLoan || 0,
          currency: item.data.currency || 'GBP',
          eligibility: item.data.eligibility || [],
          features: item.data.features || [],
          fees: item.data.fees || [],
          description: item.data.description || '',
        });
      }
    });
    
    toast.success(`${items.length} product(s) added successfully`);
    setShowUploadDialog(false);
  };

  const handleSaveEdit = () => {
    if (editingProd) {
      updateProduct(editingProd.id, editingProd);
      toast.success('Product updated');
      setEditingProd(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast.success('Product deleted');
  };

  const formatPrice = (price: number, currency: string = 'GBP') => {
    const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
    return `${symbol}${price.toLocaleString()}`;
  };

  return (
    <DashboardLayout title="Products" userType="broker">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Products</h1>
            <p className="text-muted-foreground">Manage your mortgage and financial products</p>
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
                  <DialogTitle>Extract Products from PDFs</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <PDFUploadExtractor 
                    userType="broker" 
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

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Products Yet</h2>
            <p className="text-muted-foreground mb-6">
              Upload mortgage products, rate sheets, or lender guides to automatically extract product details.
            </p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Upload PDFs to Get Started
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <Card key={prod.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-4">
                  {prod.logoUrl ? (
                    <img src={prod.logoUrl} alt={prod.lender} className="h-full object-contain" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Building className="h-8 w-8 text-primary/50" />
                      <span className="font-semibold text-primary/70">{prod.lender || 'Lender'}</span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight">{prod.productName}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProd(prod)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(prod.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{prod.productType || 'Mortgage'}</Badge>
                    {prod.ltv && (
                      <Badge variant="outline">LTV: {prod.ltv}</Badge>
                    )}
                  </div>

                  {prod.interestRate && (
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Percent className="h-4 w-4 text-primary" />
                      {prod.interestRate}
                    </div>
                  )}

                  {(prod.minLoan > 0 || prod.maxLoan > 0) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <PoundSterling className="h-4 w-4" />
                      {formatPrice(prod.minLoan, prod.currency)} - {formatPrice(prod.maxLoan, prod.currency)}
                    </div>
                  )}

                  {prod.termOptions && prod.termOptions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prod.termOptions.slice(0, 3).map((term) => (
                        <Badge key={term} variant="outline" className="text-xs">{term}</Badge>
                      ))}
                      {prod.termOptions.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{prod.termOptions.length - 3} more</Badge>
                      )}
                    </div>
                  )}

                  {prod.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{prod.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingProd} onOpenChange={(open) => !open && setEditingProd(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              {editingProd && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input 
                        value={editingProd.productName}
                        onChange={(e) => setEditingProd({ ...editingProd, productName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Product Type</Label>
                      <Input 
                        value={editingProd.productType}
                        onChange={(e) => setEditingProd({ ...editingProd, productType: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lender</Label>
                      <Input 
                        value={editingProd.lender}
                        onChange={(e) => setEditingProd({ ...editingProd, lender: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate</Label>
                      <Input 
                        value={editingProd.interestRate}
                        onChange={(e) => setEditingProd({ ...editingProd, interestRate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>LTV</Label>
                      <Input 
                        value={editingProd.ltv}
                        onChange={(e) => setEditingProd({ ...editingProd, ltv: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min Loan</Label>
                      <Input 
                        type="number"
                        value={editingProd.minLoan}
                        onChange={(e) => setEditingProd({ ...editingProd, minLoan: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Loan</Label>
                      <Input 
                        type="number"
                        value={editingProd.maxLoan}
                        onChange={(e) => setEditingProd({ ...editingProd, maxLoan: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={editingProd.description}
                      onChange={(e) => setEditingProd({ ...editingProd, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Term Options (comma-separated)</Label>
                    <Input 
                      value={editingProd.termOptions.join(', ')}
                      onChange={(e) => setEditingProd({ ...editingProd, termOptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Features (comma-separated)</Label>
                    <Input 
                      value={editingProd.features.join(', ')}
                      onChange={(e) => setEditingProd({ ...editingProd, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Eligibility (comma-separated)</Label>
                    <Input 
                      value={editingProd.eligibility.join(', ')}
                      onChange={(e) => setEditingProd({ ...editingProd, eligibility: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>
                </div>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProd(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
