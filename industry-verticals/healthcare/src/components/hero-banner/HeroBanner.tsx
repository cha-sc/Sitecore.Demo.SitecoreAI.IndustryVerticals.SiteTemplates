import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  NextImage as ContentSdkImage,
  Text as ContentSdkText,
  RichText as ContentSdkRichText,
  Link as ContentSdkLink,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

interface Fields {
  Image: ImageField;
  Video: ImageField;
  Title: Field<string>;
  Description: RichTextField;
  CtaLink: LinkField;
  SecondaryCtaLink: LinkField;
}

interface HeroBannerProps extends ComponentProps {
  fields: Fields;
}

export const DefaultHeroBanner = (props: HeroBannerProps) => {
  const { page } = useSitecore();
  const id = props.params.RenderingIdentifier;
  const { fields, params } = props;
  const isPageEditing = page.mode.isEditing;

  const imageSrc = fields?.Image?.value?.src;
  const videoSrc = fields?.Video?.value?.src;
  const hasImage = Boolean(imageSrc);
  const hasVideo = Boolean(videoSrc);
  const showMedia = hasImage || hasVideo;

  if (!fields) {
    return isPageEditing ? (
      <div className={`component hero-banner ${params?.styles}`} id={id}>
        [HERO BANNER]
      </div>
    ) : null;
  }

  return (
    <section className={`relative bg-background-tertiary-dark ${params?.styles}`} id={id || undefined}>
      {showMedia && (
        <div className="relative w-full overflow-hidden">
          <div className="relative aspect-21/9 min-h-48 w-full max-h-[85vh] sm:min-h-64">
            {!isPageEditing && hasVideo ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={hasImage ? imageSrc : undefined}
              >
                <source src={videoSrc} />
              </video>
            ) : hasImage ? (
              <ContentSdkImage
                field={fields.Image}
                className="absolute inset-0 h-full w-full object-cover"
                priority
              />
            ) : null}
          </div>
        </div>
      )}

      <div className="container relative z-10 py-12">
        <h1 className="font-heading text-foreground-dark text-4xl font-bold lg:text-5xl">
          <ContentSdkText field={fields.Title} />
        </h1>
        <div className="text-foreground-dark mt-4 max-w-3xl text-lg">
          <ContentSdkRichText field={fields.Description} />
        </div>
        {(fields.CtaLink || fields.SecondaryCtaLink) && (
          <div className="mt-8 flex flex-wrap gap-4">
            {fields.CtaLink && <ContentSdkLink field={fields.CtaLink} className="btn" />}
            {fields.SecondaryCtaLink && (
              <ContentSdkLink field={fields.SecondaryCtaLink} className="main-btn" />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export const Default = withDatasourceCheck()<HeroBannerProps>(DefaultHeroBanner);
