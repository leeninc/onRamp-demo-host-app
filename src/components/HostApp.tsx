import { SetStateAction, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import useCreateConnection from '@/lib/hooks/useCreateConnectionInviteToken';
import useGetConnectors, { VendorData } from '@/lib/hooks/useGetConnectors';
import { LeenOnRamp, LeenOnRampResponse } from '@leendev/onramp';
import { CheckCircle2, Loader2, SearchIcon } from 'lucide-react';
import { toast } from './ui/use-toast';
import { Toaster } from './ui/toaster';
import '@/types/onramp-augment.d.ts';

const HostApp = () => {
  const orgId = import.meta.env.VITE_REACT_APP_ORG_ID;
  const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

  const [dynamicVendorsData, setDynamicVendorsData] = useState<VendorData[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(true);
  const [vendorsError, setVendorsError] = useState<string | null>(null);

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
  const { getConnectors } = useGetConnectors(setIsApiCallInProgress);

  // Pattern B (ProcessUnity) chained-flow state: two connections, created
  // back to back, presented to the user as one continuous setup.
  const [activeLeg, setActiveLeg] = useState<'first' | 'second'>('first');
  const [firstLegResponse, setFirstLegResponse] = useState<
    LeenOnRampResponse | undefined
  >(undefined);
  const [showTransition, setShowTransition] = useState(false);

  const selectedVendor = useMemo(
    () => dynamicVendorsData.find((v) => v.vendor === selectedVendorName),
    [dynamicVendorsData, selectedVendorName],
  );
  const isChainedFlow = !!selectedVendor?.chainVendor;

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setVendorsLoading(true);
        const data = await getConnectors();
        setDynamicVendorsData(data);
        setVendorsError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vendors';
        setVendorsError(errorMessage);
        toast({
          title: 'Error fetching vendor data',
          variant: 'destructive',
          description: errorMessage,
        });
      } finally {
        setVendorsLoading(false);
      }
    };
    fetchVendors();
  }, [getConnectors]);

  const handleSearchChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setSearchTerm(event.target.value);
    setSelectedTag('ALL');
  };

  const filteredData = dynamicVendorsData.filter((vendor) =>
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
      : dynamicVendorsData.filter((vendor) => vendor.tag === selectedTag);
  const handleIconClick = (vendor: string): void => {
    setSelectedVendorName(vendor);
  };

  const startFirstLeg = () => {
    setToken(undefined);
    setActiveLeg('first');
    const vendorToConnect = selectedVendor?.connectAs ?? selectedVendorName;
    createConnection(apiKey, orgId, vendorToConnect)
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

  const startSecondLeg = (pairedConnectionId: string) => {
    if (!selectedVendor?.chainVendor) return;
    setToken(undefined);
    setActiveLeg('second');
    // The pairing (options.connection_id) is set server-side, at invite-token
    // creation time — it's never something the end user sees or enters.
    createConnection(apiKey, orgId, selectedVendor.chainVendor, {
      connection_id: pairedConnectionId,
    })
      .then((response) => {
        setToken(response?.data.token);
        setShowLeenOnRamp(true);
      })
      .catch((error) => {
        toast({
          title: error.message,
          variant: 'destructive',
          description: 'Please try again!',
        });
      });
  };

  const handleConnect = () => {
    setFirstLegResponse(undefined);
    setShowTransition(false);
    startFirstLeg();
  };

  // Passed to <LeenOnRamp> as setLeenOnRampResponse. For a chained flow's
  // first leg, this intercepts the "done" signal and routes to the
  // transition screen instead of the final result screen.
  const handleLegResponse = (response: LeenOnRampResponse | undefined) => {
    if (!response) return;
    if (isChainedFlow && activeLeg === 'first') {
      setFirstLegResponse(response);
      setShowLeenOnRamp(false);
      setShowTransition(true);
      return;
    }
    // Otherwise this is the final leg — leave the widget open so its own
    // success screen (with copyable credentials) is shown first. The user
    // closing that screen triggers setShowLeenOnRamp(false), which reveals
    // this full response summary underneath.
    setLeenOnRampResponse(response);
  };

  const handleContinueToSecondLeg = () => {
    if (!firstLegResponse) return;
    setShowTransition(false);
    startSecondLeg(firstLegResponse.data.id);
  };

  const onBack = () => {
    setLeenOnRampResponse(undefined);
    setSelectedVendorName(undefined);
    setToken(undefined);
    setActiveLeg('first');
    setFirstLegResponse(undefined);
    setShowTransition(false);
  };

  const stepLabel = isChainedFlow
    ? activeLeg === 'first'
      ? 'Step 1 of 2 — Connect SecurityScorecard'
      : 'Step 2 of 2 — Connect ProcessUnity'
    : undefined;

  return (
    <div className="flex flex-col justify-center">
      <Toaster />
      {!leenOnRampResponse && !showTransition && (
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
              new Set(dynamicVendorsData.flatMap((vendor) => vendor.tag)),
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
              {vendorsLoading && (
                <div className="col-span-4 flex justify-center items-center h-full">
                  <Loader2 className="animate-spin text-gray-500" size={48} />
                </div>
              )}
              {vendorsError && (
                <div className="col-span-4 flex justify-center items-center h-full text-red-500">
                  Error: {vendorsError}
                </div>
              )}
              {!vendorsLoading && !vendorsError && filteredByTagsData.map((vendor) => (
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
                  <div className="mt-2 text-sm">{vendor.brandingOverride?.vendorName ?? vendor.vendorName}</div>
                </button>
              ))}
            </div>
            { !vendorsLoading && !vendorsError && filteredByTagsData.length === 0 && (
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

      {stepLabel && (showLeenOnRamp || showTransition) && (
        <div className="flex justify-center mb-4">
          <span className="rounded-full bg-[#2A004E] text-[#B5FF56] text-xs font-semibold px-4 py-1.5 tracking-wide">
            {stepLabel}
          </span>
        </div>
      )}

      {showTransition && (
        <div className="flex flex-col items-center gap-3 w-[480px] mx-auto py-16">
          <CheckCircle2 className="text-green-500" size={40} />
          <div className="text-lg font-semibold text-center">
            SecurityScorecard connected
          </div>
          <div className="text-sm text-gray-600 text-center max-w-[380px]">
            Connection{' '}
            <code className="bg-gray-100 px-1 rounded text-xs">
              {firstLegResponse?.data.id}
            </code>{' '}
            is live. Now let's link it to your ProcessUnity instance so Leen
            can start syncing.
          </div>
          <Button
            className="bg-[#B5FF56] text-black hover:bg-[#78a43e] mt-4"
            onClick={handleContinueToSecondLeg}
          >
            {isApiCallInProgress ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Continue to ProcessUnity'
            )}
          </Button>
        </div>
      )}

      {showLeenOnRamp && token !== undefined && (
        <LeenOnRamp
          token={token}
          setShowLeenOnRamp={setShowLeenOnRamp}
          setLeenOnRampResponse={handleLegResponse}
          bundleVersion="dev"
          darkMode={true}
          // bundleVersion="0.0.19"
          darkModeColor={{
            primary: '#2A004E',
            secondary: '#500073',
            border: '#500073',
          }}
          {...(selectedVendor?.brandingOverride?.logoUrl && {
            logoUrl: selectedVendor.brandingOverride.logoUrl,
          })}
          {...(selectedVendor?.brandingOverride?.docsUrl && {
            docsUrlOverrides: {
              [selectedVendor.connectAs ?? selectedVendorName ?? '']:
                selectedVendor.brandingOverride.docsUrl,
            },
          })}
          {...(selectedVendor?.brandingOverride?.vendorName && {
            vendorName: selectedVendor.brandingOverride.vendorName,
          })}
          {...(selectedVendor?.generateApiKey && { generateApiKey: true })}
        />
      )}

      {leenOnRampResponse && (
        <div className="flex flex-col w-[520px]">
          <div className="text-xl font-semibold mb-4">Response From Leen</div>
          {isChainedFlow && firstLegResponse && (
            <>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Step 1 — SecurityScorecard
              </div>
              <pre className="mb-4 rounded-md bg-slate-950 p-4 text-[#B5FF56] text-xs overflow-x-auto">
                <code>{JSON.stringify(firstLegResponse, null, 2)}</code>
              </pre>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Step 2 — ProcessUnity (paired via options.connection_id)
              </div>
            </>
          )}
          <pre className="mt-2 rounded-md bg-slate-950 p-4 text-[#B5FF56] text-xs overflow-x-auto">
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
