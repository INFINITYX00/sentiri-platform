
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Leaf, 
  Factory, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Zap,
  Recycle,
  RefreshCw,
  Users,
  Activity
} from "lucide-react";
import { useDynamicDashboardMetrics } from "@/hooks/useDynamicDashboardMetrics";
import { ActiveProjectsWidget } from "./ActiveProjectsWidget";
import { StockAlertsWidget } from "./StockAlertsWidget";
import { RecentPassportsWidget } from "./RecentPassportsWidget";
import { QuickActionsWidget } from "./QuickActionsWidget";
import { ManufacturingStatusWidget } from "./ManufacturingStatusWidget";
import { DashboardWidget } from "./DashboardWidget";

export function DashboardOverview() {
  const { metrics, loading, refreshMetrics } = useDynamicDashboardMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
        <div className="px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Real-time insights into your manufacturing operations</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-8 py-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Factory className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.activeProjects} active, {metrics.completedProjects} completed
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Impact</CardTitle>
                <Leaf className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCarbonSaved.toFixed(1)} kg</div>
                <p className="text-xs text-muted-foreground">
                  CO₂ tracked across all projects
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Production Status</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeStages}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.workersActive} workers active
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.productionEfficiency.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  Production efficiency
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Materials</p>
                    <p className="text-xl font-bold">{metrics.totalMaterials}</p>
                  </div>
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.lowStockMaterials} need restocking
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Investment</p>
                    <p className="text-xl font-bold">${metrics.totalCost.toFixed(0)}</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total project value
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Energy Used</p>
                    <p className="text-xl font-bold">{metrics.energyConsumed.toFixed(0)}</p>
                  </div>
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  kWh consumed
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Waste Reduction</p>
                    <p className="text-xl font-bold">{metrics.wasteReduction.toFixed(0)}%</p>
                  </div>
                  <Recycle className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Material efficiency
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ActiveProjectsWidget projects={metrics.activeProjectsList} />
              <ManufacturingStatusWidget stages={metrics.manufacturingStages} />
            </div>

            <div className="space-y-6">
              <QuickActionsWidget />
              <StockAlertsWidget stockAlerts={metrics.stockAlerts} />
              <RecentPassportsWidget passports={metrics.recentPassports} />
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentActivity.length > 0 ? (
                  metrics.recentActivity.map((activity) => (
                    <div key={`${activity.type}-${activity.id}`} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <div className="flex-shrink-0">
                        {activity.type === 'project' && <Factory className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'material' && <Package className="h-4 w-4 text-green-500" />}
                        {activity.type === 'production' && <TrendingUp className="h-4 w-4 text-orange-500" />}
                        {activity.type === 'stage' && <Activity className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'passport' && <Leaf className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No recent activity. Start by creating a project or adding materials.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
