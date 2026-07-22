import axios from 'axios';

function useCreateConnection(
  setIsApiCallInProgress: (isApiCallInProgress: boolean) => void,
) {
  const baseURl = import.meta.env.VITE_REACT_APP_LEEN_BASE_URL;

  const createConnection = async (
    apiKey: string,
    organizationId: string | undefined,
    vendor: string | undefined,
    // Server-side-only pairing, e.g. { connection_id: "<ssc connection id>" }
    // for ProcessUnity. Never accept this from a step the end user controls.
    options?: Record<string, unknown>,
  ) => {
    setIsApiCallInProgress(true);
    try {
      const response = await axios.post(
        `${baseURl}/provisioning/organizations/${organizationId}/connection-invite-tokens`,
        { vendor, ...(options && { options }) },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        },
      );
      return {
        data: response.data,
      };
    } catch (err) {
      console.log(err);
      let errorMessage = 'An unknown error occurred';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || err.message;
      }
      throw new Error(errorMessage);
    } finally {
      setIsApiCallInProgress(false);
    }
  };

  return {
    createConnection,
  };
}

export default useCreateConnection;
