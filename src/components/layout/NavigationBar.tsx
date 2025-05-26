
import { Link, useLocation } from "react-router-dom";
import { Menu, Calendar, BookOpen, Map, Store, Sparkles, User, LogIn, LogOut, Settings, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getUserRoles } from "@/integrations/supabase/queries";

const NavigationBar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      console.log("=== NAVIGATION BAR ADMIN CHECK ===");
      if (!user) {
        console.log("NavigationBar: No user, setting isAdmin to false");
        setIsAdmin(false);
        return;
      }

      try {
        console.log("NavigationBar: Checking admin role for user:", user.id);
        console.log("NavigationBar: User email:", user.email);
        const roles = await getUserRoles(user.id);
        const hasAdminRole = roles.some(role => role.role === 'admin');
        console.log("NavigationBar: Roles returned:", roles);
        console.log("NavigationBar: Has admin role:", hasAdminRole);
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('NavigationBar: Error checking admin role:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

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
          <div className="flex gap-8 mx-auto">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link 
                key={to} 
                to={to} 
                className={cn(
                  "flex items-center gap-2 text-thriphti-charcoal hover:text-thriphti-green transition-colors group relative",
                  location.pathname === to && "text-thriphti-green"
                )}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform" />
                <span>{label}</span>
                {location.pathname === to && (
                  <span className="absolute -bottom-4 left-0 w-full h-0.5 bg-thriphti-green" />
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Auth Buttons - Desktop */}
        {!isMobile && (
          <div className="ml-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-thriphti-charcoal hover:text-thriphti-green transition-colors p-2 rounded-full hover:bg-gray-100">
                  <User size={20} />
                  {process.env.NODE_ENV === 'development' && isAdmin && (
                    <Shield size={16} className="text-red-500" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem disabled className="opacity-70">
                    <span className="text-sm text-gray-500">Signed in as</span>
                    <br />
                    <span className="font-medium truncate max-w-[200px] block">{user.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Your Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center gap-2 text-thriphti-charcoal hover:text-thriphti-green transition-colors px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}
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
                <div className="border-t border-gray-200 my-2"></div>
                {user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="font-medium truncate">{user.email}</p>
                      {process.env.NODE_ENV === 'development' && isAdmin && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <Shield size={12} /> Admin
                        </p>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Settings size={20} />
                      <span>Your Profile</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Shield size={20} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-red-500"
                    >
                      <LogOut size={20} />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
