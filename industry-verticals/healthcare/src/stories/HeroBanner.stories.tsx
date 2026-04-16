import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComponentProps } from 'react';
import { Default as HeroBanner } from '../components/hero-banner/HeroBanner';
import { CommonParams, CommonRendering } from './common/commonData';
import {
  createImageField,
  createLinkField,
  createPlaceholderImageSrc,
  createRichTextField,
  createTextField,
} from './helpers/createFields';

type StoryProps = ComponentProps<typeof HeroBanner>;

const meta = {
  title: 'Page Content/Hero Banner',
  component: HeroBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-bleed hero with background image, dark overlay, title, rich-text description, optional illustration from **CtaLink** media (`src` / `url`), and a primary CTA button when **CtaLink** has an `href`. **SecondaryCtaLink** is reserved for datasource parity with the Hero Banner template.',
      },
    },
  },
} satisfies Meta<StoryProps>;
export default meta;

type Story = StoryObj<StoryProps>;

const baseParams = {
  ...CommonParams,
  RenderingIdentifier: 'hero-banner-storybook',
};

const baseRendering = {
  ...CommonRendering,
  componentName: 'Hero Banner',
  params: baseParams,
};

type HeroBannerFieldOptions = {
  /** When false, CtaLink has no `src`/`url` (illustration hidden; button still shows if `href` is set). */
  includeCtaIllustration?: boolean;
  /** When false, CtaLink has no `href` (primary CTA button hidden). */
  includeCtaHref?: boolean;
};

/**
 * Mirrors the Hero Banner datasource: Image, Title, Description, CtaLink (text + optional media + href), SecondaryCtaLink.
 */
const createHeroBannerFields = (options: HeroBannerFieldOptions = {}) => {
  const { includeCtaIllustration = true, includeCtaHref = true } = options;

  const ctaLinkValue = {
    ...createLinkField('Find your care team').value,
    title: 'CTA illustration',
    ...(includeCtaIllustration ? { src: createPlaceholderImageSrc('placeholder') } : {}),
    ...(includeCtaHref ? {} : { href: '' as const }),
  };

  return {
    Image: createImageField('placeholder'),
    Title: createTextField('Care that puts you first'),
    Description: createRichTextField(2, 'paragraphs'),
    CtaLink: { value: ctaLinkValue },
    SecondaryCtaLink: createLinkField('Learn more'),
  };
};

export const Default: Story = {
  name: 'Default',
  render: () => (
    <HeroBanner params={baseParams} rendering={baseRendering} fields={createHeroBannerFields()} />
  ),
};

/** Primary CTA only (no illustration from CtaLink media). */
export const WithoutCtaIllustration: Story = {
  name: 'Without CTA illustration',
  render: () => (
    <HeroBanner
      params={baseParams}
      rendering={baseRendering}
      fields={createHeroBannerFields({ includeCtaIllustration: false })}
    />
  ),
};

/** No primary button (CtaLink without href); illustration still shown when `src` is present. */
export const WithoutCtaButton: Story = {
  name: 'Without CTA button',
  render: () => (
    <HeroBanner
      params={baseParams}
      rendering={baseRendering}
      fields={createHeroBannerFields({ includeCtaHref: false })}
    />
  ),
};
