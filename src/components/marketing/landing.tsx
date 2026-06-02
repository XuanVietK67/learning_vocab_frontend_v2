import { Features } from "./features";
import { FinalCta } from "./final-cta";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { Showcase } from "./showcase";

/**
 * The logged-out marketing landing. Composed entirely of Server Components —
 * no client JS — so it stays cheap to render and fully cacheable.
 */
export function Landing() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Showcase />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
