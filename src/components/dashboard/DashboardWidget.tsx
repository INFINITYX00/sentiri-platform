
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
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
