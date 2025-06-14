
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
            <p className="text-sm text-gray-500">Welcome back to your sustainable manufacturing hub</p>
          </div>
          <div className="flex items-center space-x-3">
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <option>Today</option>
              <option>Week</option>
              <option>Month</option>
              <option>Year</option>
            </select>
            <Badge variant="outline" className="border-lime-200 text-lime-700 bg-lime-50 px-4 py-2 text-sm font-medium">
              18 Jun, 2024 — 18 July, 2024
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.title} className="bg-white border border-gray-200 hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-sm font-medium ${metric.changeColor}`}>
                      {metric.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Active Projects</CardTitle>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <Badge 
                      variant={project.status === 'In Progress' ? 'default' : 'secondary'}
                      className={project.status === 'In Progress' 
                        ? 'bg-lime-100 text-lime-800 hover:bg-lime-100 border-lime-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={project.completion} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-gray-700 min-w-[3rem]">{project.completion}%</span>
                  </div>
                  <p className="text-xs text-gray-500">{project.materials} materials allocated</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Low Stock Alerts</CardTitle>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="space-y-1">
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
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-lime-50 rounded-lg border border-lime-100 hover:bg-lime-100 hover:shadow-sm transition-all cursor-pointer group">
                <h4 className="font-medium text-lime-800 mb-2 group-hover:text-lime-900">Add New Material</h4>
                <p className="text-sm text-lime-600">Upload photos and create material passport</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 hover:shadow-sm transition-all cursor-pointer group">
                <h4 className="font-medium text-blue-800 mb-2 group-hover:text-blue-900">Upload BOM</h4>
                <p className="text-sm text-blue-600">Calculate carbon footprint for new project</p>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 hover:shadow-sm transition-all cursor-pointer group">
                <h4 className="font-medium text-purple-800 mb-2 group-hover:text-purple-900">Generate Report</h4>
                <p className="text-sm text-purple-600">Export sustainability metrics and insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
