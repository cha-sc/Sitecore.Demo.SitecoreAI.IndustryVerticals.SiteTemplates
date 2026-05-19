import { useState } from 'react';
import {
  Link,
  LinkField,
  RichText,
  RichTextField,
  Text,
  TextField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { Mail, Phone } from 'lucide-react';
import { ComponentProps } from '@/lib/component-props';
import { cn } from '@/shadcn/lib/utils';

const IPC_GREEN = '#008938';

type KnowledgeBaseTab = 'information' | 'documents';

interface Fields {
  Information: RichTextField;
  Documents?: RichTextField;
  ContactEmail?: LinkField;
  ContactPhone?: TextField;
  QuickLinks?: RichTextField;
}

export interface KnowledgeBaseProps extends ComponentProps {
  fields: Fields;
  className?: string;
}

const DEFAULT_QUICK_LINKS: { href: string; label: string }[] = [
  {
    href: '#sysco-midwest-order-recovery',
    label: 'Sysco Midwest Order Recovery Process for Franchisees',
  },
  { href: '#out-of-stock', label: 'Out-of-Stock Product Recoveries' },
  { href: '#will-call', label: 'Will Call Orders' },
  { href: '#cutoff-times', label: 'Sysco DC Recovery Cutoff Times for Franchisees' },
  {
    href: '#monitor-status',
    label: 'Monitor Recovery Status in SubVentory and Sysco Shop',
  },
  { href: '#escalations', label: 'Escalations' },
];

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
      className="border-b border-[#e5e7eb] bg-[#f3f5f4]"
      role="tablist"
      aria-label="Knowledge base sections"
    >
      <div className="flex">
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
                isActive
                  ? { boxShadow: `inset 0 -4px 0 0 ${IPC_GREEN}` }
                  : undefined
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

function ContactSidebar({
  contactEmail,
  contactPhone,
  quickLinks,
  isEditing,
}: {
  contactEmail?: LinkField;
  contactPhone?: TextField;
  quickLinks?: RichTextField;
  isEditing: boolean;
}) {
  const hasEmail = contactEmail?.value?.href || contactEmail?.value?.text;
  const hasPhone = contactPhone?.value;
  const hasQuickLinks = quickLinks?.value;

  return (
    <aside className="space-y-6">
      {(hasEmail || hasPhone || isEditing) && (
        <div className="space-y-2">
          {(hasEmail || isEditing) && (
            <div className="flex items-center gap-3 bg-[#f3f5f4] px-4 py-3">
              <Mail className="size-5 shrink-0 text-[#5b9bd5]" aria-hidden />
              <Link
                field={contactEmail}
                className="text-[#5b9bd5] hover:underline"
              />
            </div>
          )}
          {(hasPhone || isEditing) && (
            <div className="flex items-center gap-3 bg-[#f3f5f4] px-4 py-3">
              <Phone className="size-5 shrink-0 text-[#5b9bd5]" aria-hidden />
              {hasPhone ? (
                <a
                  href={`tel:${String(contactPhone?.value).replace(/\D/g, '')}`}
                  className="text-[#5b9bd5] hover:underline"
                >
                  <Text field={contactPhone} />
                </a>
              ) : (
                <span className="text-[#888888]">[Contact phone]</span>
              )}
            </div>
          )}
        </div>
      )}

      <nav
        className="border-l-4 border-[#5b9bd5] pl-4"
        aria-label="Quick links"
      >
        {hasQuickLinks || isEditing ? (
          <div
            className={cn(
              'ck-content space-y-2 text-sm leading-relaxed',
              '[&_a]:text-[#5b9bd5] [&_a]:no-underline [&_a:hover]:underline',
              '[&_ul]:list-none [&_ul]:space-y-2 [&_ul]:p-0',
              '[&_li]:leading-snug'
            )}
          >
            <RichText field={quickLinks} />
          </div>
        ) : (
          <ul className="space-y-2 text-sm leading-snug">
            {DEFAULT_QUICK_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="text-[#5b9bd5] hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}

export const Default = ({ params, fields, className }: KnowledgeBaseProps) => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const [activeTab, setActiveTab] = useState<KnowledgeBaseTab>('information');

  const { Information, Documents, ContactEmail, ContactPhone, QuickLinks } = fields || {};
  const activeContent = activeTab === 'information' ? Information : Documents;
  const showContent = activeContent?.value || isEditing;

  return (
    <section
      className={cn('mx-[20%] w-auto font-sans text-[#555555]', className)}
      id={params?.RenderingIdentifier}
    >
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-1 gap-10 bg-white py-8 lg:grid-cols-3 lg:gap-12">
        <div
          className="min-w-0 lg:col-span-2"
          role="tabpanel"
          id={`knowledge-base-panel-${activeTab}`}
          aria-labelledby={`knowledge-base-tab-${activeTab}`}
        >
          {showContent ? (
            <div
              className={cn(
                'ck-content text-[#555555]',
                '[&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-[#333333]',
                '[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#333333]',
                '[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#333333]',
                '[&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-[#555555]',
                '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:ps-6',
                '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:ps-6',
                '[&_a]:text-[#5b9bd5] [&_a]:underline [&_a:hover]:no-underline'
              )}
            >
              <RichText field={activeContent} />
            </div>
          ) : (
            <p className="text-[#888888]">
              {activeTab === 'information'
                ? 'No information content configured.'
                : 'No documents content configured.'}
            </p>
          )}
        </div>

        <div className="lg:col-span-1">
          <ContactSidebar
            contactEmail={ContactEmail}
            contactPhone={ContactPhone}
            quickLinks={QuickLinks}
            isEditing={isEditing}
          />
        </div>
      </div>
    </section>
  );
};
