
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
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "This Weekend", href: "/" },
  { name: "Guides", href: "#" },
  { name: "Neighborhoods", href: "#" },
  { name: "Stores", href: "/stores" },
  { name: "Subscribe", href: "#" },
];

// City selector for mobile menu
const cities = [
  "All Cities",
  "Dallas",
  "Fort Worth",
  "Plano",
  "Arlington",
  "Garland",
];

export default function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-thriphti-ivory/95 backdrop-blur-sm shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="thriphti-container flex items-center justify-between">
        <Link to="/" className="text-thriphti-green font-serif text-2xl md:text-3xl font-bold mr-8">
          Thriphti
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <ul className="flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || 
                (location.pathname === "/" && link.href === "/");
              
              return (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className={`font-medium transition-colors ${
                      isActive 
                        ? "text-thriphti-rust" 
                        : "text-thriphti-green hover:text-thriphti-rust"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Button className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white">
            Get Deal Alerts
          </Button>
        </nav>

        {/* Mobile Navigation - Enhanced with improved slide-in animation */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-thriphti-green">
                <Menu size={24} />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="bg-thriphti-ivory w-full sm:max-w-sm border-l border-thriphti-gold/20 p-0"
            >
              <AnimatePresence>
                <motion.div
                  className="h-full flex flex-col"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, staggerChildren: 0.1 }}
                >
                  <SheetHeader className="p-6 border-b border-thriphti-gold/10">
                    <SheetTitle className="text-thriphti-green font-serif text-3xl">
                      Thriphti
                    </SheetTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-4 top-4 text-thriphti-green"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <X size={24} />
                    </Button>
                  </SheetHeader>

                  <div className="flex-1 overflow-auto py-6 px-6">
                    <nav className="flex flex-col space-y-6">
                      {navLinks.map((link, index) => {
                        const isActive = location.pathname === link.href || 
                          (location.pathname === "/" && link.href === "/");
                        
                        return (
                          <motion.div
                            key={link.name}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              to={link.href}
                              className={`text-xl font-medium transition-colors ${
                                isActive 
                                  ? "text-thriphti-rust" 
                                  : "text-thriphti-green hover:text-thriphti-rust"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {link.name}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </nav>

                    {/* City selector for mobile */}
                    <div className="mt-8">
                      <h3 className="text-thriphti-green font-medium mb-4">Select City</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {cities.map((city) => (
                          <Button
                            key={city}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCity(city)}
                            className={`border-thriphti-green/20 ${
                              selectedCity === city 
                                ? "bg-thriphti-green text-white" 
                                : "bg-transparent text-thriphti-green"
                            }`}
                          >
                            {city}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-thriphti-gold/10">
                    <Button className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white w-full">
                      Get Deal Alerts
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
