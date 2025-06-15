
import { 
  Home, 
  Package, 
  FileText, 
  ShoppingCart, 
  TrendingUp,
  Leaf,
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
    title: "Projects",
    url: "projects",
    icon: ShoppingCart,
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
