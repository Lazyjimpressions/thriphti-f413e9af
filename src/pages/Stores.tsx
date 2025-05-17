import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import StoresHeader from "@/components/stores/StoresHeader";
import FilterBar from "@/components/stores/FilterBar";
import StoreGrid from "@/components/stores/StoreGrid";
import EditorsPicks from "@/components/stores/EditorsPicks";
import CalloutSection from "@/components/stores/CalloutSection";

export default function Stores() {
  return (
    <Layout>
      <Helmet>
        <title>Thrift & Consignment Stores | Thriphti</title>
        <meta 
          name="description" 
          content="Discover hand-picked resale shops, benefit stores, and hidden gems around the Dallas-Fort Worth metroplex."
        />
      </Helmet>
      <main>
        <StoresHeader />
        <FilterBar />
        <StoreGrid />
        <EditorsPicks />
        <CalloutSection />
      </main>
    </Layout>
  );
}
