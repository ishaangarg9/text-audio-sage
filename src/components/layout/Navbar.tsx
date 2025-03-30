
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (value: string) => {
    navigate(value);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            SpeechSage
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <Tabs defaultValue="/" className="w-full" onValueChange={handleNavigation}>
            <TabsList>
              <TabsTrigger value="/">Text Editor</TabsTrigger>
              <TabsTrigger value="/audio-analysis">Audio Analysis</TabsTrigger>
              <TabsTrigger value="/chatbot">Chatbot</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Navigation Toggle */}
        <button 
          className="block md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn(
        "fixed inset-x-0 top-16 z-50 bg-background border-b transform transition-transform duration-300 md:hidden",
        isMenuOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <nav className="container py-4">
          <ul className="space-y-4">
            <li>
              <button 
                onClick={() => handleNavigation("/")}
                className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
              >
                Text Editor
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation("/audio-analysis")}
                className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
              >
                Audio Analysis
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation("/chatbot")}
                className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
              >
                Chatbot
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
