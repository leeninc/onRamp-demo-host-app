import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { VendorDataResponse } from './VendorDataResponse';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const vendorsData: VendorDataResponse[] = [
  {
    vendor: 'SENTINELONE_VMS',
    vendorName: 'SentinelOne VMS',
    logoUrl: '/vendorIcons/SentinelOne.jpg',
    tag: 'VMS',
  },
  {
    vendor: 'TENABLE',
    vendorName: 'Tenable',
    logoUrl: '/vendorIcons/Tenable.jpg',
    tag: 'VMS',
  },
  {
    vendor: 'CROWDSTRIKE',
    vendorName: 'CrowdStrike',
    logoUrl: '/vendorIcons/CrowdStrike.jpg',
    tag: 'EDR',
  },
  {
    vendor: 'QUALYS',
    vendorName: 'Qualys',
    logoUrl: '/vendorIcons/Qualys.svg',
    tag: 'VMS',
  },
  {
    vendor: 'SEMGREP',
    vendorName: 'Semgrep',
    logoUrl: '/vendorIcons/Semgrep.jpg',
    tag: 'AppSec',
  },
  {
    vendor: 'SNYK',
    vendorName: 'Snyk',
    logoUrl: '/vendorIcons/Snyk.jpg',
    tag: 'AppSec',
  },
  {
    vendor: 'MS_DEFENDER_ENDPOINT',
    vendorName: 'MS Defender Endpoint',
    logoUrl: '/vendorIcons/MsDefender.png',
    tag: 'EDR',
  },
  {
    vendor: 'INSIGHTVM',
    vendorName: 'InsightVM',
    logoUrl: '/vendorIcons/InsightVM.jpg',
    tag: 'VMS',
  },
  {
    vendor: 'MS_DEFENDER_VMS',
    vendorName: 'MS Defender VMS',
    logoUrl: '/vendorIcons/MsDefender.png',
    tag: 'VMS',
  },
  {
    vendor: 'CROWDSTRIKE_SPOTLIGHT',
    vendorName: 'CrowdStrike VMS',
    logoUrl: '/vendorIcons/CrowdStrike.jpg',
    tag: 'VMS',
  },
  {
    vendor: 'SENTINELONE',
    vendorName: 'SentinelOne',
    logoUrl: '/vendorIcons/SentinelOne.jpg',
    tag: 'EDR',
  },
];
