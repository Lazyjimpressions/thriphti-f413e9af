
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-black"
        style={{
          backgroundImage: `url('/lovable-uploads/c8f4366e-279f-42c2-bbfb-c123679c6309.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 h-full relative">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left section - Main content */}
          <div className="flex-1 flex flex-col justify-center pt-24 md:pt-0">
            <h1 className="font-serif text-white text-5xl md:text-7xl lg:text-8xl leading-tight">
              This Weekend<br />
              in Dallas
            </h1>
            <p className="text-white text-xl md:text-2xl mt-4 md:mt-6">
              Your curated list of garage sales,<br />
              vintage pop-ups, and thrift gems.
            </p>
            <div className="mt-8">
              <Button 
                className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white text-lg py-6 px-8"
              >
                Get Deal Alerts
              </Button>
            </div>
          </div>
          
          {/* Right section - Featured deal card */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-end md:w-96 mt-8 md:mt-0">
            <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border border-white/10 w-full max-w-sm text-white">
              <div className="bg-thriphti-rust text-white text-center py-1 px-4 font-medium inline-block rounded-sm mb-2">
                FEATURED DEAL
              </div>
              <h3 className="font-serif text-3xl md:text-4xl mb-4">
                Eastside Flea Market
              </h3>
              <p className="text-white/90">
                50% off admission this Saturday only. Bring this coupon for early access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
