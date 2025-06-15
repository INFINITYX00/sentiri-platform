
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockGrid } from "./StockGrid";
import { AddMaterialDialog } from "./AddMaterialDialog";

export function StockManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Material Stock</h1>
            <p className="text-muted-foreground">Manage your material inventory and track carbon footprints</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Stock Grid - Left Side (2/3 width) */}
            <div className="flex-1 lg:flex-[2]">
              <StockGrid 
                searchQuery={searchQuery} 
                selectedType={selectedType} 
              />
            </div>

            {/* Filter Sidebar - Right Side (1/3 width) */}
            <div className="w-full lg:w-80 lg:flex-none">
              <div className="sticky top-6">
                <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Filters</h3>
                  
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Search Materials
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, origin, or type..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Material Type
                      </label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="wood">Wood</SelectItem>
                          <SelectItem value="reclaimed_wood">Reclaimed Wood</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="plastic">Plastic</SelectItem>
                          <SelectItem value="fabric">Fabric</SelectItem>
                          <SelectItem value="glass">Glass</SelectItem>
                          <SelectItem value="ceramic">Ceramic</SelectItem>
                          <SelectItem value="composite">Composite</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quick Stats */}
                    <div className="pt-4 border-t border-muted">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Materials:</span>
                          <span className="font-medium">—</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Low Stock:</span>
                          <span className="font-medium text-orange-600">—</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Out of Stock:</span>
                          <span className="font-medium text-red-600">—</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddMaterialDialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
