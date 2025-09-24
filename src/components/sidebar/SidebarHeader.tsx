
import { SidebarHeader } from "@/components/ui/sidebar";

export function AppSidebarHeader() {
  return (
    <SidebarHeader className="p-4 bg-slate-50/80">
      <div className="flex items-center justify-center">
        <img 
          src="/lovable-uploads/3acb41e9-62fb-4c55-ba24-9bada4c245de.png" 
          alt="Sentiri Logo" 
          className="h-24 w-auto max-w-full"
        />
      </div>
    </SidebarHeader>
  );
}
