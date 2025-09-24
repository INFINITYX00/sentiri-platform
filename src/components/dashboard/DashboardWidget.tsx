
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardWidgetProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardWidget({ title, icon, children, className = "" }: DashboardWidgetProps) {
  return (
    <Card className={`professional-card hover-lift animate-fade-in ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold text-gradient">{title}</CardTitle>
        {icon && <div className="text-muted-foreground opacity-80 hover:opacity-100 transition-opacity">{icon}</div>}
      </CardHeader>
      <CardContent className="space-y-2">
        {children}
      </CardContent>
    </Card>
  )
}
