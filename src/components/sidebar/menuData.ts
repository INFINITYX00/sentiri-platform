
import { 
  Home, 
  Package, 
  FileText, 
  Layers, 
  ShoppingCart, 
  TrendingUp,
  FolderOpen,
  Truck,
  Recycle,
  Clock,
  Calculator,
  Zap,
} from "lucide-react";
import { MenuItem, WorkspaceMenuItem } from "./types";

export const workspaceMenuItems: WorkspaceMenuItem[] = [
  {
    title: "Dashboard",
    url: "dashboard",
    icon: Home,
    items: []
  },
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
