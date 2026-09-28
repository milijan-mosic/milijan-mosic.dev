import { type Component, For } from "solid-js";
import { services } from "~/content";
import { Icon } from "~/components/ui/Icon";

export const Services: Component = () => (
  <section
    id="services"
    aria-labelledby="services-title"
    class="glass-card p-8 my-16 mx-8 flex flex-col items-center md:w-[400px] lg:w-[550px] xl:w-[1000px]"
  >
    <h2 id="services-title" class="mt-4 text-2xl font-bold text-center">
      {services.title}
    </h2>
    <div class="flex flex-row flex-wrap mb-8">
      <For each={services.items}>
        {(service) => (
          <div class="flex flex-col items-center mt-16 lg:w-1/2">
            <div class="flex flex-col items-center">
              <Icon name={service.icon} class="w-12 h-12" />
              <h3 class="mt-2 text-xl">{service.title}</h3>
            </div>
            <div class="mt-4 lg:w-[400px]">
              <p>{service.paragraph}</p>
            </div>
          </div>
        )}
      </For>
    </div>
    <div class="flex flex-col items-center mb-2">
      <p class="mt-16 mb-8">{services.outro}</p>
      <a
        href={services.action.href}
        class="p-2 px-8 mb-4 text-lg bg-brand rounded-full border-sky-500 animate border-1 hover:border-white hover:bg-white hover:text-black hover:cursor-pointer"
      >
        {services.action.label}
      </a>
    </div>
  </section>
);
