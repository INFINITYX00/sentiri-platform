
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Search, Package, Filter } from "lucide-react";
import { useProductPassports } from '@/hooks/useProductPassports';
import { ProductPassportCard } from './ProductPassportCard';
import { QRScanner } from './QRScanner';

export function MaterialPassport() {
  const { productPassports, loading } = useProductPassports();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showScanner, setShowScanner] = useState(false);

  const filteredPassports = productPassports.filter(passport => {
    const matchesSearch = passport.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         passport.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || passport.product_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDownloadQR = async (passportId: string) => {
    const passport = productPassports.find(p => p.id === passportId);
    if (passport?.qr_image_url) {
      try {
        const response = await fetch(passport.qr_image_url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `product-qr-${passport.product_name}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading QR code:', error);
      }
    }
  };

  const uniqueTypes = [...new Set(productPassports.map(p => p.product_type))];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Main Content Area */}
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section - Now inside container */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gradient">Product Passports</h1>
              <p className="text-muted-foreground">Track finished products and their material journey</p>
            </div>
            <Button onClick={() => setShowScanner(!showScanner)}>
              <QrCode className="h-4 w-4 mr-2" />
              {showScanner ? 'Hide Scanner' : 'Scan QR Code'}
            </Button>
          </div>

          {/* QR Scanner */}
          <QRScanner 
            isOpen={showScanner} 
            onClose={() => setShowScanner(false)}
          />

          {/* Search and Filter */}
          <Card className="professional-card">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product name or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="professional-card hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">{productPassports.length}</p>
                  </div>
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Carbon Impact</p>
                    <p className="text-2xl font-bold">
                      {productPassports.reduce((sum, p) => sum + p.total_carbon_footprint, 0).toFixed(1)} kg
                    </p>
                  </div>
                  <QrCode className="h-6 w-6 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="professional-card hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Carbon/Product</p>
                    <p className="text-2xl font-bold">
                      {productPassports.length > 0 
                        ? (productPassports.reduce((sum, p) => sum + p.total_carbon_footprint, 0) / productPassports.length).toFixed(1)
                        : '0'} kg
                    </p>
                  </div>
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Passports Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="professional-card animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded w-16"></div>
                      <div className="h-8 bg-muted rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPassports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPassports.map((passport) => (
                <ProductPassportCard
                  key={passport.id}
                  productPassport={passport}
                  onDownloadQR={handleDownloadQR}
                />
              ))}
            </div>
          ) : (
            <Card className="professional-card">
              <CardContent className="text-center py-12 space-y-6">
                <Package className="h-16 w-16 mx-auto text-muted-foreground animate-fade-in" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gradient">No Product Passports Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'No products match your search criteria' 
                      : 'Complete a project to generate your first product passport'}
                  </p>
                </div>
                {!searchTerm && filterType === 'all' && (
                  <Button onClick={() => window.location.hash = '#bom'} className="hover-lift">
                    Create Your First Project
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
