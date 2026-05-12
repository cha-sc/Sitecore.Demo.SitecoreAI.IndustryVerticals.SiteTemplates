import {
  Field,
  ImageField,
  LinkField,
  NextImage as ContentSdkImage,
  Text as ContentSdkText,
  RichText as ContentSdkRichText,
  useSitecore,
  Placeholder,
  Link,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import AccentLine from '@/assets/icons/accent-line/AccentLine';
import { CommonStyles, HeroBannerStyles, LayoutStyles } from '@/types/styleFlags';
import clsx from 'clsx';

interface Fields {
  Image: ImageField;
  Video: ImageField;
  Title: Field<string>;
  Description: Field<string>;
  CtaLink: LinkField;
}

interface HeroBannerProps extends ComponentProps {
  fields: Fields;
}

const HeroBannerCommon = ({
  params,
  fields,
  children,
}: HeroBannerProps & {
  children: React.ReactNode;
}) => {
  const { page } = useSitecore();
  const { styles, RenderingIdentifier: id } = params;
  const isPageEditing = page.mode.isEditing;
  const hideGradientOverlay = styles?.includes(HeroBannerStyles.HideGradientOverlay);

  if (!fields) {
    return isPageEditing ? (
      <div className={`component hero-banner ${styles}`} id={id}>
        [HERO BANNER]
      </div>
    ) : (
      <></>
    );
  }

  return (
    <div className={`component hero-banner ${styles} relative flex items-center`} id={id}>
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {!isPageEditing && fields?.Video?.value?.src ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={fields.Image?.value?.src}
          >
            <source src={fields.Video?.value?.src} type="video/webm" />
          </video>
        ) : (
          <>
            <ContentSdkImage
              field={fields.Image}
              className="h-full w-full object-cover md:object-bottom"
              priority
            />
          </>
        )}
        {/* Gradient overlay to fade image/video at bottom */}
        {!hideGradientOverlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-85% to-white"></div>
        )}
      </div>

      {children}
    </div>
  );
};

export const Default = ({ params, fields, rendering }: HeroBannerProps) => {
  const { page } = useSitecore();
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const screenLayer = styles.includes(HeroBannerStyles.ScreenLayer);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;
  const hasImageOnly =
    (Boolean(fields.Image?.value?.src) && !fields.Video?.value?.src) ||
    page.mode.isEditing;
  const screenLayerImage = screenLayer && hasImageOnly;

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      {/* Content Container */}
      <div className="relative w-full">
        <div className="container mx-auto px-4">
          <div
            className={clsx(
              'flex min-h-238 w-full py-10 lg:items-center',
              reverseLayout ? 'lg:mr-auto' : 'lg:ml-auto',
              withPlaceholder ? 'lg:w-full' : 'lg:w-1/2'
            )}
          >
            <div
              className={clsx(
                'w-full',
                withPlaceholder
                  ? 'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-10 xl:gap-14'
                  : 'max-w-182'
              )}
            >
              <div
                className={clsx(
                  screenLayerImage && 'relative isolate',
                  withPlaceholder && reverseLayout && 'lg:order-2'
                )}
              >
                {screenLayerImage && (
                  <div
                    aria-hidden
                    className="bg-background-accent pointer-events-none absolute inset-0 z-0 translate-x-[25px] translate-y-[25px]"
                  />
                )}
                <div
                  className={clsx(
                    { shim: screenLayer && !hasImageOnly },
                    screenLayerImage && 'relative z-10 bg-background p-[50px]',
                  )}
                >
                  {/* Title */}
                  <h1 className="text-center text-5xl leading-[110%] font-bold capitalize md:text-7xl md:leading-[130%] lg:text-left xl:text-[80px]">
                    <ContentSdkText field={fields.Title} />
                    {!hideAccentLine && <AccentLine className="mx-auto !h-5 w-[9ch] lg:mx-0" />}
                  </h1>

                  {/* Description */}
                  <div className="mt-7 text-xl md:text-2xl">
                    <ContentSdkRichText
                      field={fields.Description}
                      className="text-center lg:text-left"
                    />
                  </div>

                  {/* CTA Link */}
                  <div className="mt-6 flex w-full justify-center lg:justify-start">
                    <Link
                      field={fields.CtaLink}
                      className="arrow-btn arrow-btn-label-brand-black"
                    />
                  </div>
                </div>
              </div>

              {withPlaceholder && (
                <div
                  className={clsx(
                    'flex w-full flex-col justify-center',
                    reverseLayout && 'lg:order-1'
                  )}
                >
                  <Placeholder name={searchBarPlaceholderKey} rendering={rendering} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </HeroBannerCommon>
  );
};

export const TopContent = ({ params, fields, rendering }: HeroBannerProps) => {
  const { page } = useSitecore();
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const screenLayer = styles.includes(HeroBannerStyles.ScreenLayer);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;
  const hasImageOnly =
    (Boolean(fields.Image?.value?.src) && !fields.Video?.value?.src) ||
    page.mode.isEditing;
  const screenLayerImage = screenLayer && hasImageOnly;

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      {/* Content Container */}
      <div className="relative w-full">
        <div className="container mx-auto flex min-h-238 justify-center px-4">
          <div
            className={`flex flex-col items-center py-10 lg:py-44 ${reverseLayout ? 'justify-end' : 'justify-start'}`}
          >
            <div className={clsx(screenLayerImage && 'relative isolate')}>
              {screenLayerImage && (
                <div
                  aria-hidden
                  className="bg-background-accent pointer-events-none absolute inset-0 z-0 translate-x-[25px] translate-y-[25px]"
                />
              )}
              <div
                className={clsx(
                  { shim: screenLayer && !hasImageOnly },
                  screenLayerImage && 'relative z-10 bg-background p-[50px]',
                )}
              >
                {/* Title */}
                <h1 className="text-center text-5xl leading-[110%] font-bold capitalize md:text-7xl md:leading-[130%] xl:text-[80px]">
                  <ContentSdkText field={fields.Title} />
                  {!hideAccentLine && <AccentLine className="mx-auto !h-5 w-[9ch]" />}
                </h1>

                {/* Description */}
                <div className="mt-7 text-xl md:text-2xl">
                  <ContentSdkRichText field={fields.Description} className="text-center" />
                </div>

                {/* CTA Link or Placeholder */}
                <div className="mt-6 flex w-full justify-center">
                  {withPlaceholder ? (
                    <Placeholder name={searchBarPlaceholderKey} rendering={rendering} />
                  ) : (
                    <Link
                      field={fields.CtaLink}
                      className="arrow-btn arrow-btn-label-brand-black"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroBannerCommon>
  );
};
