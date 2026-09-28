export interface Link {
  href: string;
  label: string;
}

export interface SocialLink extends Link {
  icon: string;
  /** Tailwind sizing, which differs per mark so the optical weight stays even. */
  size: string;
}

export interface Site {
  name: string;
  role: string;
  title: string;
  description: string;
  author: string;
  canonical: string;
  email: string;
  locale: string;
  footer: {
    identity: string;
    location: string;
    copyrightFrom: string;
    credits: string;
    cookieSettings: string;
  };
  social: SocialLink[];
}

export interface Hero {
  image: string;
  imageAlt: string;
  name: string;
  role: string;
  tagline: string;
  motto: string;
  primaryAction: Link;
  secondaryAction: Link;
}

export interface Navigation {
  links: Link[];
}

export interface About {
  title: string;
  paragraphs: string[];
  experienceTitle: string;
  experience: string[];
  educationTitle: string;
  education: string[];
}

export interface Service {
  icon: string;
  title: string;
  paragraph: string;
}

export interface Services {
  title: string;
  items: Service[];
  outro: string;
  action: Link;
}

export interface Skill {
  icon: string;
  name: string;
}

export interface SkillGroup {
  title: string;
  skills: Skill[];
}

export interface Skills {
  title: string;
  groups: SkillGroup[];
}

export interface Project {
  name: string;
  type: string;
  description: string;
  technologies: string[];
  role: string[];
  thumbnail: string;
}

export interface Projects {
  title: string;
  items: Project[];
  action: Link;
}

export interface Testimonial {
  image: string;
  name: string;
  company: string;
  message: string;
}

export interface TestimonialGroup {
  title: string;
  entries: Testimonial[];
}

export interface Testimonials {
  groups: TestimonialGroup[];
}

export interface Contact {
  title: string;
  intro: string;
  fields: {
    name: { label: string; placeholder: string };
    email: { label: string; placeholder: string };
    request: { label: string; placeholder: string };
  };
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  errorMessage: string;
  recaptchaNotice: {
    prefix: string;
    privacyLabel: string;
    privacyHref: string;
    middle: string;
    termsLabel: string;
    termsHref: string;
    suffix: string;
  };
}

export interface Consent {
  message: string;
  acceptLabel: string;
  rejectLabel: string;
}
