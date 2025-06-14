
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { AppSidebarHeader } from "./sidebar/SidebarHeader";
import { AppSidebarFooter } from "./sidebar/SidebarFooter";
import { MainMenuItem } from "./sidebar/MainMenuItem";
import { WorkspaceMenuItem } from "./sidebar/WorkspaceMenuItem";
import { mainMenuItems, workspaceMenuItems } from "./sidebar/menuData";

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
      <AppSidebarHeader />

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <MainMenuItem
                  key={item.title}
                  item={item}
                  isActive={activeView === item.url}
                  onClick={() => setActiveView(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <Accordion type="single" collapsible className="w-full space-y-1">
              {workspaceMenuItems.map((workspace) => (
                <WorkspaceMenuItem
                  key={workspace.title}
                  workspace={workspace}
                  activeView={activeView}
                  onNavigation={handleNavigation}
                  onSetActiveView={setActiveView}
                />
              ))}
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AppSidebarFooter />
    </Sidebar>
  );
}
