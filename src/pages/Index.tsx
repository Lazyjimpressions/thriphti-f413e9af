
import NavigationBar from "@/components/NavigationBar";
import CityFilter from "@/components/CityFilter";
import EventGrid from "@/components/EventGrid";
import EditorsPick from "@/components/EditorsPick";
import SponsorSpotlight from "@/components/SponsorSpotlight";
import EmailCta from "@/components/EmailCta";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="bg-thriphti-ivory pt-20">
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
