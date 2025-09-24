
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { AppSidebarHeader } from "./sidebar/SidebarHeader";
import { AppSidebarFooter } from "./sidebar/SidebarFooter";
import { WorkspaceMenuItem } from "./sidebar/WorkspaceMenuItem";
import { workspaceMenuItems } from "./sidebar/menuData";
import { ThemeToggle } from "./theme/ThemeToggle";

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
    <Sidebar className="border-r border-sidebar-border bg-sidebar w-72">
      <AppSidebarHeader />

      <SidebarContent className="pt-0 px-4 bg-sidebar">
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
        
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <div className="px-2">
              <ThemeToggle />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AppSidebarFooter />
    </Sidebar>
  );
}
