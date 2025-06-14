
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Package } from "lucide-react";
import { StockGrid } from "./StockGrid";
import { AddMaterialDialog } from "./AddMaterialDialog";

export function StockManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const materialTypes = ['all', 'wood', 'metal', 'composite', 'textile', 'bio-material'];
  
  const stockSummary = [
    { type: 'Wood', count: 45, totalValue: '$12,340' },
    { type: 'Metal', count: 28, totalValue: '$8,750' },
    { type: 'Composite', count: 22, totalValue: '$15,600' },
    { type: 'Textile', count: 18, totalValue: '$3,200' },
    { type: 'Bio-material', count: 12, totalValue: '$5,400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your sustainable material inventory</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stockSummary.map((category) => (
          <Card key={category.type} className="sentiri-card">
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
      <Card className="sentiri-card">
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
              <Button variant="outline" size="sm">
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
                {type === 'all' ? 'All Materials' : type}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Grid */}
      <StockGrid searchQuery={searchQuery} selectedType={selectedType} />

      {/* Add Material Dialog */}
      <AddMaterialDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
}
