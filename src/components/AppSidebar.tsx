
import { 
  Home, 
  Package, 
  FileText, 
  Layers, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Upload,
  QrCode,
  Clock,
  FolderOpen,
  Truck,
  Recycle,
  ChevronDown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: Home,
  },
  {
    title: "Stock Overview",
    url: "stock",
    icon: Package,
  },
  {
    title: "Material Passport",
    url: "passport",
    icon: FileText,
  },
  {
    title: "Design Workspace",
    url: "design",
    icon: Layers,
  },
  {
    title: "BOM & Carbon",
    url: "bom",
    icon: ShoppingCart,
  },
  {
    title: "AI Insights",
    url: "insights",
    icon: TrendingUp,
  },
];

const projectMenuItems = [
  {
    title: "Energy Estimator",
    url: "energy",
    icon: TrendingUp,
  },
  {
    title: "Labor Calculator",
    url: "labor",
    icon: Clock,
  },
  {
    title: "Manufacturing Stages",
    url: "manufacturing",
    icon: Layers,
  },
];

const timeTrackingItems = [
  {
    title: "Time Logging",
    url: "time-logging",
    icon: Clock,
  },
  {
    title: "Project Hours",
    url: "project-hours",
    icon: FolderOpen,
  },
];

const shippingItems = [
  {
    title: "Shipping Tracker",
    url: "shipping",
    icon: Truck,
  },
  {
    title: "Transport Emissions",
    url: "transport",
    icon: TrendingUp,
  },
];

const lifecycleItems = [
  {
    title: "Takeback System",
    url: "takeback",
    icon: Recycle,
  },
];

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "Add Stock":
        setActiveView("stock");
        toast({
          title: "Navigation",
          description: "Switched to Stock Overview to add materials",
        });
        break;
      case "Upload BOM":
        setActiveView("bom");
        toast({
          title: "Navigation", 
          description: "Switched to BOM & Carbon section",
        });
        break;
      case "Generate Passport":
        setActiveView("passport");
        toast({
          title: "Navigation",
          description: "Switched to Material Passport section",
        });
        break;
      default:
        toast({
          title: "Feature",
          description: `${action} functionality coming soon!`,
        });
    }
  };

  const handleNavigation = (url: string) => {
    setActiveView(url);
    toast({
      title: "Navigation",
      description: `Switched to ${url}`,
    });
  };

  return (
    <Sidebar className="border-r border-slate-200/20">
      <SidebarHeader className="p-8 border-b border-slate-200/20">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/3acb41e9-62fb-4c55-ba24-9bada4c245de.png" 
            alt="Sentiri Logo" 
            className="h-16 w-auto max-w-full"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-4">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setActiveView(item.url)}
                    isActive={activeView === item.url}
                    className="hover:bg-emerald-50/80 data-[active=true]:bg-emerald-50/80 data-[active=true]:text-emerald-700 data-[active=true]:font-semibold rounded-xl px-4 py-3 transition-all duration-200"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-4">
            Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="projects" className="border-none">
                <AccordionTrigger className="hover:bg-emerald-50/80 rounded-xl px-4 py-3 hover:no-underline font-medium">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="h-5 w-5" />
                    <span>Projects</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="ml-6 space-y-1">
                    {projectMenuItems.map((item) => (
                      <button
                        key={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 rounded-lg transition-all duration-200"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="time-tracking" className="border-none">
                <AccordionTrigger className="hover:bg-emerald-50/80 rounded-xl px-4 py-3 hover:no-underline font-medium">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5" />
                    <span>Time Tracking</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="ml-6 space-y-1">
                    {timeTrackingItems.map((item) => (
                      <button
                        key={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 rounded-lg transition-all duration-200"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" className="border-none">
                <AccordionTrigger className="hover:bg-emerald-50/80 rounded-xl px-4 py-3 hover:no-underline font-medium">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5" />
                    <span>Shipping & Transport</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="ml-6 space-y-1">
                    {shippingItems.map((item) => (
                      <button
                        key={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 rounded-lg transition-all duration-200"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="lifecycle" className="border-none">
                <AccordionTrigger className="hover:bg-emerald-50/80 rounded-xl px-4 py-3 hover:no-underline font-medium">
                  <div className="flex items-center space-x-3">
                    <Recycle className="h-5 w-5" />
                    <span>Lifecycle</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-0">
                  <div className="ml-6 space-y-1">
                    {lifecycleItems.map((item) => (
                      <button
                        key={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700 rounded-lg transition-all duration-200"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-4">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-200/40 hover:bg-emerald-50/80 hover:border-emerald-200/60 hover:text-emerald-700 rounded-xl px-4 py-3 font-medium transition-all duration-200"
                onClick={() => handleQuickAction("Add Stock")}
              >
                <Plus className="h-4 w-4 mr-3" />
                Add Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-200/40 hover:bg-emerald-50/80 hover:border-emerald-200/60 hover:text-emerald-700 rounded-xl px-4 py-3 font-medium transition-all duration-200"
                onClick={() => handleQuickAction("Upload BOM")}
              >
                <Upload className="h-4 w-4 mr-3" />
                Upload BOM
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-slate-200/40 hover:bg-emerald-50/80 hover:border-emerald-200/60 hover:text-emerald-700 rounded-xl px-4 py-3 font-medium transition-all duration-200"
                onClick={() => handleQuickAction("Generate Passport")}
              >
                <QrCode className="h-4 w-4 mr-3" />
                Generate Passport
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-slate-200/20">
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">Reduce • Reuse • Recycle</p>
          <p className="text-xs text-emerald-600 font-semibold">Carbon Neutral by 2030</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
