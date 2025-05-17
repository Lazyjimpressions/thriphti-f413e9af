import { Link, useLocation } from "react-router-dom";
import { Menu, Calendar, BookOpen, Map, Store, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const NavigationBar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  const navLinks = [
    { to: "/this-weekend", label: "This Weekend", icon: Calendar },
    { to: "/articles", label: "Articles", icon: BookOpen },
    { to: "/guides", label: "Guides", icon: Sparkles },
    { to: "/neighborhoods", label: "Neighborhoods", icon: Map },
    { to: "/stores", label: "Stores", icon: Store },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/20">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-thriphti-green font-serif text-3xl hover:opacity-80 transition-opacity">
          thriphti
        </Link>

        {/* Navigation Links - Desktop */}
        {!isMobile && (
          <div className="flex gap-8">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link 
                key={to} 
                to={to} 
                className={cn(
                  "flex items-center gap-2 text-thriphti-charcoal hover:text-thriphti-green transition-colors group",
                  location.pathname === to && "text-thriphti-green"
                )}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                <span>{label}</span>
                {location.pathname === to && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-thriphti-green" />
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu size={24} className="text-thriphti-charcoal" />
              </button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors",
                      location.pathname === to && "bg-gray-100 text-thriphti-green"
                    )}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
