import HeroSection from "@/components/HeroSection";
import EventGrid from "@/components/EventGrid";
import Layout from "@/components/layout/Layout";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <div className="bg-white py-16">
        <EventGrid />
      </div>
    </Layout>
  );
};

export default Index;
