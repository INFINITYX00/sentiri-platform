
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardCheck, Award, Image } from "lucide-react"
import { MaterialImageUpload } from '@/components/stock/MaterialImageUpload'

interface QualityControlStepProps {
  selectedProject: string | null
  generatedPassportId: string | null
  isGeneratingPassport: boolean
  onQualityControlComplete: (productImageUrl?: string) => Promise<void>
}

export function QualityControlStep({ 
  selectedProject, 
  generatedPassportId, 
  isGeneratingPassport, 
  onQualityControlComplete 
}: QualityControlStepProps) {
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null)

  const handleComplete = async () => {
    await onQualityControlComplete(productImageUrl || undefined)
  }

  return (
    <div className="text-center py-12 max-w-2xl mx-auto">
      <ClipboardCheck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Quality Control</h3>
      <p className="text-muted-foreground mb-6">
        Final inspection and quality assurance completed. Add a product image and generate your product passport.
      </p>

      {/* Product Image Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-5 w-5" />
            Product Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an image of your finished product for the passport
            </p>
            <MaterialImageUpload
              onImageUpload={(url) => setProductImageUrl(url)}
              imageUrl={productImageUrl || undefined}
              onImageRemove={() => setProductImageUrl(null)}
            />
          </div>
        </CardContent>
      </Card>

      {selectedProject && !generatedPassportId && (
        <Button 
          className="mt-4"
          onClick={handleComplete}
          disabled={isGeneratingPassport}
          size="lg"
        >
          {isGeneratingPassport ? (
            <>
              <ClipboardCheck className="h-4 w-4 mr-2 animate-spin" />
              Generating Passport...
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              Generate Product Passport
            </>
          )}
        </Button>
      )}
    </div>
  )
}
