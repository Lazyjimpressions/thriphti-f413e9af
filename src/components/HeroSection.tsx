
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    // Preload the image
    const img = new Image();
    img.src = '/lovable-uploads/5b67d97f-5465-4a1c-b502-a059a1ea9163.png';
    img.onload = () => setImageLoaded(true);
    
    // If image fails to load, set as loaded anyway so content appears
    img.onerror = () => {
      console.error("Failed to load hero image");
      setImageLoaded(true);
    };
  }, []);

  return (
    <div 
      className="relative h-[90vh] w-full bg-black"
    >
      {/* Background Image with fallback color */}
      <div 
        className={`absolute inset-0 bg-thriphti-green transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          backgroundImage: `url('/lovable-uploads/5b67d97f-5465-4a1c-b502-a059a1ea9163.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Debug placeholder to see if the div renders */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-thriphti-green flex items-center justify-center">
          <p className="text-white text-xl">Loading hero image...</p>
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70">
        <div className="container mx-auto h-full px-4 flex flex-col md:flex-row items-center justify-center md:justify-between">
          <div className="text-white max-w-xl mt-20 md:mt-0">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight mb-4">
              This Weekend<br />in Dallas
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Your curated list of garage sales,<br />
              vintage pop-ups, and thrift gems.
            </p>
            <Button 
              className="bg-thriphti-rust hover:bg-thriphti-rust/90 text-white text-lg py-6 px-8"
            >
              Get Deal Alerts
            </Button>
          </div>
          
          <div className="mt-10 md:mt-0 w-full md:w-auto">
            <Card className="bg-black/60 border-none text-white w-full max-w-sm">
              <CardContent className="p-6">
                <div className="bg-thriphti-rust text-white text-center py-1 px-4 font-medium inline-block rounded mb-2">
                  FEATURED DEAL
                </div>
                <h3 className="font-serif text-3xl md:text-4xl mb-4">
                  Eastside Flea Market
                </h3>
                <p className="text-white/90 text-lg">
                  50% off admission this Saturday only. Bring this coupon for early access.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
