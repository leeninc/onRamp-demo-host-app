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