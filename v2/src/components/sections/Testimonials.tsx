import { type Component, For } from "solid-js";
import { testimonials } from "~/content";

export const Testimonials: Component = () => (
  <div class="flex flex-col items-center my-12 w-full">
    <For each={testimonials.groups}>
      {(group, index) => {
        const titleId = `testimonials-group-${index()}`;

        return (
          <section
            // The v1 markup repeated id="testimonials" on both groups; only the
            // first may carry it, otherwise the anchor target is ambiguous.
            id={index() === 0 ? "testimonials" : undefined}
            aria-labelledby={titleId}
            class="glass-card p-8 my-8 mx-8 flex flex-col items-center md:w-100 lg:w-137.5 xl:w-250"
          >
            <h2 id={titleId} class="mt-4 text-2xl font-bold text-center">
              {group.title}
            </h2>
            <ul class="flex flex-col items-stretch mb-8 w-full lg:flex-row lg:mb-0 lg:mt-8">
              <For each={group.entries}>
                {(testimonial) => (
                  // The <li> takes over the width and margins the <article>
                  // carried in v1, so it remains the identical flex child.
                  <li class="flex w-full lg:w-[250px] mt-16 lg:m-8">
                    <article class="flex flex-col items-center text-center bg-white/25 shadow-xl rounded-xl p-8 w-full">
                      <img
                        loading="lazy"
                        src={testimonial.image}
                        alt={`Photo of the person named ${testimonial.name}`}
                        class="object-cover mb-2 w-32 h-32 rounded-full shadow-lg"
                        width="128"
                        height="128"
                      />
                      <h3 class="text-xl font-bold">{testimonial.name}</h3>
                      <p class="mb-4 text-white/65">{testimonial.company}</p>
                      <blockquote class="italic leading-relaxed text-md text-start">
                        {testimonial.message}
                      </blockquote>
                    </article>
                  </li>
                )}
              </For>
            </ul>
          </section>
        );
      }}
    </For>
  </div>
);
