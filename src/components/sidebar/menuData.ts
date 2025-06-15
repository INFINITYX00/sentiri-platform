
import { 
  Home, 
  Package, 
  FileText, 
  ShoppingCart, 
  TrendingUp,
  Leaf,
  Workflow,
  Factory,
  Sparkles,
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
    title: "Project Wizard",
    url: "wizard",
    icon: Sparkles,
    items: []
  },
  {
    title: "Stock Overview",
    url: "stock",
    icon: Package,
    items: []
  },
  {
    title: "Projects",
    url: "projects",
    icon: ShoppingCart,
    items: []
  },
  {
    title: "Design & BOM",
    url: "design-bom",
    icon: Workflow,
    items: []
  },
  {
    title: "Production",
    url: "production",
    icon: Factory,
    items: []
  },
  {
    title: "Product Passports",
    url: "passport",
    icon: FileText,
    items: []
  },
  {
    title: "Carbon Tracking",
    url: "carbon",
    icon: Leaf,
    items: []
  },
  {
    title: "AI Insights",
    url: "insights",
    icon: TrendingUp,
    items: []
  },
];
