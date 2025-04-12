
import { Link } from "react-router-dom";

const navLinks = [
  { name: "This Weekend", href: "/" },
  { name: "Guides", href: "#" },
  { name: "Neighborhoods", href: "#" },
  { name: "Stores", href: "/stores" },
];

export default function NavigationBar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 pt-6">
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="text-white font-serif text-4xl md:text-5xl">
          thriphti
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.href}
                  className="font-medium text-white text-lg hover:text-white/80 transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
