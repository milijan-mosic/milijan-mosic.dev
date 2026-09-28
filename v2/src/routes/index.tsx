import { clientOnly } from "@solidjs/start";
import { Navbar } from "~/components/layout/Navbar";
import { Footer } from "~/components/layout/Footer";
import { Hero } from "~/components/sections/Hero";
import { AboutMe } from "~/components/sections/AboutMe";
import { Services } from "~/components/sections/Services";
import { Skills } from "~/components/sections/Skills";
import { Projects } from "~/components/sections/Projects";
import { Testimonials } from "~/components/sections/Testimonials";
import { ContactMe } from "~/components/sections/ContactMe";
import { CookieBanner } from "~/components/consent/CookieBanner";

const ShaderBackground = clientOnly(() => import("~/components/background/ShaderBackground"));

export default function Home() {
  return (
    <>
      <ShaderBackground />
      {/* The navbar is position:fixed, so it sits outside the flow wrapper
          without affecting layout — and outside <main>, where a nav belongs. */}
      <Navbar />
      <div class="flex flex-col items-center">
        <main class="flex flex-col items-center w-full">
          <Hero />
          <AboutMe />
          <Services />
          <Skills />
          <Projects />
          <Testimonials />
          <ContactMe />
        </main>
        <Footer />
      </div>
      <CookieBanner />
    </>
  );
}
