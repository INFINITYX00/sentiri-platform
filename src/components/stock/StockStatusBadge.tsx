
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"

interface StockStatusBadgeProps {
  unitsTotal: number
  unitsAvailable: number
}

export function StockStatusBadge({ unitsTotal, unitsAvailable }: StockStatusBadgeProps) {
  const getStockStatus = () => {
    const ratio = unitsAvailable / unitsTotal
    
    if (unitsAvailable === 0) {
      return {
        label: 'Out of Stock',
        variant: 'destructive' as const,
        icon: AlertTriangle
      }
    }
    
    if (ratio <= 0.2) {
      return {
        label: 'Low Stock',
        variant: 'secondary' as const,
        icon: AlertCircle
      }
    }
    
    return {
      label: 'In Stock',
      variant: 'default' as const,
      icon: CheckCircle
    }
  }

  const status = getStockStatus()
  const Icon = status.icon

  return (
    <Badge variant={status.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {status.label}
    </Badge>
  )
}
