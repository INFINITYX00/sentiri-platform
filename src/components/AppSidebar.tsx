
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { AppSidebarHeader } from "./sidebar/SidebarHeader";
import { WorkspaceMenuItem } from "./sidebar/WorkspaceMenuItem";
import { workspaceMenuItems } from "./sidebar/menuData";

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
    <Sidebar className="border-r border-slate-200/30 bg-slate-50/80 shadow-sm w-72">
      <AppSidebarHeader />

      <SidebarContent className="pt-0 px-4 bg-slate-50/80">
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
    </Sidebar>
  );
}
