import { owner } from './owner';

export interface SocialLink {
  label: string;
  href: string;
  icon: 'github' | 'linkedin' | 'twitter' | 'bluesky' | 'email';
}

export const socialLinks: SocialLink[] = [
  owner.social.github && {
    label: 'GitHub',
    href: owner.social.github,
    icon: 'github' as const,
  },
  owner.social.linkedin && {
    label: 'LinkedIn',
    href: owner.social.linkedin,
    icon: 'linkedin' as const,
  },
  owner.social.twitter && {
    label: 'Twitter / X',
    href: owner.social.twitter,
    icon: 'twitter' as const,
  },
  owner.social.bluesky && {
    label: 'Bluesky',
    href: owner.social.bluesky,
    icon: 'bluesky' as const,
  },
  {
    label: 'Email',
    href: `mailto:${owner.email}`,
    icon: 'email' as const,
  },
].filter(Boolean) as SocialLink[];
