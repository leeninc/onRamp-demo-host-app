import axios from 'axios';
import { useCallback } from 'react';
import { hostAppBaseUrl } from '@/lib/leenRegion';

interface Connector {
  vendor: string;
  vendor_name: string;
  logo_url: string;
  category: string;
  // Add any other fields you expect from the API response
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
  tag: string;
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
      const response = await axios.get<Connector[]>(
        `${baseUrl}/connectors`,
      );
      // Transform API response to match VendorData structure
      const transformedData: VendorData[] = response.data.map(connector => ({
        vendor: connector.vendor,
        vendorName: connector.vendor_name,
        logoUrl: connector.logo_url,
        tag: connector.category,
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
          tag: transformedData[sscIndex].tag,
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