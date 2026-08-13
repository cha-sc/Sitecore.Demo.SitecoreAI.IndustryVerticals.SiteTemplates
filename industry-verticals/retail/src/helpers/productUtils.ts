import { ReviewFields } from '@/types/review';
import { Field } from '@sitecore-content-sdk/nextjs';
import { IGQLField } from '@/types/igql';

/**
 * Calculates the average rating from a list of reviews
 * @param reviews - Array of review objects with rating fields
 * @returns Average rating rounded to 1 decimal places, or 0 if no reviews
 */
export const calculateAverageRating = (reviews: ReviewFields[]): number => {
  if (!reviews || reviews.length === 0) return 0;

  const totalRating = reviews.reduce((sum, review) => sum + (review.fields.Rating?.value || 0), 0);
  return parseFloat((totalRating / reviews.length).toFixed(1));
};

/**
 * Formats a price as a locale-aware currency string, e.g. "$4,000.00" for en/USD
 * or "4 000,00 €" for fr-FR/EUR. Symbol placement and separators follow the locale.
 * @param value - Raw price amount from the Sitecore field
 * @param locale - BCP 47 locale tag (e.g. 'en', 'fr-FR')
 * @param currency - ISO 4217 currency code (e.g. 'USD', 'EUR')
 * @returns Formatted price, or an empty string when the amount is not a number
 */
export const formatPrice = (
  value: number | string | undefined | null,
  locale: string,
  currency: string
): string => {
  const amount = typeof value === 'string' ? Number(value) : value;

  if (amount === null || amount === undefined || Number.isNaN(amount)) return '';

  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/**
 * Calculates the average rating from IGQL review format (used in ProductListing)
 * @param reviews - Array of IGQL review objects with rating fields
 * @returns Average rating rounded to 1 decimal places, or 0 if no reviews
 */
export const calculateAverageRatingFromIGQL = (
  reviews: Array<{ rating: IGQLField<Field<number>> }>
): number => {
  if (!reviews || reviews.length === 0) return 0;

  const totalRating = reviews.reduce(
    (sum, review) => sum + (review.rating?.jsonValue?.value || 0),
    0
  );
  return parseFloat((totalRating / reviews.length).toFixed(1));
};
