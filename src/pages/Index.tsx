import HeroSection from "@/components/HeroSection";
import EventGrid from "@/components/EventGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <main className="bg-white py-16">
        <EventGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
