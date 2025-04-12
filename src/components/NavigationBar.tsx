
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { name: "This Weekend", href: "#" },
  { name: "Guides", href: "#" },
  { name: "Neighborhoods", href: "#" },
  { name: "Stores", href: "#" },
  { name: "Subscribe", href: "#" },
];

export default function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-thriphti-ivory/95 backdrop-blur-sm shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="thriphti-container flex items-center justify-between">
        <a href="#" className="text-thriphti-green font-serif text-2xl md:text-3xl font-bold mr-8">
          Thriphti
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href}
                  className="font-medium text-thriphti-green hover:text-thriphti-rust transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <Button className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white">
            Get Deal Alerts
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-thriphti-green">
                <Menu size={24} />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-thriphti-ivory">
              <SheetHeader>
                <SheetTitle className="text-thriphti-green font-serif text-3xl">
                  Thriphti
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col space-y-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-xl font-medium text-thriphti-green hover:text-thriphti-rust transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                <Button className="mt-4 bg-thriphti-rust hover:bg-thriphti-rust/90 text-white w-full">
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
