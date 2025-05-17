import NavigationBar from "./NavigationBar";
import Footer from "@/components/Footer";
import React from "react";

/**
 * Layout component that provides a consistent header (NavigationBar) and footer (Footer)
 * for all pages. Wraps its children in a min-h-screen flex column layout.
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-thriphti-ivory">
    <NavigationBar />
    <main className="flex-1 pt-16">{children}</main>
    <Footer />
  </div>
);

export default Layout; 