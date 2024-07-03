import { vendorsData } from '@/lib/utils';
import { SetStateAction, useState } from 'react';
import { Button } from '@/components/ui/button';
import useCreateConnection from '@/lib/hooks/useCreateConnectionInviteToken';
import { LeenOnRamp, LeenOnRampResponse } from '@leendev/onramp';
import { Loader2, SearchIcon } from 'lucide-react';
import { toast } from './ui/use-toast';
import { Toaster } from './ui/toaster';

const HostApp = () => {
  const orgId = import.meta.env.VITE_REACT_APP_ORG_ID;
  const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

  const [selectedVendorName, setSelectedVendorName] = useState<
    string | undefined
  >(undefined);
  const [isApiCallInProgress, setIsApiCallInProgress] =
    useState<boolean>(false);
  const [showLeenOnRamp, setShowLeenOnRamp] = useState<boolean>(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [leenOnRampResponse, setLeenOnRampResponse] = useState<
    LeenOnRampResponse | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const { createConnection } = useCreateConnection(setIsApiCallInProgress);

  const handleSearchChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setSearchTerm(event.target.value);
    setSelectedTag('ALL');
  };

  const filteredData = vendorsData.filter((vendor) =>
    vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleTagSelect = (tag: string) => {
    setSearchTerm('');
    setSelectedTag((prevSelectedTag: string) => {
      if (prevSelectedTag === tag) {
        return 'ALL';
      } else {
        return tag;
      }
    });
    setSelectedVendorName(undefined);
  };

  const filteredByTagsData =
    selectedTag === 'ALL'
      ? filteredData
      : vendorsData.filter((vendor) => vendor.tag === selectedTag);
  const handleIconClick = (vendor: string): void => {
    setSelectedVendorName(vendor);
  };

  const handleConnect = () => {
    setToken(undefined);
    createConnection(apiKey, orgId, selectedVendorName)
      .then((response) => {
        setToken(response?.data.token);
        setShowLeenOnRamp(true);
      })
      .catch((error) => {
        setShowLeenOnRamp(false);
        toast({
          title: error.message,
          variant: 'destructive',
          description: 'Please try again!',
        });
      });
  };

  const onBack = () => {
    setLeenOnRampResponse(undefined);
    setSelectedVendorName(undefined);
    setToken(undefined);
  };

  return (
    <div className="flex flex-col justify-center">
      <Toaster />
      {!leenOnRampResponse && (
        <div>
          <div className="flex justify-center items-center mt-8 mb-4">
            <div className="relative w-[400px]">
              <SearchIcon className="w-5 h-5 text-gray-900 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full bg-gray-100"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="flex justify-center mb-16 space-x-6">
            <button
              key={'ALL'}
              onClick={() => handleTagSelect('ALL')}
              className={`rounded-xl px-4 py-2 ${
                selectedTag === 'ALL'
                  ? 'border-2 border-transparent bg-[#444] text-white'
                  : 'border-2 border-[#444] text-black'
              } hover:bg-[#444] hover:text-white`}
            >
              ALL
            </button>
            {Array.from(
              new Set(vendorsData.flatMap((vendor) => vendor.tag)),
            ).map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`rounded-xl px-4 py-2 ${
                  selectedTag === tag
                    ? 'border-2 border-transparent bg-[#444] text-white'
                    : 'border-2 border-[#444] text-black'
                } hover:bg-[#444] hover:text-white`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto scroll-smooth w-[800px] h-[535px] bg-white rounded-md">
            <div className="grid grid-cols-4">
              {filteredByTagsData.map((vendor) => (
                <button
                  key={vendor.vendor}
                  onClick={() => handleIconClick(vendor.vendor)}
                  className={`relative cursor-pointer text-center p-6 hover:border-[#B5FF56] transition-shadow duration-300 ${
                    selectedVendorName === vendor.vendor
                      ? 'border-4 border-[#B5FF56]'
                      : 'border-4 border-transparent'
                  }`}
                >
                  <div className="flex flex-col items-center pt-2">
                    <img
                      className="rounded-xl h-20 w-20 "
                      src={vendor.logoUrl}
                      alt={vendor.vendor}
                    />
                  </div>
                  <div className="mt-2 text-sm">{vendor.vendorName}</div>
                </button>
              ))}
            </div>
            {filteredByTagsData.length === 0 && (
              <div className="text-center text-xl font-semibold">
                Vendor not found!
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <Button
              className="bg-[#B5FF56] text-black hover:bg-[#78a43e] min-w-[88px] mt-12"
              variant={selectedVendorName ? 'default' : 'outline'}
              disabled={!selectedVendorName}
              onClick={handleConnect}
            >
              {isApiCallInProgress ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </div>
      )}
      {showLeenOnRamp && token !== undefined && (
        <LeenOnRamp
          token={token}
          setShowLeenOnRamp={setShowLeenOnRamp}
          setLeenOnRampResponse={setLeenOnRampResponse}
          bundleVersion="dev"
        />
      )}
      {leenOnRampResponse && (
        <div className="flex flex-col">
          <div className="text-xl font-semibold mb-4">Response From Leen</div>
          <pre className="mt-2 rounded-md bg-slate-950 p-4 text-[#B5FF56]">
            <code>{JSON.stringify(leenOnRampResponse, null, 2)}</code>
          </pre>
          <Button className="mt-8 ml-auto" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
};

export default HostApp;
