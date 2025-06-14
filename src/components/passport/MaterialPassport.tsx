
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrCode, Search, FileText, Download } from "lucide-react";
import { PassportCard } from "./PassportCard";
import { QRScanner } from "./QRScanner";

export function MaterialPassport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const mockPassports = [
    {
      id: "QR001",
      name: "Reclaimed Oak Boards",
      dateCreated: "2024-01-15",
      specifications: {
        dimensions: "2000x200x25mm",
        weight: "45kg",
        density: "0.75 g/cm³",
        moisture: "12%"
      },
      origin: {
        source: "Victorian Era Building Demolition",
        location: "Manchester, UK",
        certifications: ["FSC Reclaimed", "PEFC"],
        harvestDate: "1890 (estimated)"
      },
      carbonData: {
        embodiedCarbon: "2.1 kg CO₂/board",
        transportCarbon: "0.3 kg CO₂/board",
        totalFootprint: "2.4 kg CO₂/board"
      },
      sustainability: {
        recyclability: "100%",
        renewability: "Renewable",
        toxicity: "Non-toxic",
        endOfLife: "Biodegradable"
      },
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
    },
    {
      id: "QR002",
      name: "Aluminum Composite",
      dateCreated: "2024-01-20",
      specifications: {
        dimensions: "1200x800x3mm",
        weight: "12kg",
        density: "2.7 g/cm³",
        grade: "6061-T6"
      },
      origin: {
        source: "Recycled Aircraft Parts",
        location: "Boeing Facility, Seattle",
        certifications: ["ASI Certified", "ISO 14001"],
        processDate: "2023-12-10"
      },
      carbonData: {
        embodiedCarbon: "12.2 kg CO₂/sheet",
        recyclingOffset: "-3.0 kg CO₂/sheet",
        totalFootprint: "9.2 kg CO₂/sheet"
      },
      sustainability: {
        recyclability: "100%",
        renewability: "Non-renewable",
        toxicity: "Non-toxic",
        endOfLife: "Infinitely recyclable"
      },
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
    },
    {
      id: "QR003",
      name: "Hemp Fiber Composite",
      dateCreated: "2024-01-22",
      specifications: {
        dimensions: "1000x500x10mm",
        weight: "2.5kg",
        density: "0.4 g/cm³",
        fiberContent: "60%"
      },
      origin: {
        source: "Sustainable Farm Cooperative",
        location: "Colorado, USA",
        certifications: ["Organic", "Carbon Negative"],
        harvestDate: "2023-09-15"
      },
      carbonData: {
        embodiedCarbon: "-0.5 kg CO₂/roll",
        transportCarbon: "0.8 kg CO₂/roll",
        totalFootprint: "0.3 kg CO₂/roll"
      },
      sustainability: {
        recyclability: "90%",
        renewability: "Renewable",
        toxicity: "Non-toxic",
        endOfLife: "Compostable"
      },
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=300&fit=crop"
    }
  ];

  const filteredPassports = mockPassports.filter(passport =>
    passport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    passport.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen app-background">
      {/* Header Section */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Material Passports</h1>
            <p className="text-muted-foreground mt-1">Digital certificates for sustainable materials</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowScanner(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR Code
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <FileText className="h-4 w-4 mr-2" />
              Generate New
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid-section space-y-6">
        {/* Search */}
        <Card className="sentiri-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by material name or QR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Passport Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="sentiri-card">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{mockPassports.length}</p>
                <p className="text-sm text-muted-foreground">Total Passports</p>
              </div>
            </CardContent>
          </Card>
          <Card className="sentiri-card">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">85%</p>
                <p className="text-sm text-muted-foreground">Renewable Materials</p>
              </div>
            </CardContent>
          </Card>
          <Card className="sentiri-card">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">92%</p>
                <p className="text-sm text-muted-foreground">Recyclable</p>
              </div>
            </CardContent>
          </Card>
          <Card className="sentiri-card">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">-12%</p>
                <p className="text-sm text-muted-foreground">Avg Carbon Impact</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Passport Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPassports.map((passport) => (
            <PassportCard key={passport.id} passport={passport} />
          ))}
        </div>

        {/* QR Scanner Modal */}
        {showScanner && (
          <QRScanner 
            isOpen={showScanner} 
            onClose={() => setShowScanner(false)} 
          />
        )}
      </div>
    </div>
  );
}
