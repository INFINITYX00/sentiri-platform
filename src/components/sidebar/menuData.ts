
import { 
  Home, 
  Package, 
  FileText, 
  ShoppingCart, 
  TrendingUp,
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
    title: "BOM & Carbon",
    url: "bom",
    icon: ShoppingCart,
    items: []
  },
  {
    title: "AI Insights",
    url: "insights",
    icon: TrendingUp,
    items: []
  },
];
