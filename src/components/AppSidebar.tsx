
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
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Sentiri</h1>
            <p className="text-xs text-muted-foreground">Sustainable Manufacturing</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => setActiveView(item.url)}
                    isActive={activeView === item.url}
                    className="hover:bg-accent/10 data-[active=true]:bg-accent/20 data-[active=true]:text-accent"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-wider">
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-border/50 hover:bg-accent/10 hover:border-accent/30"
                onClick={() => handleQuickAction("Add Stock")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-border/50 hover:bg-accent/10 hover:border-accent/30"
                onClick={() => handleQuickAction("Upload BOM")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload BOM
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start border-border/50 hover:bg-accent/10 hover:border-accent/30"
                onClick={() => handleQuickAction("Generate Passport")}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate Passport
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          <p>Reduce • Reuse • Recycle</p>
          <p className="mt-1 text-accent">Carbon Neutral by 2030</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
