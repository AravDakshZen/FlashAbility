import {
  Accessibility,
  AudioWaveform,
  BadgeCheck,
  Contrast,
  Globe,
  Keyboard,
  Layers,
  Leaf,
  MonitorSmartphone,
  Repeat,
  Smartphone,
  Speech,
  Type,
  Volume2,
  type LucideIcon,
} from "lucide-react";

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: LandingFeature[] = [
  {
    icon: Layers,
    title: "Electronic Flashcards",
    description:
      "Digital decks that replace printed cards — instantly searchable, reusable, and easy to update.",
  },
  {
    icon: Repeat,
    title: "Digital Reinforcement Cards",
    description:
      "Built-in positive reinforcement keeps learners motivated through every session.",
  },
  {
    icon: Volume2,
    title: "Text-to-Speech",
    description:
      "Clear, natural voice playback for every word, phrase, and card.",
  },
  {
    icon: Speech,
    title: "Pronunciation Assistance",
    description:
      "Hear correct pronunciation and practice with gentle, instant feedback.",
  },
  {
    icon: MonitorSmartphone,
    title: "E-paper Compatibility",
    description:
      "Optimized for low-glare e-paper and tablet displays for comfortable reading.",
  },
  {
    icon: Accessibility,
    title: "Accessibility First",
    description:
      "High-contrast UI, keyboard navigation, and screen-reader support built in from day one.",
  },
];

export const whyCards: LandingFeature[] = [
  {
    icon: Leaf,
    title: "Reduce Paper Waste",
    description:
      "Cut down on printing, laminating, and replacing worn-out card sets.",
  },
  {
    icon: Smartphone,
    title: "Portable Learning",
    description:
      "Your entire flashcard library travels with you — right in your pocket.",
  },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    description:
      "One account, every device: tablets, phones, laptops, and e-paper.",
  },
];

export const accessibilityHighlights: LandingFeature[] = [
  {
    icon: Contrast,
    title: "High Contrast Mode",
    description:
      "A high-contrast theme strengthens readability for low-vision users.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    description: "Every feature is reachable and operable with a keyboard alone.",
  },
  {
    icon: AudioWaveform,
    title: "Voice Support",
    description: "Screen-reader friendly labels and voice output for every action.",
  },
  {
    icon: Type,
    title: "Adjustable Font Sizes",
    description: "Text scales to whatever size is most comfortable to read.",
  },
  {
    icon: BadgeCheck,
    title: "Accessibility Guidelines",
    description: "Aligned with government accessibility guidelines (WCAG 2.x AA).",
  },
];
