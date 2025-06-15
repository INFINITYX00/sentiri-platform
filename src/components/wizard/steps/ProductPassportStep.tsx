
import React from 'react'
import { Button } from "@/components/ui/button"
import { Award, QrCode, ExternalLink, Eye, Download } from "lucide-react"
import type { ProductPassport } from '@/hooks/useProductPassports'

interface ProductPassportStepProps {
  passport: ProductPassport | null
  onViewDetails: () => void
  onDownloadQR?: () => void
}

export function ProductPassportStep({ passport, onViewDetails, onDownloadQR }: ProductPassportStepProps) {
  return (
    <div className="text-center py-12 max-w-2xl mx-auto">
      <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Product Passport Generated!</h3>
      <p className="text-muted-foreground mb-6">
        Your product passport has been created successfully
      </p>
      
      {passport && (
        <div className="max-w-md mx-auto bg-muted/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            {passport.qr_image_url ? (
              <img 
                src={passport.qr_image_url} 
                alt="Product QR Code"
                className="w-24 h-24 object-contain border rounded bg-white p-1"
              />
            ) : (
              <QrCode className="w-24 h-24 text-muted-foreground" />
            )}
          </div>
          
          {passport.image_url && (
            <div className="mb-4">
              <img 
                src={passport.image_url} 
                alt={passport.product_name}
                className="w-32 h-32 object-cover rounded-lg mx-auto border"
              />
            </div>
          )}
          
          <h4 className="font-semibold mb-2">{passport.product_name}</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Carbon Footprint: {passport.total_carbon_footprint.toFixed(2)} kg CO₂
          </p>
          <p className="text-sm text-muted-foreground">
            Generated: {new Date(passport.production_date).toLocaleDateString()}
          </p>
        </div>
      )}
      
      <div className="flex gap-3 justify-center flex-wrap">
        <Button 
          onClick={() => window.location.hash = '#passport'}
          variant="outline"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View All Passports
        </Button>
        {passport && (
          <>
            <Button onClick={onViewDetails}>
              <Eye className="h-4 w-4 mr-2" />
              View Passport Details
            </Button>
            {onDownloadQR && (
              <Button 
                onClick={onDownloadQR}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
