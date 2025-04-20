import { Helmet } from "react-helmet";
import Footer from "@/components/Footer";
import StoresHeader from "@/components/stores/StoresHeader";
import FilterBar from "@/components/stores/FilterBar";
import StoreGrid from "@/components/stores/StoreGrid";
import EditorsPicks from "@/components/stores/EditorsPicks";
import CalloutSection from "@/components/stores/CalloutSection";

export default function Stores() {
  return (
    <>
      <Helmet>
        <title>Thrift & Consignment Stores | Thriphti</title>
        <meta 
          name="description" 
          content="Discover hand-picked resale shops, benefit stores, and hidden gems around the Dallas-Fort Worth metroplex."
        />
      </Helmet>
      
      <div className="min-h-screen bg-thriphti-ivory">
        <main className="pt-16">
          <StoresHeader />
          <FilterBar />
          <StoreGrid />
          <EditorsPicks />
          <CalloutSection />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
