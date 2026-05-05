import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'react';
import { Default as HeroBanner } from '../components/hero-banner/HeroBanner';
import { CommonParams, CommonRendering } from './common/commonData';
import {
  createImageField,
  createLinkField,
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
  },
} satisfies Meta<StoryProps>;
export default meta;

type Story = StoryObj<StoryProps>;

const baseParams = {
  ...CommonParams,
};

const baseRendering = {
  ...CommonRendering,
  componentName: 'Hero Banner',
  params: baseParams,
};

// Mock fields for the HeroBanner component
const createHeroBannerFields = () => ({
  Image: createImageField('placeholder'),
  Video: { value: {} } as ImageField,
  Title: createTextField('Care that puts you first'),
  Description: createRichTextField(2),
  CtaLink: createLinkField('Book an appointment'),
  SecondaryCtaLink: createLinkField('Our services'),
});

export const Default: Story = {
  render: () => {
    const fields = createHeroBannerFields();

    return <HeroBanner params={baseParams} rendering={baseRendering} fields={fields} />;
  },
};
