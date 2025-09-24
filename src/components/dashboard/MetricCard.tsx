import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  status?: "success" | "warning" | "info" | "default";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  status = "default",
  className = "" 
}: MetricCardProps) {
  const getCardClass = () => {
    switch (status) {
      case "success":
        return "border-l-4 border-l-success bg-gradient-success/5 hover:bg-gradient-success/10";
      case "warning":
        return "border-l-4 border-l-warning bg-gradient-to-br from-warning/5 to-warning/10 hover:from-warning/10 hover:to-warning/15";
      case "info":
        return "border-l-4 border-l-info bg-gradient-info/5 hover:bg-gradient-info/10";
      default:
        return "border-l-4 border-l-primary professional-card";
    }
  };

  const getTrendClass = () => {
    switch (trend) {
      case "up":
        return "text-success bg-success/10 border-success/20";
      case "down":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  return (
    <Card className={cn(getCardClass(), "hover-lift animate-fade-in", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn(
            "p-2 rounded-md transition-colors",
            status === "success" && "text-success bg-success/10",
            status === "warning" && "text-warning bg-warning/10",
            status === "info" && "text-info bg-info/10",
            status === "default" && "text-primary bg-primary/10"
          )}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
        {trend && trendValue && (
          <Badge 
            variant="outline" 
            className={cn("text-xs font-medium", getTrendClass())}
          >
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}