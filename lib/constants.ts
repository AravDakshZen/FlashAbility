export const siteConfig = {
  name: "e-Flash Cards",
  tagline: "Empowering Communication Through Digital Learning",
  description:
    "Replace traditional printed flashcards with an accessible, interactive, and sustainable learning experience designed for Persons with Disabilities.",
  url: "https://e-flashcards.example.com",
  links: {
    github: "https://github.com",
  },
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

export const footerLinks = {
  about: [
    { label: "About", href: "/#about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "GitHub", href: "https://github.com" },
    { label: "Contact", href: "/#contact" },
  ],
} as const;
