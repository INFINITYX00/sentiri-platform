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
import { MetricCard } from "./MetricCard";
import { UserMenu } from "@/components/auth/UserMenu";
import { useCompanyData } from "@/hooks/useCompanyData";

export function DashboardOverview() {
  const { metrics, loading, refreshMetrics } = useDynamicDashboardMetrics();
  const { company, subscription } = useCompanyData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gradient animate-fade-in">Dashboard Overview</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="professional-card animate-pulse">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded-lg w-3/4 shimmer"></div>
                    <div className="h-8 bg-muted rounded-lg w-1/2 shimmer"></div>
                    <div className="h-3 bg-muted rounded w-full shimmer"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Main Content Area */}
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section - Enhanced with better typography */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>
                {subscription.isTrial && (
                  <Badge variant="outline" className="status-info border-info/30 animate-scale-in">
                    Trial Account
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-muted-foreground font-medium">
                  {company?.name} • Real-time insights into your manufacturing operations
                </p>
                <span className="text-xs text-muted-foreground/80 bg-muted/30 px-2 py-1 rounded-full">
                  Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={refreshMetrics} className="hover-scale">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <UserMenu />
            </div>
          </div>

          {/* Subscription Status Alert - Enhanced */}
          {subscription.trialExpired && (
            <Card className="border-warning/30 bg-gradient-to-r from-warning/10 to-warning/5 animate-slide-up">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-warning-foreground">Trial Expired</p>
                    <p className="text-sm text-warning-foreground/80">
                      Upgrade to continue using all features
                    </p>
                  </div>
                  <Button size="lg" variant="gradient" className="hover-scale">
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics Cards - Enhanced with MetricCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Projects"
              value={metrics.totalProjects}
              subtitle={`${metrics.activeProjects} in progress, ${metrics.completedProjects} completed`}
              icon={<Factory className="h-5 w-5" />}
              status="info"
              trend="up"
              trendValue="+12%"
            />
            
            <MetricCard
              title="Carbon Footprint"
              value={`${metrics.totalCarbonSaved.toFixed(1)} kg`}
              subtitle="CO₂ tracked across all projects"
              icon={<Leaf className="h-5 w-5" />}
              status="success"
              trend="down"
              trendValue="-8.5%"
            />

            <MetricCard
              title="Production Status"
              value={metrics.activeStages}
              subtitle={`${metrics.workersActive} workers active`}
              icon={<Activity className="h-5 w-5" />}
              status="warning"
              trend="up"
              trendValue="+5%"
            />

            <MetricCard
              title="Efficiency"
              value={`${metrics.productionEfficiency.toFixed(0)}%`}
              subtitle="Production efficiency"
              icon={<TrendingUp className="h-5 w-5" />}
              status="success"
              trend="up"
              trendValue="+3.2%"
            />
          </div>

          {/* Secondary Metrics - Enhanced with modern cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="professional-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Materials</p>
                    <p className="text-2xl font-bold text-gradient">{metrics.totalMaterials}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
                  {metrics.lowStockMaterials} need restocking
                </p>
              </CardContent>
            </Card>

            <Card className="professional-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Investment</p>
                    <p className="text-2xl font-bold text-gradient-success">£{metrics.totalCost.toFixed(0)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Total project value
                </p>
              </CardContent>
            </Card>

            <Card className="professional-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Energy Used</p>
                    <p className="text-2xl font-bold text-gradient-info">{metrics.energyConsumed.toFixed(0)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10">
                    <Zap className="h-6 w-6 text-warning" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  kWh consumed this month
                </p>
              </CardContent>
            </Card>

            <Card className="professional-card hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Waste Reduction</p>
                    <p className="text-2xl font-bold text-gradient">{metrics.wasteReduction.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Recycle className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Material efficiency improvement
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

          {/* Recent Activity - Enhanced design */}
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gradient flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recentActivity.length > 0 ? (
                  metrics.recentActivity.map((activity) => (
                    <div key={`${activity.type}-${activity.id}`} className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-subtle hover:shadow-md transition-all duration-300 border border-border/50">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-card">
                        {activity.type === 'project' && <Factory className="h-5 w-5 text-info" />}
                        {activity.type === 'material' && <Package className="h-5 w-5 text-success" />}
                        {activity.type === 'production' && <TrendingUp className="h-5 w-5 text-warning" />}
                        {activity.type === 'stage' && <Activity className="h-5 w-5 text-primary" />}
                        {activity.type === 'passport' && <Leaf className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium text-card-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>
                            {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 capitalize status-info">
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-12 space-y-4">
                    <div className="p-4 rounded-full bg-gradient-subtle mx-auto w-fit">
                      <TrendingUp className="h-12 w-12 opacity-50" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">No recent activity</p>
                      <p className="text-sm">Start by creating a project or adding materials to see activity here.</p>
                    </div>
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
