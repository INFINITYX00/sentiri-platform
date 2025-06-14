
import { SidebarHeader } from "@/components/ui/sidebar";

export function AppSidebarHeader() {
  return (
    <SidebarHeader className="p-4 border-b border-slate-200/20">
      <div className="flex items-center justify-start pl-4">
        <img 
          src="/lovable-uploads/3acb41e9-62fb-4c55-ba24-9bada4c245de.png" 
          alt="Sentiri Logo" 
          className="h-20 w-auto max-w-full"
        />
      </div>
    </SidebarHeader>
  );
}
