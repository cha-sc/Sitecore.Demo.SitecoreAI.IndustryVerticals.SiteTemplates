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
  Title: Field<string>;
  Description: Field<string>;
  Image: ImageField;
  CtaLink: LinkField;
  SecondaryCtaLink: LinkField;
  Video: ImageField;
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
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const screenLayer = styles.includes(HeroBannerStyles.ScreenLayer);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      {/* Content Container */}
      <div className="relative w-full">
        <div className="container mx-auto px-4">
          <div
            className={`flex min-h-238 w-full py-10 lg:w-1/2 lg:items-center ${reverseLayout ? 'lg:mr-auto' : 'lg:ml-auto'}`}
          >
            <div className="max-w-182">
              <div className={clsx({ shim: screenLayer })}>
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

                {/* CTA Link or Placeholder */}
                <div className="mt-6 flex w-full justify-center lg:justify-start">
                  {withPlaceholder ? (
                    <Placeholder name={searchBarPlaceholderKey} rendering={rendering} />
                  ) : (
                    <Link field={fields.CtaLink} className="arrow-btn" />
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

export const TopContent = ({ params, fields, rendering }: HeroBannerProps) => {
  const styles = params.styles || '';
  const hideAccentLine = styles.includes(CommonStyles.HideAccentLine);
  const withPlaceholder = styles.includes(HeroBannerStyles.WithPlaceholder);
  const reverseLayout = styles.includes(LayoutStyles.Reversed);
  const screenLayer = styles.includes(HeroBannerStyles.ScreenLayer);
  const searchBarPlaceholderKey = `hero-banner-search-bar-${params.DynamicPlaceholderId}`;

  return (
    <HeroBannerCommon params={params} fields={fields} rendering={rendering}>
      {/* Content Container */}
      <div className="relative w-full">
        <div className="container mx-auto flex min-h-238 justify-center px-4">
          <div
            className={`flex flex-col items-center py-10 lg:py-44 ${reverseLayout ? 'justify-end' : 'justify-start'}`}
          >
            <div className={clsx({ shim: screenLayer })}>
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
                  <Link field={fields.CtaLink} className="arrow-btn" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HeroBannerCommon>
  );
};

type TwoColumnProps = {
  fields: Fields;
  params?: { [key: string]: string };
  rendering?: { uid?: string; params?: { [key: string]: string }; dataSource?: string };
};

export const TwoColumn = (
  props: TwoColumnProps = {
    fields: {
      Title: { value: '' },
      Description: { value: '' },
      Image: { value: { src: '', alt: '' } },
      CtaLink: { value: { href: '', text: '' } },
      SecondaryCtaLink: { value: { href: '', text: '' } },
      Video: { value: { src: '', alt: '' } },
    },
    params: {},
    rendering: {},
  }
) => {
  if (!props?.fields) return null;
  const styles = props?.params?.styles || '';

  return (
    <section className={`component two-column ${styles}`} id={props?.rendering?.uid || undefined}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start gap-8 py-10 md:flex-row md:items-center">
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              <ContentSdkText field={props.fields.Title} />
            </h1>
            <div className="mt-6 text-lg md:text-xl">
              <ContentSdkRichText field={props.fields.Description} />
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link field={props.fields.CtaLink} className="btn btn-primary" />
              <Link field={props.fields.SecondaryCtaLink} className="btn btn-secondary" />
            </div>
          </div>
          <div className="md:w-1/2">
            <ContentSdkImage field={props.fields.Image} className="w-full h-auto object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};