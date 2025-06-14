
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { MenuItem } from "./types";

interface MainMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}

export function MainMenuItem({ item, isActive, onClick }: MainMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={onClick}
        isActive={isActive}
        className="hover:bg-emerald-50/80 data-[active=true]:bg-emerald-50/80 data-[active=true]:text-emerald-700 data-[active=true]:font-semibold rounded-xl px-4 py-3 transition-all duration-200"
      >
        <item.icon className="h-5 w-5" />
        <span className="font-medium">{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
