export const siteConfig = {
  name: "FlashAbility",
  tagline: "Accessible Digital Learning Platform",
  description:
    "Digital flash cards for speech & language therapy — developed for NIEPMD (National Institute for Empowerment of Persons with Multiple Disabilities), Ministry of Social Justice & Empowerment, Government of India. Accessible, interactive, and sustainable learning for Divyangjan.",
  url: "https://e-flashcards.example.com",
  links: {
    github: "https://github.com",
  },
  institution: {
    name: "NIEPMD",
    fullName: "National Institute for Empowerment of Persons with Multiple Disabilities",
    ministry: "Ministry of Social Justice & Empowerment, Government of India",
  },
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Flashcards", href: "/decks" },
  { label: "Courses", href: "/courses" },
  { label: "Progress", href: "/dashboard" },
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
