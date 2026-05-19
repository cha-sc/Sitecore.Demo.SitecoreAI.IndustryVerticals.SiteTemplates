import type { ComponentType } from 'react';
import { Building2, Info, Search, SlidersHorizontal, Store, Users } from 'lucide-react';
import { cn } from '@/shadcn/lib/utils';
import { FRANCHISE_OWNER_STORES } from './performance-overview.mock';
import type { StoreAddress, StorePerformanceRecord, TaxIdStatus } from './performance-overview.types';

const IPC_GREEN = '#005a32';
const IPC_GREEN_LIGHT = '#e8f3ec';

export interface PerformanceOverviewProps {
  stores?: StorePerformanceRecord[];
  fiscalYear?: number;
  className?: string;
}

function formatCurrency(amount: number): string {
  return `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function sumYearToDateDividends(stores: StorePerformanceRecord[]): number {
  return stores.reduce((total, store) => total + store.yearToDateDividends, 0);
}

function formatAddressLines(address: StoreAddress): string[] {
  const lines = [address.line1];
  if (address.line2) {
    lines.push(address.line2);
  }
  lines.push(`${address.city}, ${address.state} ${address.zip}`);
  return lines;
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: 'success' | 'warning';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium',
        variant === 'success' && 'border-[#008938] bg-[#f4fbf6] text-[#008938]',
        variant === 'warning' && 'border-[#e8b4b4] bg-[#fdf0f0] text-[#c53030]'
      )}
    >
      {label}
    </span>
  );
}

function taxIdBadgeVariant(status: TaxIdStatus): 'success' | 'warning' {
  return status === 'On File' ? 'success' : 'warning';
}

function TabButton({
  label,
  icon: Icon,
  active = false,
  outlined = false,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  outlined?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded px-4 py-3 text-sm font-semibold transition-colors',
        active && 'text-white',
        outlined && !active && 'border bg-white text-[#008938]',
        !active && !outlined && 'bg-background-muted text-[#888888]'
      )}
      style={
        active
          ? { backgroundColor: IPC_GREEN }
          : outlined
            ? { borderColor: '#008938' }
            : undefined
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  );
}

function AnnualDividendsCard({
  fiscalYear,
  annualTotal,
}: {
  fiscalYear: number;
  annualTotal: number;
}) {
  return (
    <aside
      className="shrink-0 rounded-lg p-6 lg:w-64 xl:w-72"
      style={{ backgroundColor: IPC_GREEN_LIGHT }}
    >
      <h2 className="text-base font-semibold text-[#333333]">Annual Dividends</h2>
      <p className="mt-1 text-sm text-[#666666]">Fiscal Year {fiscalYear}</p>
      <p className="mt-4 text-2xl font-bold leading-tight text-[#008938] lg:text-3xl">
        {formatCurrency(annualTotal)} (USD)*
      </p>
      <p className="mt-6 text-xs leading-relaxed text-[#666666]">
        *Based on qualifying purchases from your distribution center
      </p>
    </aside>
  );
}

function StoreCell({ store }: { store: StorePerformanceRecord }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-[#333333]">{store.storeNumber}</span>
        <StatusBadge label={store.storeStatus} variant="success" />
      </div>
      <div className="mt-2 space-y-0.5 text-xs leading-relaxed text-[#888888]">
        {formatAddressLines(store.address).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </>
  );
}

function RestaurantsTable({ stores }: { stores: StorePerformanceRecord[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-[#e5e7eb] bg-[#f8f9f8]">
          <th className="px-4 py-3 text-left font-semibold text-[#333333]">Restaurant</th>
          <th className="px-4 py-3 text-left font-semibold text-[#333333]">
            Dividend Payment (USD)
          </th>
          <th className="px-4 py-3 text-left font-semibold text-[#333333]">Franchise Agreement</th>
          <th className="px-4 py-3 text-left font-semibold text-[#333333]">
            <span className="inline-flex items-center gap-1">
              Tax ID
              <Info className="size-3.5 text-[#888888]" aria-hidden />
            </span>
          </th>
          <th className="px-4 py-3" aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {stores.map((store) => (
          <tr key={store.storeNumber} className="border-b border-[#e5e7eb] align-top">
            <td className="px-4 py-5">
              <StoreCell store={store} />
            </td>
            <td className="px-4 py-5">
              <p className="font-semibold text-[#333333]">
                {formatCurrency(store.dividendPayment.amount)}
              </p>
              <p className="mt-1 text-xs text-[#888888]">{store.dividendPayment.date}</p>
            </td>
            <td className="px-4 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#333333]">
                  {store.franchiseAgreement.agreementNumber}
                </span>
                <StatusBadge label={store.franchiseAgreement.status} variant="success" />
              </div>
              <p className="mt-1 text-xs text-[#888888]">{store.franchiseAgreement.signerName}</p>
            </td>
            <td className="px-4 py-5">
              <StatusBadge
                label={store.taxIdStatus}
                variant={taxIdBadgeVariant(store.taxIdStatus)}
              />
            </td>
            <td className="px-4 py-5 text-right">
              <button
                type="button"
                className="rounded border border-[#cccccc] bg-white px-4 py-1.5 text-sm font-medium text-[#555555] hover:bg-[#f8f9f8]"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PerformanceOverview({
  stores = FRANCHISE_OWNER_STORES,
  fiscalYear = 2025,
  className,
}: PerformanceOverviewProps) {
  const annualDividends = sumYearToDateDividends(stores);

  return (
    <section className={cn('w-full font-sans text-[#555555]', className)}>
      <nav className="flex flex-wrap gap-2" aria-label="Membership sections">
        <TabButton label="Overview" icon={Store} active />
        <TabButton label="Restaurants" icon={Store} outlined />
        <TabButton label="Team Members" icon={Users} />
        <TabButton label="Corporations" icon={Building2} />
      </nav>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <AnnualDividendsCard fiscalYear={fiscalYear} annualTotal={annualDividends} />

        <div className="min-w-0 flex-1">
          <div className="space-y-4 text-sm leading-relaxed text-[#666666]">
            <p>
              The information displayed on this page is provided by Doctor&apos;s Associates, LLC
              and relates to your Subway® restaurants. Dividend and franchise agreement details are
              updated periodically based on reports received from the franchisor.
            </p>
            <p>
              If you are missing documents or believe any information is incorrect, please contact
              your IPC representative or email{' '}
              <a
                href="mailto:support@ipc.org"
                className="text-[#008938] underline hover:no-underline"
              >
                support@ipc.org
              </a>{' '}
              for assistance.
            </p>
          </div>

          <header className="mt-8 flex items-center gap-2">
            <Store className="size-5 text-[#333333]" aria-hidden />
            <h3 className="text-lg font-semibold text-[#333333]">Restaurants</h3>
          </header>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#888888]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded border border-[#cccccc] bg-white py-2.5 pr-4 pl-10 text-sm text-[#333333] placeholder:text-[#aaaaaa] focus:border-[#008938] focus:ring-1 focus:ring-[#008938] focus:outline-none"
                readOnly
                aria-label="Search restaurants"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded border border-[#cccccc] bg-white px-4 py-2.5 text-sm font-medium text-[#555555] hover:bg-[#f8f9f8]"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Filters
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-[#e5e7eb] bg-white">
            <RestaurantsTable stores={stores} />
          </div>
        </div>
      </div>
    </section>
  );
}

export { FRANCHISE_OWNER_STORES, STORE_MANAGER_STORES } from './performance-overview.mock';
export type { StorePerformanceRecord } from './performance-overview.types';
