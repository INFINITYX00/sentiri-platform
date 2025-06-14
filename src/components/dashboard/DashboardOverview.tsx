
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
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      changeColor: "text-emerald-600"
    },
    {
      title: "Energy Usage",
      value: "1,240 kWh",
      change: "-5%",
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      changeColor: "text-emerald-600"
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
    <div className="min-h-screen app-background">
      {/* Header Section */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back to your sustainable manufacturing hub</p>
          </div>
          <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50/80 px-6 py-3 text-sm font-medium">
            Carbon Neutral Goals: 67% Complete
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid-section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div key={metric.title} className="metric-card group">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                  <p className={`text-sm font-medium ${metric.changeColor}`}>
                    {metric.change} from last month
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Projects */}
          <div className="chart-container">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Leaf className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Active Projects</h3>
            </div>
            <div className="space-y-6">
              {recentProjects.map((project, index) => (
                <div key={index} className="space-y-4 p-4 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">{project.name}</h4>
                    <Badge 
                      variant={project.status === 'In Progress' ? 'default' : 'secondary'}
                      className={project.status === 'In Progress' 
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress value={project.completion} className="flex-1 h-3" />
                    <span className="text-sm font-semibold text-slate-700 min-w-[3rem]">{project.completion}%</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{project.materials} materials allocated</p>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="chart-container border-amber-200/60">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Low Stock Alerts</h3>
            </div>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-6 bg-amber-50/60 rounded-xl border border-amber-200/60 hover:bg-amber-50 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-600 font-medium">
                      {item.quantity} {item.unit} remaining
                    </p>
                  </div>
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 font-medium">
                    Reorder Soon
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="chart-container">
          <h3 className="text-xl font-semibold text-slate-900 mb-8">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-emerald-50/60 rounded-xl border border-emerald-200/60 hover:bg-emerald-50 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <h4 className="font-semibold text-emerald-700 mb-3 group-hover:text-emerald-800">Add New Material</h4>
              <p className="text-sm text-emerald-600 font-medium">Upload photos and create material passport</p>
            </div>
            <div className="p-8 bg-blue-50/60 rounded-xl border border-blue-200/60 hover:bg-blue-50 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <h4 className="font-semibold text-blue-700 mb-3 group-hover:text-blue-800">Upload BOM</h4>
              <p className="text-sm text-blue-600 font-medium">Calculate carbon footprint for new project</p>
            </div>
            <div className="p-8 bg-purple-50/60 rounded-xl border border-purple-200/60 hover:bg-purple-50 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <h4 className="font-semibold text-purple-700 mb-3 group-hover:text-purple-800">Generate Report</h4>
              <p className="text-sm text-purple-600 font-medium">Export sustainability metrics and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
