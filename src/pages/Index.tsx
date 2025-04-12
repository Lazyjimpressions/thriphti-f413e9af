
import NavigationBar from "@/components/NavigationBar";
import HeroSection from "@/components/HeroSection";
import CityFilter from "@/components/CityFilter";
import EventGrid from "@/components/EventGrid";
import EditorsPick from "@/components/EditorsPick";
import SponsorSpotlight from "@/components/SponsorSpotlight";
import EmailCta from "@/components/EmailCta";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-thriphti-ivory">
      <NavigationBar />
      <main>
        <HeroSection />
        <CityFilter />
        <EventGrid />
        <EditorsPick />
        <SponsorSpotlight />
        <EmailCta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
