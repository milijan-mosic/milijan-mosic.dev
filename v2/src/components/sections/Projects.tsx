import { type Component, For } from "solid-js";
import { projects } from "~/content";

export const Projects: Component = () => (
  <section
    id="projects"
    aria-labelledby="projects-title"
    class="glass-card p-8 my-16 mx-8 flex flex-col items-center md:w-100 lg:w-137.5 xl:w-250"
  >
    <h2 id="projects-title" class="mt-4 mb-16 text-2xl font-bold">
      {projects.title}
    </h2>
    <div class="flex flex-col justify-center w-full lg:flex-row lg:flex-wrap">
      <For each={projects.items}>
        {(project) => (
          <div class="flex flex-col items-center mb-16 rounded-xl lg:flex-row lg:items-start bg-white/25">
            <div class="flex justify-center items-center mb-4 w-full rounded-t-xl shadow-md md:shadow-none lg:w-1/2 lg:mb-0 lg:rounded-t-none lg:rounded-l-xl lg:pl-8">
              <img
                loading="lazy"
                src={project.thumbnail}
                alt={`Screenshot of the project named ${project.name}`}
                class="rounded-t-2xl lg:rounded-2xl lg:mt-8"
                width="512"
                height="512"
              />
            </div>
            <div class="flex flex-col items-center w-full lg:p-8 lg:w-1/2">
              <h3 class="text-2xl font-bold">{project.name}</h3>
              <p class="px-4 mb-8 lg:px-8">{project.type}</p>
              <p class="p-8 mb-8">{project.description}</p>
              <div class="flex flex-wrap gap-2 justify-center px-4 mb-8 lg:mb-4">
                <For each={project.role}>
                  {(role) => (
                    <span class="px-4 py-2 text-sm text-black rounded-full bg-white/50">
                      {role}
                    </span>
                  )}
                </For>
              </div>
              {/* <div class="flex flex-wrap gap-2 justify-center px-4 mb-8">
                <For each={project.technologies}>
                  {(tech) => (
                    <span class="px-2 py-1 text-sm rounded-full border-white border">{tech}</span>
                  )}
                </For>
              </div> */}
            </div>
          </div>
        )}
      </For>
    </div>
    <a
      href={projects.action.href}
      class="p-2 px-4 mt-8 mb-4 text-lg bg-brand rounded-full border-brand-mid md:px-8 animate border hover:border-white hover:bg-white hover:text-black hover:cursor-pointer"
    >
      {projects.action.label}
    </a>
  </section>
);
