import { type Component, For } from "solid-js";
import { about } from "~/content";

export const AboutMe: Component = () => (
  <section
    id="about-me"
    aria-labelledby="about-me-title"
    class="glass-card p-8 my-16 mx-8 flex flex-col items-center md:w-[400px] lg:w-[550px] xl:w-[1000px]"
  >
    <h2 id="about-me-title" class="mt-4 mb-16 text-2xl font-bold">
      {about.title}
    </h2>
    <div>
      <For each={about.paragraphs}>
        {(paragraph, index) => <p class={index() === 0 ? undefined : "mt-4"}>{paragraph}</p>}
      </For>
    </div>
    <div class="flex flex-col items-center mt-12 mb-4">
      <h3 class="mb-4 text-xl">{about.experienceTitle}</h3>
      <ul class="ml-4 list-disc lg:ml-8">
        <For each={about.experience}>{(entry) => <li>{entry}</li>}</For>
      </ul>
      <h3 class="my-4 mt-8 text-xl">{about.educationTitle}</h3>
      <ul class="ml-4 list-disc lg:ml-8">
        <For each={about.education}>{(entry) => <li>{entry}</li>}</For>
      </ul>
    </div>
  </section>
);
