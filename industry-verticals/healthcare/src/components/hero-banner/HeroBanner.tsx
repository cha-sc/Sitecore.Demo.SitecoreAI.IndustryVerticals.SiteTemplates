'use client';

import React from 'react';
import {
  ImageField,
  LinkField,
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  RichTextField,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import BlobAccent from '@/assets/shapes/BlobAccent';
import HeroClip from '@/assets/shapes/HeroClip';

interface Fields {
  Image: ImageField;
  Description: RichTextField;
  CtaLink: LinkField;
}

interface HeroBannerProps extends ComponentProps {
  fields: Fields;
}

export const DefaultHeroBanner = (props: HeroBannerProps) => {
  const id = props.params.RenderingIdentifier;

  return (
    <section className={`relative pb-12 ${props?.params?.styles}`} id={id || undefined}>
      <div className="relative">
        <div className="absolute inset-0 z-0 mask-[var(--background-image-hero-clip)] mask-cover">
          <ContentSdkImage field={props.fields.Image} className="h-full w-full object-cover" />
        </div>
        <HeroClip />
        <BlobAccent className="absolute bottom-14 left-0 z-1 lg:left-4" />
        <div className="pointer-events-none relative z-10 container flex min-h-[80vh] flex-col">
          <div className="pointer-events-auto relative z-20 flex max-w-xl flex-col gap-6 pt-24 pb-8 lg:max-w-2xl lg:pt-32">
            <h2 className="font-heading text-brand text-3xl leading-tight font-extrabold lg:text-5xl">
              <ContentSdkRichText field={props.fields.Description} className="text-brand!" />
            </h2>
            <ContentSdkLink
              field={props.fields.CtaLink}
              className="btn w-fit rounded-full px-8 py-3 text-base lg:text-lg"
            >
              {props.fields.CtaLink?.value?.text}
            </ContentSdkLink>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default = withDatasourceCheck()<HeroBannerProps>(DefaultHeroBanner);
