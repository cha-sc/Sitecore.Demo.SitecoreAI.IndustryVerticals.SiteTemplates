import { generateIndexes } from '@/helpers/generateIndexes';
import { IGQLTextField } from '@/types/igql';
import {
  ComponentParams,
  ComponentRendering,
  Image,
  Link,
  Text,
  type LinkField,
  type TextField,
} from '@sitecore-content-sdk/nextjs';
import React from 'react';
import AccentLine from '@/assets/icons/accent-line/AccentLine';
import { CommonStyles } from '@/types/styleFlags';

interface Fields {
  data: {
    datasource: {
      children: {
        results: Feature[];
      };
      title: IGQLTextField;
      description?: IGQLTextField;
    };
  };
}

interface Feature {
  featureImage: { jsonValue: { value: { src: string; alt?: string } } };
  featureTitle: { jsonValue: TextField };
  featureDescription: { jsonValue: TextField };
  featureLink: { jsonValue: LinkField };
  /** Optional uppercase label (e.g. ANNOUNCEMENT). Falls back to featureDescription when absent. */
  featureCategory?: { jsonValue: TextField };
}

type FeaturesProps = {
  rendering: ComponentRendering & { params: ComponentParams };
  params: { [key: string]: string };
  fields: Fields;
};

type FeatureWrapperProps = {
  props: FeaturesProps;
  children: React.ReactNode;
};

const FeatureWrapper = (wrapperProps: FeatureWrapperProps) => {
  // rendering item id
  const id = wrapperProps.props.params.RenderingIdentifier;

  return (
    <section className={`${wrapperProps.props.params.styles}`} id={id ? id : undefined}>
      {wrapperProps.children}
    </section>
  );
};

export const Default = (props: FeaturesProps) => {
  // results of the graphql
  const results = props.fields.data.datasource.children.results;
  const hideAccentLine = props.params.styles?.includes(CommonStyles.HideAccentLine);
  const featureSectionTitle = props.fields.data.datasource.title;

  return (
    <FeatureWrapper props={props}>
      <div className="container grid grid-cols-1 py-20 lg:grid-cols-[1fr_2fr] lg:gap-10">
        <div className="mb-20 lg:mb-0">
          <h2 className="inline-block max-w-md font-bold max-lg:text-[42px]">
            <Text field={featureSectionTitle.jsonValue} />
            {!hideAccentLine && <AccentLine className="w-full max-w-xs" />}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {results.map((item, index) => {
            const title = item.featureTitle.jsonValue;
            const description = item.featureDescription.jsonValue;
            const link = item.featureLink.jsonValue;
            return (
              <div className="flex flex-col" key={index}>
                {/* Title, Link and Description */}
                <div className="mb-5 text-2xl font-bold">
                  <Text field={title} />
                </div>
                <div className="text-foreground mb-3.5 flex-auto leading-7">
                  <Text field={description} />
                </div>
                <div>
                  <Link field={link} className="arrow-btn" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FeatureWrapper>
  );
};

export const ImageGrid = (props: FeaturesProps) => {
  // results of the graphql
  const results = props.fields.data.datasource.children.results;

  return (
    <FeatureWrapper props={props}>
      <div className="container grid grid-cols-1 gap-4 py-9 md:grid-cols-2 lg:grid-cols-5">
        {results.map((item, index) => {
          const imageField = item?.featureImage.jsonValue;
          return (
            <div className="flex items-center justify-center py-9 lg:py-2" key={index}>
              {imageField && <Image field={imageField} className="max-h-20 object-contain" />}
            </div>
          );
        })}
      </div>
    </FeatureWrapper>
  );
};

export const ThreeColGridCentered = (props: FeaturesProps) => {
  const results = props.fields.data.datasource.children.results;
  const { title, description } = props.fields.data.datasource;

  const blackClipDesktop =
    '[clip-path:polygon(0_0,calc(100%-2.25rem)_0,100%_50%,calc(100%-2.25rem)_100%,0_100%)]';

  return (
    <FeatureWrapper props={props}>
      <div className="border-brand-black mx-auto my-2 w-[80%] border-2">
        <div className="drop-shadow-2xl">
          {/* Single row: title (black + arrow) | description | links (evenly spaced in remaining width) */}
          <div className="bg-background flex min-h-16 w-full min-w-0 flex-nowrap items-stretch overflow-x-auto">
            <div
              className={`text-background flex w-[40%] max-w-md min-w-42 shrink-0 flex-col justify-center bg-black px-5 py-5 sm:px-6 sm:py-6 ${blackClipDesktop}`}
            >
              <Text
                tag="h2"
                className="text-background font-heading text-lg leading-tight font-bold sm:text-xl md:text-2xl lg:text-2xl"
                field={title.jsonValue}
              />
            </div>

            <div className="text-foreground bg-background flex max-w-lg shrink-0 items-center px-4 py-4 sm:px-5 lg:px-6">
              {description?.jsonValue ? (
                <Text
                  field={description.jsonValue}
                  className="line-clamp-3 text-sm leading-snug sm:line-clamp-4 sm:text-base md:line-clamp-none"
                />
              ) : null}
            </div>

            <div className="bg-background flex min-h-16 min-w-0 flex-1 justify-evenly self-stretch px-3 py-3 sm:px-5 sm:py-3">
              {results.map((item, index) => (
                <Link
                  key={`feature-cta-${index}-${item.featureTitle?.jsonValue?.value ?? ''}`}
                  field={item.featureLink.jsonValue}
                  className="bg-brand-gold text-brand-black hover:bg-brand-gold-deep inline-flex shrink-0 items-center justify-center px-4 py-2.5 text-sm font-semibold whitespace-nowrap md:px-5 md:text-base"
                >
                  <Text field={item.featureTitle.jsonValue} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FeatureWrapper>
  );
};

export const NumberedGrid = (props: FeaturesProps) => {
  // results of the graphql
  const results = props.fields.data.datasource.children.results;

  return (
    <FeatureWrapper props={props}>
      <div className="container grid grid-cols-1 gap-4 py-24 md:grid-cols-2 lg:grid-cols-3">
        {results.map((item, index) => {
          const title = item?.featureTitle.jsonValue;
          const description = item?.featureDescription.jsonValue;
          return (
            <div
              className="group text-background hover:bg-accent cursor-pointer rounded-xl p-6"
              key={index}
            >
              {/* Generated Number */}
              <h1 className="group-hover:text-background text-background-muted-dark mb-2 text-7xl leading-24">
                {generateIndexes(index)}
              </h1>
              {/* Title and Description */}
              <div>
                <div className="text-accent group-hover:text-background mb-4 text-2xl leading-8 font-bold">
                  <Text field={title} />
                </div>
                <div className="text-background-muted-dark group-hover:text-background leading-7">
                  <Text field={description} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FeatureWrapper>
  );
};

export const FourColGrid = (props: FeaturesProps) => {
  // results of the graphql
  const results = props.fields.data.datasource.children.results;

  return (
    <FeatureWrapper props={props}>
      <div className="container grid grid-cols-1 gap-20 py-24 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        {results.map((item, index) => {
          const title = item.featureTitle.jsonValue;
          const description = item.featureDescription.jsonValue;
          const image = item.featureImage.jsonValue;
          return (
            <div className="grid grid-cols-[1fr_2fr] gap-2.5" key={index}>
              {/* Image */}
              <div className="flex items-center justify-center rounded-full">
                <Image field={image} />
              </div>
              {/* Title and Description */}
              <div className="flex flex-col justify-center">
                <div className="text-xl leading-9 font-bold">
                  <Text className="text-foreground" field={title} />
                </div>
                <div className="text-background-muted-light leading-8">
                  <Text field={description} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FeatureWrapper>
  );
};

export const ImageCardGrid = (props: FeaturesProps) => {
  const raw = props.fields.data.datasource.children.results;
  const cards: Feature[] = Array.isArray(raw) ? raw : raw ? [raw as Feature] : [];
  const { title } = props.fields.data.datasource;

  return (
    <FeatureWrapper props={props}>
      <div className="container py-12 lg:py-16">
        <div className="relative isolate bg-[#2d2d2d] px-5 pt-6 pb-10 sm:px-8 sm:pt-8 sm:pb-12">
          {/* Gold frame: sits behind all content */}
          <div
            className="border-brand-gold pointer-events-none absolute inset-0 z-0 box-border border-2"
            aria-hidden
          />

          <div className="relative z-10">
            <header className="mb-8 flex flex-wrap items-start justify-between gap-x-8 gap-y-4 sm:mb-10">
              <h2 className="font-heading inline-block max-w-[min(100%,36rem)] bg-[#2d2d2d] text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                <Text className="text-white" field={title.jsonValue} />
              </h2>
              <nav className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-[#2d2d2d] text-sm text-white sm:text-base">
                <a
                  href="/news"
                  className="decoration-brand-cyan text-white underline decoration-2 underline-offset-[5px] hover:opacity-90"
                >
                  All News
                </a>
                <span className="text-white/60 select-none" aria-hidden>
                  |
                </span>
                <a
                  href="/events"
                  className="decoration-brand-cyan text-white underline decoration-2 underline-offset-[5px] hover:opacity-90"
                >
                  All Events
                </a>
              </nav>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {cards.map((item, index) => {
                const categoryField =
                  item.featureCategory?.jsonValue ?? item.featureDescription.jsonValue;
                return (
                  <Link
                    key={index}
                    field={item.featureLink.jsonValue}
                    className="group focus-visible:ring-brand-cyan flex h-full flex-col overflow-hidden bg-white shadow-md transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2d2d2d] focus-visible:outline-none"
                  >
                    <div className="aspect-4/3 w-full shrink-0 overflow-hidden bg-zinc-300">
                      <Image
                        field={item.featureImage.jsonValue}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
                      <div className="flex items-center gap-2">
                        <span className="bg-brand-cyan h-2 w-2 shrink-0" aria-hidden />
                        <span className="text-foreground line-clamp-1 text-xs font-bold tracking-wide uppercase">
                          <Text field={categoryField} />
                        </span>
                      </div>
                      <div className="text-foreground font-heading text-base leading-snug font-bold sm:text-lg">
                        <Text field={item.featureTitle.jsonValue} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </FeatureWrapper>
  );
};
