
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Eye, Leaf } from "lucide-react";

interface PassportData {
  id: string;
  name: string;
  dateCreated: string;
  specifications: {
    dimensions: string;
    weight: string;
    density: string;
    [key: string]: string;
  };
  origin: {
    source: string;
    location: string;
    certifications: string[];
    [key: string]: string | string[];
  };
  carbonData: {
    embodiedCarbon: string;
    totalFootprint: string;
    [key: string]: string;
  };
  sustainability: {
    recyclability: string;
    renewability: string;
    toxicity: string;
    endOfLife: string;
  };
  image: string;
}

interface PassportCardProps {
  passport: PassportData;
}

export function PassportCard({ passport }: PassportCardProps) {
  const isLowCarbon = passport.carbonData.totalFootprint.includes('-') || 
                      parseFloat(passport.carbonData.totalFootprint) < 5;

  return (
    <Card className="sentiri-card hover:border-accent/30 transition-all duration-200">
      <div className="relative">
        <img 
          src={passport.image} 
          alt={passport.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-background/80 backdrop-blur-sm text-foreground">
            {passport.id}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          {isLowCarbon && (
            <Badge className="bg-primary/90 text-primary-foreground">
              <Leaf className="h-3 w-3 mr-1" />
              Low Carbon
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{passport.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Created: {new Date(passport.dateCreated).toLocaleDateString()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Specifications */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Specifications</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Size:</span>
              <p className="font-medium">{passport.specifications.dimensions}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Weight:</span>
              <p className="font-medium">{passport.specifications.weight}</p>
            </div>
          </div>
        </div>

        {/* Origin */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Origin</h4>
          <p className="text-xs text-muted-foreground">{passport.origin.source}</p>
          <p className="text-xs font-medium">{passport.origin.location}</p>
        </div>

        {/* Carbon Footprint */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Carbon Impact</h4>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total Footprint:</span>
            <Badge 
              variant={isLowCarbon ? "default" : "secondary"}
              className={isLowCarbon ? "bg-primary" : ""}
            >
              {passport.carbonData.totalFootprint}
            </Badge>
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Certifications</h4>
          <div className="flex flex-wrap gap-1">
            {passport.origin.certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sustainability Score */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Sustainability</span>
            <div className="flex items-center space-x-1">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">
                {passport.sustainability.recyclability}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {passport.sustainability.renewability} • {passport.sustainability.endOfLife}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            View Full
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <QrCode className="h-4 w-4 mr-1" />
            Show QR
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
