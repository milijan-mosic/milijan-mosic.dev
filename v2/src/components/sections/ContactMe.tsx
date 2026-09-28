import { type Component, createSignal } from "solid-js";
import toast from "solid-toast";
import { contact } from "~/content";
import { FROM_SITE } from "~/lib/contact";
import { getRecaptchaToken, loadRecaptcha } from "~/lib/recaptcha";

/**
 * `mt-8` matches the Projects CTA and restores the breathing room the v1 form
 * got from the status paragraph that sat here before toasts replaced it.
 * Both states must keep identical geometry, or the button shifts mid-submit.
 */
const IDLE_BUTTON_CLASS =
  "p-2 px-8 mt-4 mb-8 text-lg bg-brand rounded-full border-brand-mid animate border-1 hover:border-white hover:bg-white hover:text-black hover:cursor-pointer";
const SENDING_BUTTON_CLASS =
  "p-2 px-8 mt-4 mb-8 text-lg text-black bg-yellow-300 rounded-full cursor-not-allowed animate";

export const ContactMe: Component = () => {
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  // api.js is only worth its ~150 KB once someone actually starts typing.
  const primeRecaptcha = () => void loadRecaptcha();

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    if (isSubmitting()) return;

    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    setIsSubmitting(true);

    try {
      const token = await getRecaptchaToken("contact");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_site: FROM_SITE,
          name: String(data.get("name") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          message: String(data.get("request") ?? "").trim(),
          website: String(data.get("website") ?? ""),
          token,
        }),
      });

      if (!response.ok) throw new Error("Failed to send request");

      toast.success(contact.successMessage);
      form.reset();
    } catch {
      toast.error(contact.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact-me"
      aria-labelledby="contact-me-title"
      class="glass-card p-8 my-16 mx-8 flex flex-col items-center md:w-[400px] lg:w-[550px] xl:w-[1000px]"
    >
      <h2 id="contact-me-title" class="mt-4 mb-16 text-2xl font-bold">
        {contact.title}
      </h2>

      <div class="flex justify-center mb-16 w-full text-justify">
        <p class="w-full text-justify lg:w-1/2">{contact.intro}</p>
      </div>

      <form
        id="contact-form"
        class="flex flex-col gap-8 w-full"
        onSubmit={onSubmit}
        onFocusIn={primeRecaptcha}
      >
        <div class="flex flex-col items-center w-full">
          <label for="name" class="mb-1 w-full lg:w-1/2">
            {contact.fields.name.label}
          </label>
          <input
            required
            id="name"
            type="text"
            name="name"
            autocomplete="name"
            placeholder={contact.fields.name.placeholder}
            class="form-input"
          />
        </div>
        <div class="flex flex-col items-center w-full">
          <label for="email" class="mb-1 w-full lg:w-1/2">
            {contact.fields.email.label}
          </label>
          <input
            required
            id="email"
            type="email"
            name="email"
            autocomplete="email"
            placeholder={contact.fields.email.placeholder}
            class="form-input"
          />
        </div>
        <div class="flex flex-col items-center w-full">
          <label for="request" class="mb-1 w-full lg:w-1/2">
            {contact.fields.request.label}
          </label>
          <textarea
            required
            id="request"
            name="request"
            rows="7"
            placeholder={contact.fields.request.placeholder}
            class="form-input"
          />
        </div>

        {/* Honeypot: off-screen rather than display:none, which naive bots skip. */}
        <input
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
        />

        <div class="flex flex-col items-center w-full">
          <button
            id="submit-button"
            type="submit"
            disabled={isSubmitting()}
            class={isSubmitting() ? SENDING_BUTTON_CLASS : IDLE_BUTTON_CLASS}
          >
            {isSubmitting() ? contact.submittingLabel : contact.submitLabel}
          </button>
          <p class="mx-8 text-xs text-center text-white/65">
            {contact.recaptchaNotice.prefix}
            <a
              href={contact.recaptchaNotice.privacyHref}
              target="_blank"
              rel="noopener noreferrer"
              class="underline"
            >
              {contact.recaptchaNotice.privacyLabel}
            </a>
            {contact.recaptchaNotice.middle}
            <a
              href={contact.recaptchaNotice.termsHref}
              target="_blank"
              rel="noopener noreferrer"
              class="underline"
            >
              {contact.recaptchaNotice.termsLabel}
            </a>
            {contact.recaptchaNotice.suffix}
          </p>
        </div>
      </form>
    </section>
  );
};
