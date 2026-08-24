import Home from "@/components/marketing/sections/Home";
import Hero from "@/components/marketing/sections/Hero";
import Product from "@/components/marketing/sections/Product";
import Solution from "@/components/marketing/sections/Solution";
import HowItWorks from "@/components/marketing/sections/HowItWorks";
import AboutUs from "@/components/marketing/sections/AboutUs";

export default function Page() {
  return (
    <main>
      <Hero />
      <Product />
      <Solution />
      <HowItWorks />
      <AboutUs />
    </main>
  );
}
