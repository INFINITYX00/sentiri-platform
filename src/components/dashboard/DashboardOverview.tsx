
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingDown, Zap, Leaf } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function DashboardOverview() {
  const metrics = [
    {
      title: "Active Stock Items",
      value: "147",
      change: "+12%",
      icon: Package,
      color: "text-blue-400"
    },
    {
      title: "Carbon Footprint",
      value: "2.3t CO₂",
      change: "-8%",
      icon: Leaf,
      color: "text-primary"
    },
    {
      title: "Energy Usage",
      value: "1,240 kWh",
      change: "-5%",
      icon: Zap,
      color: "text-yellow-400"
    },
    {
      title: "Waste Reduced",
      value: "34%",
      change: "+15%",
      icon: TrendingDown,
      color: "text-green-400"
    }
  ];

  const recentProjects = [
    { name: "Eco-Chair Series", status: "In Progress", completion: 75, materials: 8 },
    { name: "Sustainable Desk", status: "Needs Materials", completion: 45, materials: 12 },
    { name: "Bamboo Shelving", status: "Assembly", completion: 90, materials: 6 },
  ];

  const lowStockItems = [
    { name: "Reclaimed Oak", quantity: 3, unit: "boards", threshold: 10 },
    { name: "Hemp Fiber", quantity: 1.2, unit: "kg", threshold: 5 },
    { name: "Bio-based Resin", quantity: 0.5, unit: "L", threshold: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to your sustainable manufacturing hub</p>
        </div>
        <Badge variant="outline" className="border-primary/30 text-primary">
          Carbon Neutral Goals: 67% Complete
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="sentiri-card hover:border-accent/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <p className={`text-sm mt-1 ${metric.change.startsWith('+') ? 'text-red-400' : 'text-green-400'}`}>
                    {metric.change} from last month
                  </p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="sentiri-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span>Active Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{project.name}</h4>
                  <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress value={project.completion} className="flex-1" />
                  <span className="text-sm text-muted-foreground">{project.completion}%</span>
                </div>
                <p className="text-xs text-muted-foreground">{project.materials} materials allocated</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="sentiri-card border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-400">
              <Package className="h-5 w-5" />
              <span>Low Stock Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit} remaining
                  </p>
                </div>
                <Badge variant="outline" className="border-orange-500/30 text-orange-400">
                  Reorder Soon
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="sentiri-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
              <h4 className="font-medium text-primary">Add New Material</h4>
              <p className="text-sm text-muted-foreground mt-1">Upload photos and create material passport</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
              <h4 className="font-medium text-blue-400">Upload BOM</h4>
              <p className="text-sm text-muted-foreground mt-1">Calculate carbon footprint for new project</p>
            </div>
            <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer">
              <h4 className="font-medium text-purple-400">Generate Report</h4>
              <p className="text-sm text-muted-foreground mt-1">Export sustainability metrics and insights</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
