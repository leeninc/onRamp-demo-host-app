import axios from 'axios';
import { useCallback } from 'react';
import { hostAppBaseUrl } from '@/lib/leenRegion';

// The fields the picker reads from an item of GET /integrations/.
interface Integration {
  integration_id: string;
  name: string;
  logo_url: string;
  categories: string[];
}

interface IntegrationsPage {
  items: Integration[];
  total: number;
}

export interface BrandingOverride {
  logoUrl?: string;
  docsUrl?: string;
  vendorName?: string;
}

export interface VendorData {
  vendor: string;
  vendorName: string;
  logoUrl: string;
  tags: string[];
  // The real vendor to actually connect as (the tile can be a rebrand of it).
  connectAs?: string;
  brandingOverride?: BrandingOverride;
  // Passed through to onRamp for vendors that need a generated API key.
  generateApiKey?: boolean;
  // Paired flow (e.g. ProcessUnity): a second connection created right
  // after the first one succeeds. See HostApp.tsx for the chained mount.
  chainVendor?: string;
}

function useGetConnectors(
  setIsApiCallInProgress: (isApiCallInProgress: boolean) => void,
) {
  const baseUrl = hostAppBaseUrl();

  const getConnectors = useCallback(async (): Promise<VendorData[]> => {
    setIsApiCallInProgress(true);
    try {
      // The trailing slash is part of the route: without it the API answers
      // 307 to an http:// URL, which a browser blocks from an https page.
      // include_icon=false is sent explicitly because older deployments still
      // default to inlining every icon (~2 MB); the tiles only use logo_url.
      // limit=200 keeps the whole catalogue on one page (about 45 today).
      const response = await axios.get<IntegrationsPage>(
        `${baseUrl}/integrations/`,
        { params: { limit: 200, include_icon: false } },
      );
      const { items, total } = response.data;
      if (total > items.length) {
        console.warn(
          `GET /integrations/ returned ${items.length} of ${total} items; raise limit.`,
        );
      }
      // Transform API response to match VendorData structure
      const transformedData: VendorData[] = items.map(integration => ({
        vendor: integration.integration_id,
        vendorName: integration.name,
        logoUrl: integration.logo_url,
        tags: integration.categories,
      }));
      const sscIndex = transformedData.findIndex(
        (v) => v.vendor === 'SECURITY_SCORECARD',
      );
      const processunity = transformedData.find((v) => v.vendor === 'PROCESSUNITY');

      if (sscIndex !== -1 && processunity) {
        // Pattern B: paired sync. Leen itself pushes SSC data into
        // ProcessUnity on a schedule, but that requires TWO connections
        // wired together — see HostApp.tsx's chained-mount flow. Each leg
        // keeps its own real vendor branding inside the widget; the "Step
        // 1 of 2" / "Step 2 of 2" framing lives in HostApp's own chrome,
        // not the widget header.
        transformedData.splice(sscIndex + 1, 0, {
          vendor: 'securityscorecard_processunity',
          vendorName: 'SecurityScorecard – ProcessUnity',
          logoUrl: processunity.logoUrl,
          tags: transformedData[sscIndex].tags,
          connectAs: 'SECURITY_SCORECARD',
          chainVendor: 'PROCESSUNITY',
        });
      }

      return transformedData;
    } catch (err) {
      console.error('Error fetching connectors:', err);
      let errorMessage = 'An unknown error occurred while fetching connectors';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || err.message;
      }
      throw new Error(errorMessage);
    } finally {
      setIsApiCallInProgress(false);
    }
  }, [baseUrl, setIsApiCallInProgress]);

  return {
    getConnectors,
  };
}

export default useGetConnectors; 