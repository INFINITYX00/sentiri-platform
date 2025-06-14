import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Package } from "lucide-react";
import { StockGrid } from "./StockGrid";
import { AddMaterialDialog } from "./AddMaterialDialog";
import { useMaterials } from '@/hooks/useMaterials';
import { useToast } from '@/hooks/use-toast';

export function StockManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { materials, loading } = useMaterials();

  const materialTypes = ['all', 'wood', 'metal', 'composite', 'textile', 'bio-material'];
  
  // Calculate stock summary from real data
  const stockSummary = materialTypes.slice(1).map(type => {
    const typeMaterials = materials.filter(m => m.type === type);
    const count = typeMaterials.length;
    const totalValue = typeMaterials.reduce((sum, m) => sum + (m.quantity * 10), 0); // Simplified pricing
    
    return {
      type: type.charAt(0).toUpperCase() + type.slice(1).replace('-', '-'),
      count,
      totalValue: `$${totalValue.toLocaleString()}`
    };
  });

  const handleFilterClick = () => {
    toast({
      title: "Filters",
      description: "Advanced filtering options coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-6">
      {/* Header Section */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stock Overview</h1>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stock Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stockSummary.map((category) => (
              <Card key={category.type} className="bg-white/90 backdrop-blur-sm border border-emerald-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{category.type}</p>
                      <p className="text-xl font-bold">{category.count}</p>
                      <p className="text-xs text-primary">{category.totalValue}</p>
                    </div>
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filter */}
          <Card className="bg-white/90 backdrop-blur-sm border border-emerald-100">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search materials by name, type, or origin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFilterClick}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
              
              {/* Material Type Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {materialTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    className={`cursor-pointer capitalize ${
                      selectedType === type 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent/10"
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type === 'all' ? 'All Materials' : type.replace('-', '-')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stock Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground">Loading materials...</p>
              </div>
            </div>
          ) : (
            <StockGrid 
              materials={materials}
              searchQuery={searchQuery} 
              selectedType={selectedType} 
            />
          )}

          {/* Add Material Dialog */}
          <AddMaterialDialog 
            open={isAddDialogOpen} 
            onOpenChange={setIsAddDialogOpen} 
          />
        </div>
      </div>
    </div>
  );
}
