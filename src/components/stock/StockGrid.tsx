
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Eye, Package } from "lucide-react";

const mockStockItems = [
  {
    id: 1,
    name: "Reclaimed Oak Boards",
    type: "wood",
    quantity: 12,
    unit: "boards",
    dimensions: "2000x200x25mm",
    origin: "Local Demolition",
    carbonFootprint: "2.1 kg CO₂/board",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
    qrCode: "QR001",
    status: "In Stock"
  },
  {
    id: 2,
    name: "Aluminum Composite",
    type: "metal",
    quantity: 8,
    unit: "sheets",
    dimensions: "1200x800x3mm",
    origin: "Recycled Aircraft Parts",
    carbonFootprint: "15.2 kg CO₂/sheet",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop",
    qrCode: "QR002",
    status: "In Stock"
  },
  {
    id: 3,
    name: "Hemp Fiber Composite",
    type: "bio-material",
    quantity: 5,
    unit: "rolls",
    dimensions: "1000x500x10mm",
    origin: "Sustainable Farm Co.",
    carbonFootprint: "0.8 kg CO₂/roll",
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=200&fit=crop",
    qrCode: "QR003",
    status: "Low Stock"
  },
  {
    id: 4,
    name: "Recycled Steel Tubes",
    type: "metal",
    quantity: 25,
    unit: "tubes",
    dimensions: "2000x50x3mm",
    origin: "Industrial Waste Stream",
    carbonFootprint: "12.5 kg CO₂/tube",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop",
    qrCode: "QR004",
    status: "In Stock"
  },
  {
    id: 5,
    name: "Bamboo Plywood",
    type: "wood",
    quantity: 15,
    unit: "sheets",
    dimensions: "1220x610x18mm",
    origin: "Certified Bamboo Forest",
    carbonFootprint: "1.2 kg CO₂/sheet",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&h=200&fit=crop",
    qrCode: "QR005",
    status: "In Stock"
  },
  {
    id: 6,
    name: "Organic Cotton Canvas",
    type: "textile",
    quantity: 3,
    unit: "rolls",
    dimensions: "1500x50m",
    origin: "Fair Trade Cooperative",
    carbonFootprint: "0.3 kg CO₂/m²",
    image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=300&h=200&fit=crop",
    qrCode: "QR006",
    status: "Low Stock"
  }
];

interface StockGridProps {
  searchQuery: string;
  selectedType: string;
}

export function StockGrid({ searchQuery, selectedType }: StockGridProps) {
  const filteredItems = mockStockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.origin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <Card key={item.id} className="sentiri-card hover:border-accent/30 transition-all duration-200 group">
          <div className="relative">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="absolute top-3 right-3">
              <Badge 
                variant={item.status === 'Low Stock' ? 'destructive' : 'default'}
                className={item.status === 'Low Stock' ? '' : 'bg-primary'}
              >
                {item.status}
              </Badge>
            </div>
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                {item.qrCode}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-medium text-xs">{item.dimensions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Origin:</span>
                  <span className="font-medium text-xs">{item.origin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Carbon:</span>
                  <span className="font-medium text-primary text-xs">{item.carbonFootprint}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <QrCode className="h-4 w-4 mr-1" />
                  QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
