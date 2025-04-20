import { Link } from "react-router-dom";

const NavigationBar = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 py-6">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white font-serif text-3xl">
          thriphti
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-8 text-white">
          <Link to="/this-weekend" className="hover:opacity-80">This Weekend</Link>
          <Link to="/guides" className="hover:opacity-80">Guides</Link>
          <Link to="/neighborhoods" className="hover:opacity-80">Neighborhoods</Link>
          <Link to="/stores" className="hover:opacity-80">Stores</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 