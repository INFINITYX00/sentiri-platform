
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface WorkspaceMenuItem extends MenuItem {
  items: MenuItem[];
}

export interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}
