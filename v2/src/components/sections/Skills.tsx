import { type Component, For } from "solid-js";
import { skills } from "~/content";
import { Icon } from "~/components/ui/Icon";

export const Skills: Component = () => (
  <section
    id="skills"
    aria-labelledby="skills-title"
    class="glass-card p-8 my-16 mx-8 flex flex-col items-center md:w-[400px] lg:w-[550px] xl:w-[1000px]"
  >
    <h2 id="skills-title" class="mt-4 mb-8 text-2xl font-bold lg:mb-0">
      {skills.title}
    </h2>
    <div class="flex flex-row flex-wrap mb-4 lg:mb-4">
      <For each={skills.groups}>
        {(group) => (
          <div class="flex flex-col items-center w-full lg:w-1/2">
            <h3 class="mt-16 mb-4 text-xl">{group.title}</h3>
            <div class="flex flex-wrap justify-center w-full">
              <For each={group.skills}>
                {(skill) => (
                  <div class="flex flex-col items-center my-2 w-1/2 rounded-xl lg:w-[200px] hover:text-white hover:bg-black hover:invert animate">
                    <div class="flex flex-col justify-center items-center w-16 h-16 text-3xl">
                      {/* The v1 <img> was black artwork flipped white by `invert`.
                          Inline SVG already paints in currentColor, so the class
                          is dropped here — the card's `hover:invert` still flips
                          it to black on hover exactly as before. */}
                      <Icon name={skill.icon} class="w-12 h-12" />
                    </div>
                    <p>{skill.name}</p>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  </section>
);
