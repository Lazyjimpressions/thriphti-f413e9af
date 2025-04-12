
import { Facebook, Instagram, Mail } from "lucide-react";

const footerLinks = [
  {
    title: "About",
    links: [
      { name: "About Us", href: "#" },
      { name: "Submit a Sale", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
  {
    title: "Top Cities",
    links: [
      { name: "Dallas", href: "#" },
      { name: "Fort Worth", href: "#" },
      { name: "Plano", href: "#" },
      { name: "Arlington", href: "#" },
    ],
  },
  {
    title: "More",
    links: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-thriphti-green text-white">
      <div className="thriphti-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h2 className="font-serif text-3xl mb-4">Thriphti</h2>
            <p className="text-white/80 mb-6 max-w-sm">
              Your local guide to the best thrift finds, garage sales, and resale events in the Dallas-Fort Worth area.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-medium text-white mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">
            © {new Date().getFullYear()} Thriphti. All rights reserved.
          </p>
          <p className="text-white/70 text-sm mt-2 md:mt-0">
            Made with ♥ in Dallas, Texas
          </p>
        </div>
      </div>
    </footer>
  );
}
