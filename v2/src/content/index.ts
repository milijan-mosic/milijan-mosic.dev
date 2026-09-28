import aboutJson from "../../content/about.json";
import consentJson from "../../content/consent.json";
import contactJson from "../../content/contact.json";
import heroJson from "../../content/hero.json";
import navigationJson from "../../content/navigation.json";
import projectsJson from "../../content/projects.json";
import servicesJson from "../../content/services.json";
import siteJson from "../../content/site.json";
import skillsJson from "../../content/skills.json";
import testimonialsJson from "../../content/testimonials.json";

import type {
  About,
  Consent,
  Contact,
  Hero,
  Navigation,
  Projects,
  Services,
  Site,
  Skills,
  Testimonials,
} from "./types";

export const site: Site = siteJson;
export const hero: Hero = heroJson;
export const navigation: Navigation = navigationJson;
export const about: About = aboutJson;
export const services: Services = servicesJson;
export const skills: Skills = skillsJson;
export const projects: Projects = projectsJson;
export const testimonials: Testimonials = testimonialsJson;
export const contact: Contact = contactJson;
export const consent: Consent = consentJson;

export type * from "./types";
