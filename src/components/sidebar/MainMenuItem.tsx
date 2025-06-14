
import { MenuItem } from "./types";

interface MainMenuItemProps {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}

export function MainMenuItem({ item, isActive, onClick }: MainMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium min-w-0 ${
        isActive 
          ? 'bg-emerald-50/80 text-emerald-700 font-semibold' 
          : 'hover:bg-emerald-50/80 hover:text-emerald-700'
      }`}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">{item.title}</span>
    </button>
  );
}
