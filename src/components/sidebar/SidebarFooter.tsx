
import { SidebarFooter } from "@/components/ui/sidebar";

export function AppSidebarFooter() {
  return (
    <SidebarFooter className="p-4 border-t border-slate-200/20">
      <div className="text-center space-y-2">
        <p className="text-xs text-slate-500 font-medium">Reduce • Reuse • Recycle</p>
        <p className="text-xs text-emerald-600 font-semibold">Carbon Neutral by 2030</p>
      </div>
    </SidebarFooter>
  );
}
