import axios from 'axios';
import { useCallback } from 'react';

interface Connector {
  vendor: string;
  vendor_name: string;
  logo_url: string;
  category: string;
  // Add any other fields you expect from the API response
}

export interface VendorData {
  vendor: string;
  vendorName: string;
  logoUrl: string;
  tag: string;
  connectAs?: string;
  brandingOverride?: {
    logoUrl?: string;
    docsUrl?: string;
    vendorName?: string;
  };
  generate_api_key?: boolean;
}

function useGetConnectors(
  setIsApiCallInProgress: (isApiCallInProgress: boolean) => void,
) {
  const baseUrl = import.meta.env.VITE_REACT_APP_LEEN_BASE_URL;

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
      const servicenow = transformedData.find(v => v.vendor === 'SERVICENOW');
      const sscIndex = transformedData.findIndex(v => v.vendor === 'SECURITY_SCORECARD');
      if (sscIndex !== -1 && servicenow) {
        transformedData.splice(sscIndex + 1, 0, {
          vendor: 'securityscorecard_servicenow',
          vendorName: 'SecurityScoreCard - ServiceNow',
          logoUrl: servicenow.logoUrl,
          tag: transformedData[sscIndex].tag,
          connectAs: 'SECURITY_SCORECARD',
          brandingOverride: {
            logoUrl: servicenow.logoUrl,
            docsUrl: 'https://securityscorecard.com/',
            vendorName: 'SecurityScoreCard - ServiceNow',
          },
          generate_api_key: true,
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