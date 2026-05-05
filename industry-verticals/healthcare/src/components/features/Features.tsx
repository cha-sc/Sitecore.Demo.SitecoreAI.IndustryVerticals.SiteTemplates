'use client';

import { IGQLField, IGQLImageField, IGQLRichTextField, IGQLTextField } from 'src/types/igql';
import {
  Text as ContentSdkText,
  RichText as ContentSdkRichText,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  useSitecore,
  withDatasourceCheck,
  ComponentRendering,
  ComponentParams,
  LinkField,
} from '@sitecore-content-sdk/nextjs';
import BlobAccent from '../../assets/shapes/BlobAccent';
import { FeatureStyles, CommonStyles } from '@/types/styleFlags';

interface Fields {
  data: {
    datasource: {
      children: {
        results: FeatureFields[];
      };
      title: IGQLTextField;
      description: IGQLRichTextField;
    };
  };
}

interface FeatureFields {
  id: string;
  featureTitle: IGQLTextField;
  featureDescription: IGQLTextField;
  featureImage: IGQLImageField;
  featureImageDark: IGQLImageField;
  featureLink?: IGQLField<LinkField>;
}

type FeaturesProps = {
  rendering: ComponentRendering & { params: ComponentParams };
  params: { [key: string]: string };
  fields: Fields;
};

const hasDarkContainerBackground = (styles: string | undefined) =>
  Boolean(
    styles &&
      (styles.includes('component-dark-background') || styles.includes('component-color-background'))
  );

const FeatureItem = ({
  feature,
  useAccentColor,
  layout = 'vertical',
}: {
  feature: FeatureFields;
  useAccentColor: boolean;
  layout: 'vertical' | 'horizontal';
}) => {
  const borderStyles = `border-2 rounded-lg ${
    useAccentColor ? 'border-accent' : 'border-foreground dark:border-foreground-dark'
  }`;

  return (
    <li
      key={feature?.id}
      className={`flex flex-col gap-6 ${
        layout === 'horizontal' ? 'lg:flex-row lg:items-center' : ''
      }`}
    >
      <div
        className={`flex h-20 w-20 shrink-0 items-center justify-center p-3 lg:h-26 lg:w-26 ${borderStyles}`}
      >
        <ContentSdkImage
          field={feature?.featureImage?.jsonValue}
          className={`h-full w-full object-contain ${!useAccentColor ? 'dark:hidden' : ''}`}
        />
        {!useAccentColor && (
          <ContentSdkImage
            field={feature?.featureImageDark?.jsonValue}
            className="hidden h-full w-full object-contain dark:block"
          />
        )}
      </div>
      <div>
        <h5>
          <ContentSdkText field={feature?.featureTitle?.jsonValue} />
        </h5>
        <p className="text-lg">
          <ContentSdkText field={feature?.featureDescription?.jsonValue} />
        </p>
      </div>
    </li>
  );
};

const SimpleFeatureItem = ({
  feature,
  onDarkContainer,
}: {
  feature: FeatureFields;
  onDarkContainer: boolean;
}) => {
  const toneClass = onDarkContainer
    ? 'text-background'
    : 'text-foreground dark:text-foreground-dark';

  const linkField = feature?.featureLink?.jsonValue;
  const linkClass = onDarkContainer
    ? `${toneClass} font-medium underline underline-offset-2 hover:opacity-90`
    : 'text-link font-medium underline-offset-2 hover:text-link-hover hover:underline';

  return (
    <li>
      <div
        className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 px-6 py-3 text-base lg:text-lg ${toneClass}`}
      >
        <span className="font-heading font-bold">
          <ContentSdkText tag="span" field={feature?.featureTitle?.jsonValue} />
        </span>
        <ContentSdkText tag="span" field={feature?.featureDescription?.jsonValue} />
        {linkField && (
          <ContentSdkLink field={linkField} className={linkClass}>
            {linkField?.value?.text}
          </ContentSdkLink>
        )}
      </div>
    </li>
  );
};

const DefaultFeatures = ({ fields, params }: FeaturesProps) => {
  const id = params?.RenderingIdentifier;
  const features = fields?.data?.datasource?.children?.results;
  const hideBlobAccent = params?.styles.includes(CommonStyles.HideBlobAccent);
  const useAccentColor = params?.styles.includes(FeatureStyles.UseAccentColor);

  return (
    <section className={`relative py-16 ${params?.styles}`} id={id || undefined}>
      {!hideBlobAccent && <BlobAccent className="absolute top-16 right-4 z-0" />}
      <div className="relative z-10 container">
        <div className="max-w-4xl">
          <h2>
            <ContentSdkText field={fields?.data?.datasource?.title?.jsonValue} />
          </h2>
          <ContentSdkRichText
            className="text-lg"
            field={fields?.data?.datasource?.description?.jsonValue}
          />
        </div>
        <ul className="mt-16 grid gap-12 lg:grid-cols-3">
          {features?.map((feature) => (
            <FeatureItem
              key={feature.id}
              feature={feature}
              useAccentColor={useAccentColor}
              layout="vertical"
            />
          ))}
        </ul>
      </div>
    </section>
  );
};

const SimpleFeatures = ({ fields, params }: FeaturesProps) => {
  const id = params?.RenderingIdentifier;
  const features = fields?.data?.datasource?.children?.results;
  const onDarkContainer = hasDarkContainerBackground(params?.styles);

  return (
    <div className={`relative ${params?.styles}`} id={id || undefined}>
      <ul className="grid gap-6">
        {features?.slice(0, 1).map((feature) => (
          <SimpleFeatureItem
            key={feature.id}
            feature={feature}
            onDarkContainer={onDarkContainer}
          />
        ))}
      </ul>
    </div>
  );
};

const newsCardShellClass =
  'group block w-full max-w-full overflow-hidden rounded-lg bg-[#f8f8f8] text-foreground no-underline transition-colors hover:bg-background-tertiary-dark hover:text-background';

const newsCardContentClass = 'p-6';

const NewsItem = ({ feature }: { feature: FeatureFields }) => {
  const { page } = useSitecore();
  const linkField = feature?.featureLink?.jsonValue;
  const imageField = feature?.featureImage?.jsonValue;
  const showFeatureImage =
    Boolean(imageField?.value?.src) || page.mode.isEditing;

  const titleBlock = (
    <div className="border-b border-background-tertiary-dark pb-3 transition-colors group-hover:border-[rgb(110,156,152)]">
      <ContentSdkText
        tag="span"
        className="font-heading text-xl font-bold"
        field={feature?.featureTitle?.jsonValue}
      />
    </div>
  );
  const descriptionBlock = (
    <div className="mt-4 text-base leading-relaxed">
      <ContentSdkText field={feature?.featureDescription?.jsonValue} />
    </div>
  );

  const cardBody = (
    <>
      {showFeatureImage && imageField && (
        <div className="relative w-full shrink-0">
          <ContentSdkImage
            field={imageField}
            className="aspect-video w-full object-cover"
          />
        </div>
      )}
      <div className={newsCardContentClass}>
        {titleBlock}
        {descriptionBlock}
      </div>
    </>
  );

  if (linkField?.value?.href) {
    return (
      <li className="min-w-0">
        <ContentSdkLink field={linkField} className={newsCardShellClass}>
          {cardBody}
        </ContentSdkLink>
      </li>
    );
  }

  return (
    <li className="min-w-0">
      <div
        className={`${newsCardShellClass} hover:bg-background-tertiary-dark hover:text-background cursor-default`}
      >
        {cardBody}
      </div>
    </li>
  );
};

const NewsGridLayout = ({ fields, params }: FeaturesProps) => {
  const id = params?.RenderingIdentifier;
  const newsFeatures = fields?.data?.datasource?.children?.results?.slice(0, 9) ?? [];
  const hideBlobAccent = params?.styles.includes(CommonStyles.HideBlobAccent);

  return (
    <section className={`relative py-16 ${params?.styles}`} id={id || undefined}>
      {!hideBlobAccent && <BlobAccent className="absolute top-16 right-4 z-0" />}
      <div className="relative z-10 container">
        <div className="max-w-4xl">
          <h2>
            <ContentSdkText field={fields?.data?.datasource?.title?.jsonValue} />
          </h2>
          <ContentSdkRichText
            className="text-lg"
            field={fields?.data?.datasource?.description?.jsonValue}
          />
        </div>

        <div className="mt-16 w-full min-w-0">
          {/* Small screens: single column, items 1–9 in order */}
          <ul className="flex w-full flex-col gap-2 lg:hidden">
            {newsFeatures.map((feature) => (
              <NewsItem key={feature.id} feature={feature} />
            ))}
          </ul>

          {/* lg+: three equal-width columns (minmax 0 1fr); flex stacks = no shared row heights */}
          <div className="hidden min-w-0 lg:grid lg:grid-cols-3 lg:gap-2">
            {[0, 1, 2].map((columnIndex) => (
              <ul key={columnIndex} className="flex min-h-0 min-w-0 flex-col gap-2">
                {newsFeatures.slice(columnIndex * 3, columnIndex * 3 + 3).map((feature) => (
                  <NewsItem key={feature.id} feature={feature} />
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default = withDatasourceCheck()<FeaturesProps>(DefaultFeatures);
export const Simple = withDatasourceCheck()<FeaturesProps>(SimpleFeatures);
export const NewsGrid = withDatasourceCheck()<FeaturesProps>(NewsGridLayout);
