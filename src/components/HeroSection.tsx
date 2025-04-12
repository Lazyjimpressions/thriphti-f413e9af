
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen">
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/eed40b7a-7b3b-4458-a683-d5b07196e0c3.png"
          alt="Dallas flea market"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-40 pb-20 h-screen flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Main Hero Text */}
          <div className="text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif mb-4 leading-tight">
              This Weekend<br />in Dallas
            </h1>
            <p className="text-xl mb-8">
              Your curated list of garage sales, vintage pop-ups, and thrift gems.
            </p>
            <Button 
              size="lg" 
              className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white font-medium px-8 py-6 text-lg"
            >
              Get Deal Alerts
            </Button>
          </div>

          {/* Featured Deal Card */}
          <div className="mt-8 lg:mt-0 max-w-md lg:ml-auto">
            <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg text-white">
              <Badge className="bg-thriphti-rust text-white border-none uppercase font-bold px-3 py-1 mb-4">
                Featured Deal
              </Badge>
              <h3 className="text-3xl font-serif mb-3">Eastside Flea Market</h3>
              <p className="mb-4">50% off admission this Saturday only. Bring this coupon for early access.</p>
              <div className="text-sm">
                <span>Apr 27-28</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
