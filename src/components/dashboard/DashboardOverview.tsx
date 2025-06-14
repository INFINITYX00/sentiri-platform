
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      changeColor: "text-red-500"
    },
    {
      title: "Carbon Footprint",
      value: "2.3t CO₂",
      change: "-8%",
      icon: Leaf,
      color: "text-green-600",
      bgColor: "bg-green-50",
      changeColor: "text-green-600"
    },
    {
      title: "Energy Usage",
      value: "1,240 kWh",
      change: "-5%",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      changeColor: "text-green-600"
    },
    {
      title: "Waste Reduced",
      value: "34%",
      change: "+15%",
      icon: TrendingDown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      changeColor: "text-red-500"
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
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back to your sustainable manufacturing hub</p>
        </div>
        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 px-4 py-2">
          Carbon Neutral Goals: 67% Complete
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="metric-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className={`text-sm font-medium ${metric.changeColor}`}>
                  {metric.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="chart-container">
          <div className="flex items-center space-x-2 mb-6">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
          </div>
          <div className="space-y-6">
            {recentProjects.map((project, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <Badge 
                    variant={project.status === 'In Progress' ? 'default' : 'secondary'}
                    className={project.status === 'In Progress' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-100'}
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <Progress value={project.completion} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-gray-600">{project.completion}%</span>
                </div>
                <p className="text-xs text-gray-500">{project.materials} materials allocated</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="chart-container border-orange-200">
          <div className="flex items-center space-x-2 mb-6">
            <Package className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="space-y-4">
            {lowStockItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.quantity} {item.unit} remaining
                  </p>
                </div>
                <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                  Reorder Soon
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
            <h4 className="font-semibold text-green-700 mb-2">Add New Material</h4>
            <p className="text-sm text-green-600">Upload photos and create material passport</p>
          </div>
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
            <h4 className="font-semibold text-blue-700 mb-2">Upload BOM</h4>
            <p className="text-sm text-blue-600">Calculate carbon footprint for new project</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer">
            <h4 className="font-semibold text-purple-700 mb-2">Generate Report</h4>
            <p className="text-sm text-purple-600">Export sustainability metrics and insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
