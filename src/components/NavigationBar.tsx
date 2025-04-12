
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocation, Link } from "react-router-dom";

const navLinks = [
  { name: "This Weekend", href: "/" },
  { name: "Guides", href: "#" },
  { name: "Neighborhoods", href: "#" },
  { name: "Stores", href: "/stores" },
];

export default function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-black/70 backdrop-blur-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-white font-serif text-2xl md:text-3xl font-bold">
          Thriphti
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <ul className="flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || 
                (location.pathname === "/" && link.href === "/");
              
              return (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className={`font-medium text-white hover:text-white/80 transition-colors`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu size={24} />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-thriphti-ivory w-full">
              <SheetHeader>
                <SheetTitle className="text-thriphti-green font-serif text-2xl">
                  Thriphti
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-thriphti-green font-medium text-lg"
                  >
                    {link.name}
                  </Link>
                ))}
                <Button className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white mt-4">
                  Get Deal Alerts
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
