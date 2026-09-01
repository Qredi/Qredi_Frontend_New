import Hero from "@/components/marketing/sections/Hero";
import Product from "@/components/marketing/sections/Product";
import Solution from "@/components/marketing/sections/Solution";
import HowItWorks from "@/components/marketing/sections/HowItWorks";
import AboutUs from "@/components/marketing/sections/AboutUs";
import WhyQredi from "@/components/marketing/sections/WhyQredi";

export default function Page() {
  return (
    <main>
      <Hero />
      <WhyQredi />
      <Product />
      <Solution />
      <HowItWorks />
      <AboutUs />
    </main>
  );
}
