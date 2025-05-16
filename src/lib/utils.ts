import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VendorDataResponse } from './VendorDataResponse';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
