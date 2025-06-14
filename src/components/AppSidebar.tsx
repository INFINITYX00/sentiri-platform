import { 
  Home, 
  Package, 
  FileText, 
  Layers, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Upload,
  QrCode
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
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

  return (
    <Sidebar className="border-r border-slate-200/20">
      <SidebarHeader className="p-8 border-b border-slate-200/20">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/3acb41e9-62fb-4c55-ba24-9bada4c245de.png" 
            alt="Sentiri Logo" 
            className="h-12 w-auto"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
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
