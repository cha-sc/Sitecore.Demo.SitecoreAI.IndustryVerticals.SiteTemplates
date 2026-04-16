import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text as ContentSdkText,
  Link as ContentSdkLink,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface Fields {
  Image: ImageField;
  Title: Field<string>;
  Description: Field<string>;
  CtaLink: LinkField;
  SecondaryCtaLink: LinkField;
}

interface HeroBannerProps extends ComponentProps {
  fields: Fields;
}

/** Overrides global `base` / `.rich-text` foreground colors; centers embedded media. */
const heroBodyTextClass =
  'text-[var(--color-background)] [&_h1]:!text-[var(--color-background)] [&_h2]:!text-[var(--color-background)] [&_h3]:!text-[var(--color-background)] [&_h4]:!text-[var(--color-background)] [&_p]:!text-[var(--color-background)] [&_a]:!text-[var(--color-background)] [&_li]:!text-[var(--color-background)] [&_ul]:!text-[var(--color-background)] [&_ol]:!text-[var(--color-background)] [&_strong]:!text-[var(--color-background)] [&_em]:!text-[var(--color-background)] [&_span]:!text-[var(--color-background)] [&_.ck-content]:!text-[var(--color-background)] [&_.ck-content_*]:!text-[var(--color-background)] [&_.rich-text]:!text-[var(--color-background)] [&_.rich-text_*]:!text-[var(--color-background)] [&_img]:mx-auto [&_img]:block [&_img]:max-w-full [&_figure]:mx-auto [&_figure]:flex [&_figure]:justify-center [&_figure_img]:mx-auto';

/** Image URL from a General Link when the link target includes media (src / url). */
function getCtaLinkImageSrc(link: LinkField | undefined): string | undefined {
  if (!link?.value) return undefined;
  const v = link.value as {
    src?: string;
    url?: string;
  };
  return v.src || v.url || undefined;
}

export const DefaultHeroBanner = (props: HeroBannerProps) => {
  const id = props.params.RenderingIdentifier;
  const { fields } = props;
  const ctaImageSrc = getCtaLinkImageSrc(fields.CtaLink);

  return (
    <section
      className={`relative min-h-[80vh] overflow-hidden ${props?.params?.styles}`}
      id={id || undefined}
    >
      <div className="absolute inset-0 z-0">
        <ContentSdkImage field={fields.Image} className="h-full w-full object-cover" priority />
        <div className="absolute inset-0 bg-black/70" aria-hidden />
      </div>

      <div className="relative z-10 container flex min-h-[80vh] flex-col justify-center py-16 text-center">
        <div className={`mx-auto ${heroBodyTextClass}`}>
          <h1 className="font-heading text-4xl font-bold tracking-tight !text-[var(--color-background)] uppercase md:text-5xl lg:text-6xl">
            <ContentSdkText field={fields.Title} />
          </h1>

          <div className="text-lg leading-relaxed md:text-xl [&_p]:mb-4 [&_p:has(>img)]:flex [&_p:has(>img)]:justify-center [&_p:last-child]:mb-0">
            <ContentSdkRichText field={fields.Description} />
          </div>

          {ctaImageSrc ? (
            <div className="pt-2">
              <img
                src={ctaImageSrc}
                alt={(fields.CtaLink?.value as { title?: string })?.title ?? ''}
                className="h-auto max-h-48 w-auto max-w-full object-contain"
              />
            </div>
          ) : null}

          {fields.CtaLink?.value?.href ? (
            <div className="pt-4">
              <ContentSdkLink
                field={fields.CtaLink}
                className="bg-accent hover:bg-accent/95 inline-flex items-center justify-center rounded-lg px-8 py-3 text-lg font-semibold !text-[var(--color-background)] transition-colors"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export const Default = withDatasourceCheck()<HeroBannerProps>(DefaultHeroBanner);
