
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

  console.log('🏢 StockManagement rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section - Now inside container */}
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

          {/* Filter Section - Above the cards */}
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Search Input */}
              <div className="flex-1 min-w-0">
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
              <div className="w-full sm:w-64">
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
            </div>
          </div>

          {/* Stock Grid */}
          <StockGrid 
            searchQuery={searchQuery} 
            selectedType={selectedType} 
          />
        </div>
      </div>

      <AddMaterialDialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
