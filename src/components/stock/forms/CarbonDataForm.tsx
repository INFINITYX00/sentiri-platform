
import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Brain, Calculator, Loader2, AlertCircle } from 'lucide-react'
import { useAICarbonLookup } from '@/hooks/useAICarbonLookup'
import { useToast } from "@/hooks/use-toast"

interface CarbonDataFormProps {
  formData: {
    type: string
    specific_material: string
    origin: string
    dimensions: string
    quantity: number
    unit: string
    unit_count: number
    carbon_factor: number
    carbon_footprint: number
    carbon_source: string
    length: number
    width: number
    thickness: number
    dimension_unit: string
  }
  onFormDataChange: (updates: Partial<any>) => void
  calculatedWeight: number
  onAiDataReceived: (data: any) => void
}

const carbonSources = [
  'Supplier Documentation',
  'Industry Database',
  'Third-party Certification',
  'Life Cycle Assessment',
  'AI Estimation',
  'Manual Calculation',
  'Environmental Product Declaration',
  'Other'
]

export function CarbonDataForm({ 
  formData, 
  onFormDataChange, 
  calculatedWeight,
  onAiDataReceived 
}: CarbonDataFormProps) {
  const { lookupCarbonData, loading: aiLoading } = useAICarbonLookup()
  const { toast } = useToast()
  const [aiCarbonData, setAiCarbonData] = useState<any>(null)

  const calculateTotalCarbon = () => {
    if (calculatedWeight > 0 && formData.carbon_factor > 0) {
      return formData.carbon_factor * calculatedWeight
    }
    return formData.carbon_footprint || 0
  }

  const handleAILookup = async () => {
    if (!formData.type || !formData.specific_material) {
      toast({
        title: "Missing Information",
        description: "Please select a material type and specify the material before using AI lookup.",
        variant: "destructive"
      })
      return
    }

    try {
      const estimatedWeight = calculatedWeight || 1
      const dimensionsString = formData.length && formData.width && formData.thickness 
        ? `${formData.length}×${formData.width}×${formData.thickness}${formData.dimension_unit}`
        : formData.dimensions

      const carbonData = await lookupCarbonData({
        materialType: formData.type,
        specificMaterial: formData.specific_material,
        origin: formData.origin,
        dimensions: dimensionsString,
        quantity: formData.quantity,
        unit: formData.unit,
        unitCount: formData.unit_count,
        weight: estimatedWeight
      })

      if (carbonData) {
        setAiCarbonData(carbonData)
        onFormDataChange({
          carbon_factor: carbonData.carbonFactor,
          carbon_footprint: carbonData.totalCarbonFootprint,
          carbon_source: 'AI Estimation',
          density: carbonData.density
        })
        onAiDataReceived(carbonData)
        
        toast({
          title: "AI Carbon Data Applied",
          description: `Carbon factor: ${carbonData.carbonFactor.toFixed(2)}kg CO₂/kg • Total: ${carbonData.totalCarbonFootprint.toFixed(2)}kg CO₂e`,
        })
      }
    } catch (error) {
      console.error('AI lookup failed:', error)
    }
  }

  const confidenceColor = aiCarbonData?.confidence >= 0.8 ? 'bg-green-100 text-green-700' : 
                         aiCarbonData?.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 
                         'bg-red-100 text-red-700'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Carbon Footprint</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAILookup}
          disabled={aiLoading || !formData.type || !formData.specific_material}
          className="gap-2"
        >
          {aiLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          AI Lookup
        </Button>
      </div>

      {aiCarbonData && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">AI Carbon Analysis</span>
            <Badge variant="secondary" className={`${confidenceColor} border-0`}>
              {Math.round(aiCarbonData.confidence * 100)}% Confidence
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-600">Carbon Factor:</span>
              <div className="font-semibold text-purple-800">
                {aiCarbonData.carbonFactor?.toFixed(3)} kg CO₂/kg
              </div>
            </div>
            <div>
              <span className="text-purple-600">Total Carbon:</span>
              <div className="font-semibold text-purple-800">
                {aiCarbonData.totalCarbonFootprint?.toFixed(2)} kg CO₂e
              </div>
            </div>
          </div>
          
          <div className="text-sm">
            <span className="text-purple-600">Source:</span>
            <span className="font-medium text-purple-800 ml-2 text-xs">
              {aiCarbonData.source}
            </span>
          </div>
          
          {aiCarbonData.reasoning && (
            <div className="text-xs text-purple-700 bg-purple-100 rounded p-2">
              <strong>AI Reasoning:</strong> {aiCarbonData.reasoning}
            </div>
          )}

          {aiCarbonData.confidence < 0.6 && (
            <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-50 rounded p-2">
              <AlertCircle className="h-3 w-3" />
              Low confidence - consider manual verification
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="carbon_factor">Carbon Factor (kg CO₂/kg)</Label>
          <Input
            id="carbon_factor"
            type="number"
            step="0.001"
            value={formData.carbon_factor}
            onChange={(e) => onFormDataChange({ carbon_factor: parseFloat(e.target.value) || 0 })}
            placeholder="0.000"
          />
          <p className="text-xs text-muted-foreground mt-1">Per-kilogram carbon factor</p>
        </div>

        <div>
          <Label htmlFor="carbon_footprint">Total Carbon Footprint (kg CO₂e)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="carbon_footprint"
              type="number"
              step="0.01"
              value={formData.carbon_footprint}
              onChange={(e) => onFormDataChange({ carbon_footprint: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFormDataChange({ carbon_footprint: calculateTotalCarbon() })}
              className="px-2"
              title="Calculate from carbon factor and weight"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total carbon for all units</p>
        </div>
      </div>

      <div>
        <Label htmlFor="carbon_source">Carbon Data Source</Label>
        <Select 
          value={formData.carbon_source} 
          onValueChange={(value) => onFormDataChange({ carbon_source: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {carbonSources.map(source => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.carbon_factor > 0 && calculatedWeight > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Calculator className="h-4 w-4" />
            <span className="font-medium">Calculated Total:</span>
            <span className="font-semibold">{calculateTotalCarbon().toFixed(2)} kg CO₂e</span>
            <span className="text-xs text-green-600">
              ({formData.carbon_factor.toFixed(3)} kg CO₂/kg × {calculatedWeight.toFixed(2)} kg)
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
