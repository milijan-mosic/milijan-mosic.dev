import { clientOnly, HttpStatusCode } from "@solidjs/start";
import { Navbar } from "~/components/layout/Navbar";
import { Footer } from "~/components/layout/Footer";
import { CookieBanner } from "~/components/consent/CookieBanner";

const ShaderBackground = clientOnly(() => import("~/components/background/ShaderBackground"));

export default function NotFound() {
  return (
    <>
      <HttpStatusCode code={404} />
      <ShaderBackground />
      <Navbar />
      <div class="flex flex-col items-center">
        <main class="flex flex-col items-center w-full">
          <section
            aria-labelledby="not-found-title"
            class="glass-card p-8 mt-16 mx-8 flex flex-col items-center md:w-[400px] lg:w-[550px] xl:w-[1000px]"
          >
            <h1 id="not-found-title" class="mt-4 mb-8 text-3xl font-bold">
              404
            </h1>
            <p class="mb-16 text-center">This page doesn’t exist — or it moved somewhere better.</p>
            <a
              href="/"
              class="p-2 px-8 mb-4 text-lg bg-brand rounded-full border-sky-500 animate border-1 hover:border-white hover:bg-white hover:text-black hover:cursor-pointer"
            >
              Back home
            </a>
          </section>
        </main>
        <Footer />
      </div>
      <CookieBanner />
    </>
  );
}
