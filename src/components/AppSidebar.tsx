
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
  ChevronDown,
  Calculator,
  Zap,
  Users,
  Box
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
];

const workspaceMenuItems = [
  {
    title: "Stock Overview",
    url: "stock",
    icon: Package,
    items: []
  },
  {
    title: "Material Passport",
    url: "passport",
    icon: FileText,
    items: []
  },
  {
    title: "Design Workspace",
    url: "design",
    icon: Layers,
    items: [
      { title: "Projects", url: "design", icon: FolderOpen },
      { title: "Time Tracking", url: "time-logging", icon: Clock },
      { title: "Manufacturing Stages", url: "manufacturing", icon: Layers },
      { title: "Labor Calculator", url: "labor", icon: Calculator },
      { title: "Energy Estimator", url: "energy", icon: Zap },
    ]
  },
  {
    title: "BOM & Carbon",
    url: "bom",
    icon: ShoppingCart,
    items: []
  },
  {
    title: "Transport & Shipping",
    url: "transport",
    icon: Truck,
    items: [
      { title: "Transport Emissions", url: "transport", icon: TrendingUp },
      { title: "Shipping Tracker", url: "shipping", icon: Truck },
    ]
  },
  {
    title: "Lifecycle Management",
    url: "takeback",
    icon: Recycle,
    items: [
      { title: "Take-back System", url: "takeback", icon: Recycle },
      { title: "Circular Design", url: "circular", icon: Recycle }
    ]
  },
  {
    title: "AI Insights",
    url: "insights",
    icon: TrendingUp,
    items: []
  },
];

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  const { toast } = useToast();

  const handleNavigation = (url: string) => {
    setActiveView(url);
    toast({
      title: "Navigation",
      description: `Switched to ${url}`,
    });
  };

  return (
    <Sidebar className="border-r border-slate-200/20">
      <SidebarHeader className="p-4 border-b border-slate-200/20">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/3acb41e9-62fb-4c55-ba24-9bada4c245de.png" 
            alt="Sentiri Logo" 
            className="h-16 w-auto max-w-full"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
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

        <SidebarGroup className="mt-4">
          <SidebarGroupContent>
            <Accordion type="single" collapsible className="w-full space-y-1">
              {workspaceMenuItems.map((workspace) => (
                <AccordionItem key={workspace.title} value={workspace.title.toLowerCase().replace(/\s+/g, '-')} className="border-none">
                  {workspace.items.length > 0 ? (
                    <>
                      <AccordionTrigger className="hover:bg-emerald-50/80 rounded-xl px-4 py-3 hover:no-underline font-medium">
                        <div className="flex items-center space-x-3 min-w-0">
                          <workspace.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="truncate">{workspace.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-0">
                        <div className="ml-6 space-y-1">
                          {workspace.items.map((item) => (
                            <button
                              key={item.title}
                              onClick={() => handleNavigation(item.url)}
                              className={`flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 min-w-0 ${
                                activeView === item.url 
                                  ? 'bg-emerald-100/80 text-emerald-700 font-medium' 
                                  : 'text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-700'
                              }`}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveView(workspace.url)}
                      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium min-w-0 ${
                        activeView === workspace.url 
                          ? 'bg-emerald-50/80 text-emerald-700 font-semibold' 
                          : 'hover:bg-emerald-50/80 hover:text-emerald-700'
                      }`}
                    >
                      <workspace.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{workspace.title}</span>
                    </button>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200/20">
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">Reduce • Reuse • Recycle</p>
          <p className="text-xs text-emerald-600 font-semibold">Carbon Neutral by 2030</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
