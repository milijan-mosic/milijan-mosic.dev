import type { Component } from "solid-js";
import { hero } from "~/content";

export const Hero: Component = () => (
  <section
    aria-labelledby="hero-title"
    class="glass-card p-8 mt-16 mx-4 flex flex-col lg:flex-row items-center lg:items-stretch md:w-100 lg:w-137.5 xl:w-250"
  >
    <div class="lg:w-1/3">
      <img
        fetchpriority="high"
        width="290"
        height="290"
        src={hero.image}
        alt={hero.imageAlt}
        class="w-full rounded-2xl"
      />
    </div>
    <div class="mt-8 lg:mt-0 lg:ml-16 lg:w-2/3">
      <div class="flex flex-col items-center lg:justify-start">
        <h1 id="hero-title" class="text-3xl font-bold">
          {hero.name}
        </h1>
        <p class="text-xl">{hero.role}</p>
      </div>
      <div class="flex flex-col items-center my-16 lg:my-12">
        <p>{hero.tagline}</p>
        {/* Was an invalid <quote>. <blockquote> keeps it semantic without the
            automatic quotation marks <q> would inject. */}
        <blockquote class="mt-4">{hero.motto}</blockquote>
      </div>
      <div class="flex justify-center mb-4 lg:mb-0">
        <a
          href={hero.secondaryAction.href}
          class="flex justify-center items-center p-2 px-4 mr-2 text-lg rounded-full md:px-8 border border-white/35 hover:text-black hover:bg-white animate"
        >
          {hero.secondaryAction.label}
        </a>
        <a
          href={hero.primaryAction.href}
          class="p-2 px-4 ml-2 text-lg bg-brand rounded-full border-brand-mid md:px-8 animate border hover:border-white hover:bg-white hover:text-black hover:cursor-pointer"
        >
          {hero.primaryAction.label}
        </a>
      </div>
    </div>
  </section>
);
