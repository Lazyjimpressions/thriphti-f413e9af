
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const NavigationBar = () => {
  const isMobile = useIsMobile();

  const navLinks = [
    { to: "/this-weekend", label: "This Weekend" },
    { to: "/articles", label: "Articles" },
    { to: "/guides", label: "Guides" },
    { to: "/neighborhoods", label: "Neighborhoods" },
    { to: "/stores", label: "Stores" },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-6">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white font-serif text-3xl">
          thriphti
        </Link>

        {/* Navigation Links - Desktop */}
        {!isMobile && (
          <div className="flex gap-8 text-white">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="hover:opacity-80"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-white p-2">
                <Menu size={24} />
                <span className="sr-only">Open menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-thriphti-ivory">
              <div className="flex flex-col gap-6 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg font-medium hover:text-thriphti-rust transition-colors"
                  >
                    {link.label}
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
