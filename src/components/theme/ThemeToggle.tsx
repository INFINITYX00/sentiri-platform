import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-full justify-start"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="ml-2">Light mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="ml-2">Dark mode</span>
        </>
      )}
    </Button>
  );
}