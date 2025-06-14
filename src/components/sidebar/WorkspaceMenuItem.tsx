
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { WorkspaceMenuItem as WorkspaceMenuItemType } from "./types";

interface WorkspaceMenuItemProps {
  workspace: WorkspaceMenuItemType;
  activeView: string;
  onNavigation: (url: string) => void;
  onSetActiveView: (view: string) => void;
}

export function WorkspaceMenuItem({ workspace, activeView, onNavigation, onSetActiveView }: WorkspaceMenuItemProps) {
  return (
    <AccordionItem key={workspace.title} value={workspace.title.toLowerCase().replace(/\s+/g, '-')} className="border-none">
      {workspace.items.length > 0 ? (
        <>
          <AccordionTrigger className="hover:bg-gray-100 rounded-xl px-4 py-3 hover:no-underline font-medium text-black">
            <div className="flex items-center space-x-3 min-w-0">
              <workspace.icon className="h-5 w-5 flex-shrink-0 text-black" />
              <span className="truncate text-black">{workspace.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0">
            <div className="ml-6 space-y-1">
              {workspace.items.map((item) => (
                <button
                  key={item.title}
                  onClick={() => onNavigation(item.url)}
                  className={`flex items-center space-x-3 w-full px-4 py-2 text-sm rounded-lg transition-all duration-200 min-w-0 ${
                    activeView === item.url 
                      ? 'bg-gray-200 text-black font-medium' 
                      : 'text-black hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0 text-black" />
                  <span className="truncate text-black">{item.title}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </>
      ) : (
        <button
          onClick={() => onSetActiveView(workspace.url)}
          className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium min-w-0 ${
            activeView === workspace.url 
              ? 'bg-gray-200 text-black font-semibold' 
              : 'text-black hover:bg-gray-100 hover:text-black'
          }`}
        >
          <workspace.icon className="h-5 w-5 flex-shrink-0 text-black" />
          <span className="truncate text-black">{workspace.title}</span>
        </button>
      )}
    </AccordionItem>
  );
}
