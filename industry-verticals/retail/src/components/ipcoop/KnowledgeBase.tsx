import { useState } from 'react';
import {
  DateField,
  NextImage as ContentSdkImage,
  RichText,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { Calendar, Tag as TagIcon, User } from 'lucide-react';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/shadcn/lib/utils';
import type { ArticleFields } from '@/types/article';

const IPC_GREEN = '#008938';
const CONTENT_INSET = 'mx-[20%]';
const PANEL_BG = 'bg-[#f3f5f4]';

const RICH_TEXT_CLASS = cn(
  'ck-content text-[#555555]',
  '[&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#333333]',
  '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#333333]',
  '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#333333]',
  '[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-[#555555]',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:ps-6',
  '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:ps-6',
  '[&_a]:text-[#5b9bd5] [&_a]:underline [&_a:hover]:no-underline'
);

type KnowledgeBaseTab = 'information' | 'documents';

/** KnowledgeBasePage template fields (same shape as ArticlePage). */
export type KnowledgeBasePageFields = ArticleFields;

export interface KnowledgeBaseProps extends ComponentProps {
  fields: KnowledgeBasePageFields;
  className?: string;
}

function formatPublishedDate(date: Date | string): string | null {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().startsWith('0001-01-01')) {
    return null;
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function TabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: KnowledgeBaseTab;
  onTabChange: (tab: KnowledgeBaseTab) => void;
}) {
  const tabs: { id: KnowledgeBaseTab; label: string }[] = [
    { id: 'information', label: 'Information' },
    { id: 'documents', label: 'Documents' },
  ];

  return (
    <div
      className={cn('w-full border-b border-[#e5e7eb]', PANEL_BG)}
      role="tablist"
      aria-label="Knowledge base sections"
    >
      <div className={cn(CONTENT_INSET, 'flex')}>
        {tabs.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`knowledge-base-panel-${id}`}
              id={`knowledge-base-tab-${id}`}
              onClick={() => onTabChange(id)}
              className={cn(
                'px-6 py-4 text-base font-semibold transition-colors',
                isActive ? 'text-[#333333]' : 'text-[#888888] hover:text-[#555555]'
              )}
              style={
                isActive ? { boxShadow: `inset 0 -4px 0 0 ${IPC_GREEN}` } : undefined
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PageHeader({
  fields,
  isEditing,
  showTitle,
}: {
  fields: KnowledgeBasePageFields;
  isEditing: boolean;
  showTitle: boolean;
}) {
  const image = fields?.Image;
  const hasImageSrc = Boolean(image?.value?.src);
  const showHeroImage = hasImageSrc || (isEditing && image);

  if (!showTitle && !showHeroImage) {
    return null;
  }

  const titleContent = (
    <h1
      className={cn(
        'text-2xl font-bold lg:text-3xl',
        showHeroImage && hasImageSrc ? 'text-white' : 'text-[#333333]'
      )}
    >
      {fields?.Title ? (
        <Text field={fields.Title} />
      ) : (
        <span className={showHeroImage && hasImageSrc ? 'text-white/70' : 'text-[#888888]'}>
          [Title]
        </span>
      )}
    </h1>
  );

  if (showHeroImage && image) {
    return (
      <div className={cn('relative w-full', PANEL_BG)}>
        <div className="relative min-h-[220px] w-full overflow-hidden lg:min-h-[280px]">
          <ContentSdkImage
            field={image}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10"
            aria-hidden
          />
          {showTitle && (
            <div className={cn('absolute inset-x-0 bottom-0', CONTENT_INSET, 'py-8')}>
              {titleContent}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!showTitle) {
    return null;
  }

  return (
    <div className={cn('w-full', PANEL_BG)}>
      <div className={cn(CONTENT_INSET, 'py-8 pb-4')}>{titleContent}</div>
    </div>
  );
}

function InformationPanel({
  fields,
  isEditing,
}: {
  fields: KnowledgeBasePageFields;
  isEditing: boolean;
}) {
  const { ShortDescription, Content } = fields || {};
  const showShortDescription = ShortDescription?.value || isEditing;
  const showContent = Content?.value || isEditing;

  if (!showShortDescription && !showContent) {
    return <p className="text-[#888888]">No information content configured.</p>;
  }

  return (
    <div className="space-y-6">
      {showShortDescription && ShortDescription && (
        <div className="text-lg leading-relaxed text-[#555555]">
          <Text field={ShortDescription} tag="p" />
        </div>
      )}
      {showContent && Content && (
        <div className={RICH_TEXT_CLASS}>
          <RichText field={Content} />
        </div>
      )}
    </div>
  );
}

function ContactSidebar({
  fields,
  isEditing,
}: {
  fields: KnowledgeBasePageFields;
  isEditing: boolean;
}) {
  const { Author, PublishedDate, Tags, Category } = fields || {};
  const authorName = Author?.fields?.AuthorName;
  const category = Category?.fields?.Category;
  const publishedDateValue = PublishedDate?.value;
  const hasValidDate =
    publishedDateValue && !String(publishedDateValue).startsWith('0001-01-01');
  const tags = Tags ?? [];

  const showAuthor = authorName?.value || isEditing;
  const showDate = hasValidDate || isEditing;
  const showCategory = category?.value || isEditing;
  const showTags = tags.length > 0 || isEditing;

  if (!showAuthor && !showDate && !showCategory && !showTags) {
    return null;
  }

  return (
    <aside className="space-y-6">
      {(showAuthor || showDate || showCategory) && (
        <div className="space-y-3 text-sm text-[#555555]">
          {showAuthor && (
            <div className="flex items-center gap-3 bg-[#f3f5f4] px-4 py-3">
              <User className="size-5 shrink-0 text-[#5b9bd5]" aria-hidden />
              {authorName?.value ? (
                <Text field={authorName} tag="span" className="font-medium text-[#333333]" />
              ) : (
                <span className="text-[#888888]">[Author]</span>
              )}
            </div>
          )}
          {showDate && (
            <div className="flex items-center gap-3 bg-[#f3f5f4] px-4 py-3">
              <Calendar className="size-5 shrink-0 text-[#5b9bd5]" aria-hidden />
              {hasValidDate && PublishedDate ? (
                <DateField
                  field={PublishedDate}
                  tag="span"
                  className="font-medium text-[#333333]"
                  render={(date) => formatPublishedDate(date ?? '') ?? ''}
                />
              ) : (
                <span className="text-[#888888]">[Published date]</span>
              )}
            </div>
          )}
          {showCategory && (
            <div className="flex items-center gap-3 bg-[#f3f5f4] px-4 py-3">
              <span className="text-xs font-semibold tracking-wide text-[#888888] uppercase">
                Category
              </span>
              {category?.value ? (
                <Text
                  field={category}
                  tag="span"
                  className="rounded border border-[#008938] bg-[#f4fbf6] px-2 py-0.5 text-sm font-medium text-[#008938]"
                />
              ) : (
                <span className="text-[#888888]">[Category]</span>
              )}
            </div>
          )}
        </div>
      )}

      {showTags && (
        <div className="border-l-4 border-[#5b9bd5] pl-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#333333]">
            <TagIcon className="size-4 text-[#5b9bd5]" aria-hidden />
            Tags
          </div>
          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded bg-[#f3f5f4] px-2.5 py-1 text-sm text-[#555555]"
                >
                  <Text field={tag.fields?.Tag} tag="span" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#888888]">[Tags]</p>
          )}
        </div>
      )}
    </aside>
  );
}

export const Default = ({ params, fields, className }: KnowledgeBaseProps) => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const [activeTab, setActiveTab] = useState<KnowledgeBaseTab>('information');

  if (!fields?.Title && !isEditing) {
    return <></>;
  }

  const showTitle = Boolean(fields?.Title?.value) || isEditing;

  return (
    <section
      className={cn('w-full font-sans text-[#555555]', className)}
      id={params?.RenderingIdentifier}
    >
      <PageHeader fields={fields} isEditing={isEditing} showTitle={showTitle} />

      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div
        className={cn(
          CONTENT_INSET,
          'grid grid-cols-1 gap-10 bg-white py-8 lg:grid-cols-3 lg:gap-12'
        )}
      >
        <div
          className="min-w-0 lg:col-span-2"
          role="tabpanel"
          id={`knowledge-base-panel-${activeTab}`}
          aria-labelledby={`knowledge-base-tab-${activeTab}`}
        >
          {activeTab === 'information' ? (
            <InformationPanel fields={fields} isEditing={isEditing} />
          ) : (
            <p className="text-[#888888]">No documents content configured.</p>
          )}
        </div>

        <div className="lg:col-span-1">
          <ContactSidebar fields={fields} isEditing={isEditing} />
        </div>
      </div>
    </section>
  );
};
