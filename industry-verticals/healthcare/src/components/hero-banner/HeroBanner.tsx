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
        <div className="border-background text-foreground-dark mt-4 border-b pb-3 text-lg">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-stretch" role="search" action="">
            <input
              type="search"
              name="search"
              placeholder="Search"
              className="form-input flex-1 bg-transparent! text-xl text-foreground-dark shadow-none! placeholder:text-foreground-dark"
              aria-label="Search"
            />
            <button
              type="submit"
              name="search-submit"
              value="Search"
              className="text-foreground-dark inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-transparent px-6 py-3 text-base font-semibold transition-opacity hover:opacity-90"
            >
              Search
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.9984 18.9999L14.6484 14.6499"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
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
