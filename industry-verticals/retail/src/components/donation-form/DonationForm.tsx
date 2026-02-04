'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Frequency = 'monthly' | 'one-time';
type AmountOption = '50' | '100' | '150' | 'custom';

const FREQUENCY_MESSAGES: Record<Frequency, string> = {
  monthly:
    'Make a lasting impact. Fund life-saving research breakthroughs year-round.',
  'one-time': 'Accelerate vital research with a one-time gift.',
};

const AMOUNT_OPTIONS: { value: AmountOption; label: string; matched: string }[] = [
  { value: '50', label: '$50', matched: '$150' },
  { value: '100', label: '$100', matched: '$300' },
  { value: '150', label: '$150', matched: '$450' },
  { value: 'custom', label: 'My choice', matched: 'X3' },
];

const OPTION_BASE =
  'flex cursor-pointer rounded-lg border-2 border-white bg-black px-4 py-2.5 text-sm font-bold text-white transition-colors';
const OPTION_SELECTED = 'has-[:checked]:bg-white has-[:checked]:text-black';

const AMOUNT_OPTION_BASE =
  'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-white bg-black py-4 text-white transition-colors';
const AMOUNT_OPTION_SELECTED = 'has-[:checked]:bg-white has-[:checked]:text-black';

/**
 * Donation form component with frequency and amount selection.
 * CTA redirects to /donate. Presentational only; not a functioning form.
 */
export function DonationForm() {
  const [frequency, setFrequency] = useState<Frequency>('one-time');

  return (
    <section className="bg-neutral-950 px-6 py-10 text-white md:px-10 md:py-14">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <h2 className="mb-8 text-2xl leading-tight font-bold md:text-3xl">
          Donations TRIPLED! Fund more breakthroughs.
        </h2>

        {/* Frequency */}
        <div className="relative mb-6">
          <div className="flex gap-3" role="radiogroup" aria-label="Donation frequency">
            <label className={`${OPTION_BASE} ${OPTION_SELECTED}`}>
              <input
                type="radio"
                name="donation-frequency"
                value="monthly"
                className="sr-only"
                checked={frequency === 'monthly'}
                onChange={() => setFrequency('monthly')}
              />
              <span className="flex items-center gap-2">
                <Heart className="size-4 fill-red-500 text-red-500" strokeWidth={2} />
                Monthly
              </span>
            </label>
            <label className={`${OPTION_BASE} ${OPTION_SELECTED}`}>
              <input
                type="radio"
                name="donation-frequency"
                value="one-time"
                className="sr-only"
                checked={frequency === 'one-time'}
                onChange={() => setFrequency('one-time')}
              />
              One-time
            </label>
          </div>
          {/* Contextual message with speech bubble pointer (points to selected option) */}
          <div className="relative mt-3">
            <div
              className={`absolute -top-2 h-0 w-0 border-8 border-transparent border-b-rose-200 ${
                frequency === 'monthly' ? 'left-8' : 'right-8'
              }`}
              aria-hidden
            />
            <div className="rounded-lg bg-rose-200 px-4 py-3 text-sm text-white">
              {FREQUENCY_MESSAGES[frequency]}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="mb-8">
          <h3 id="donation-amount-label" className="mb-3 text-lg font-bold">
            Amount
          </h3>
          <div
            className="grid grid-cols-2 gap-3"
            role="radiogroup"
            aria-labelledby="donation-amount-label"
          >
            {AMOUNT_OPTIONS.map((opt) => (
              <label key={opt.value} className={`${AMOUNT_OPTION_BASE} ${AMOUNT_OPTION_SELECTED}`}>
                <input
                  type="radio"
                  name="donation-amount"
                  value={opt.value}
                  className="sr-only"
                  defaultChecked={opt.value === '100'}
                />
                <span className="text-lg font-bold">{opt.label}</span>
                <span className="text-xs">Matched = {opt.matched}</span>
              </label>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/donate"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-red-700"
        >
          <Heart className="size-5 fill-white text-white" strokeWidth={2} />
          Donate now
        </Link>
      </div>
    </section>
  );
}

