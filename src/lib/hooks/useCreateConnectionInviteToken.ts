import axios from 'axios';

function useCreateConnection(
  setIsApiCallInProgress: (isApiCallInProgress: boolean) => void,
) {
  const baseURl = import.meta.env.VITE_REACT_APP_LEEN_BASE_URL;

  const createConnection = async (
    apiKey: string,
    organizationId: string | undefined,
    vendor: string | undefined,
  ) => {
    setIsApiCallInProgress(true);
    try {
      const response = await axios.post(
        `${baseURl}/provisioning/organizations/${organizationId}/connection-invite-tokens`,
        { vendor },
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
