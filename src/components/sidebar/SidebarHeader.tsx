
import { SidebarHeader } from "@/components/ui/sidebar";

export function AppSidebarHeader() {
  return (
    <SidebarHeader className="p-4 bg-slate-50/80">
      <div className="flex items-center justify-center">
        <img 
          src="/logo.png" 
          alt="Sentiri Logo" 
          className="h-24 w-auto max-w-full"
        />
      </div>
    </SidebarHeader>
  );
}
