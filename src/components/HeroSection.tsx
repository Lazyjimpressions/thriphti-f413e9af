import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-[#1C392C]">
      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8 pt-32 pb-16 relative">
        <div className="max-w-2xl">
          {/* Main Heading */}
          <h1 className="font-serif text-white text-6xl md:text-7xl lg:text-8xl leading-tight mb-6">
            This Weekend<br />
            in Dallas
          </h1>

          {/* Subheading */}
          <p className="text-white text-xl md:text-2xl mb-8 opacity-90">
            Your curated list of garage sales,<br />
            vintage pop-ups, and thrift gems.
          </p>

          {/* CTA Button */}
          <Button 
            className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white text-lg px-8 py-6 rounded"
          >
            Get Deal Alerts
          </Button>
        </div>

        {/* Featured Deal Card */}
        <div className="absolute bottom-16 right-8 max-w-sm bg-[#1C392C]/80 backdrop-blur-sm p-6 rounded text-white">
          <div className="bg-thriphti-rust text-white text-sm px-3 py-1 rounded inline-block mb-4">
            FEATURED DEAL
          </div>
          <h3 className="font-serif text-3xl mb-3">
            Eastside Flea<br />Market
          </h3>
          <p className="opacity-90">
            50% off admission this Saturday only. Bring this coupon for early access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
