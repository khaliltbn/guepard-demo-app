import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, AlertCircle, CheckCircle, X as CloseIcon, RefreshCw } from 'lucide-react';

// --- Type Definitions ---
type ManageFeaturePayload = { action: 'apply' | 'revert'; featureName: string; };
type SwitchDbPayload = { mainConnectionString: string; shadowConnectionString?: string; };
interface ScriptResponse { output?: string; message?: string; }

// --- API Fetch Functions ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const demoControlApiBase = `${API_BASE_URL}/demo-control`;

const fetchStatus = async (): Promise<{ currentDatabase: string; rawDbUrl: string; rawShadowDbUrl: string; }> => {
  const res = await fetch(`${demoControlApiBase}/status`);
  if (!res.ok) {
     const errorText = await res.text();
     throw new Error(`Failed to fetch status: ${res.status} ${errorText}`);
  }
  return res.json();
};
const updateBackendEnv = async (payload: SwitchDbPayload): Promise<ScriptResponse> => {
  const res = await fetch(`${demoControlApiBase}/switch-db`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Failed to parse error response' })); throw new Error(err.error || err.details || 'Failed to update .env'); }
  return res.json();
};
const manageFeature = async (payload: ManageFeaturePayload): Promise<ScriptResponse> => {
  const res = await fetch(`${demoControlApiBase}/manage-feature`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Failed to parse error response' })); throw new Error(err.error || err.details || 'Failed to manage feature'); }
  return res.json();
};
const runSeed = async (): Promise<ScriptResponse> => {
  const res = await fetch(`${demoControlApiBase}/run-seed`, { method: 'POST' });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Failed to parse error response' })); throw new Error(err.error || err.details || 'Failed to run seed'); }
  return res.json();
};

const fetchFeatureStatus = async (featureName: string): Promise<{ featureName: string; isApplied: boolean }> => {
  const res = await fetch(`${demoControlApiBase}/feature-status/${featureName}`);
  if (!res.ok) {
     const errorText = await res.text();
     throw new Error(`Failed to fetch feature status: ${res.status} ${errorText}`);
  }
  return res.json();
};

// --- Component Props ---
interface DemoControlPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

// --- Component Definition ---
export const DemoControlPanel = ({ isOpen, onToggle }: DemoControlPanelProps) => {
  // --- State ---
  const [status, setStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [panelNotification, setPanelNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mainDbInput, setMainDbInput] = useState<string>(() => localStorage.getItem('guepard_main_db') || '');
  const [featureStatus, setFeatureStatus] = useState<{ isApplied: boolean } | null>(null);
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(false);
  const [shadowDbInput, setShadowDbInput] = useState<string>(() => localStorage.getItem('guepard_shadow_db') || '');
  const queryClient = useQueryClient();

  const refreshStatuses = async () => {
      setIsLoadingStatus(true);
      setIsLoadingFeatureStatus(true);
      try {
          const [dbData, featureData] = await Promise.all([
              fetchStatus(),
              fetchFeatureStatus('discount-feature')
          ]);
          setStatus(dbData);
          setFeatureStatus(featureData);
      } catch (error: any) {
          setPanelNotification({ type: 'error', message: `Status Fetch Failed: ${error.message}` });
          console.error("Failed to get status:", error);
      } finally {
          setIsLoadingStatus(false);
          setIsLoadingFeatureStatus(false);
      }
  };

  // --- Effects ---
  useEffect(() => { localStorage.setItem('guepard_main_db', mainDbInput); }, [mainDbInput]);
  useEffect(() => { localStorage.setItem('guepard_shadow_db', shadowDbInput); }, [shadowDbInput]);

  useEffect(() => {
    let isMounted = true;
    const initialLoad = async () => {
        if (isMounted) await refreshStatuses();
    };
    initialLoad();
    const interval = setInterval(async () => {
        if (isMounted) await refreshStatuses();
    }, 15000); // Refresh status every 15s
    return () => { isMounted = false; clearInterval(interval); };
  }, []);


  useEffect(() => {
    if (panelNotification) {
      const timer = setTimeout(() => setPanelNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [panelNotification]);

  // --- Mutations ---
  const handleMutation = <TVariables = void>(
    mutationFn: (variables: TVariables) => Promise<ScriptResponse>,
    successMsg: string,
    errorMsg: string
  ) => {
    return useMutation<ScriptResponse, Error, TVariables>({
      mutationFn,
      onSuccess: (data) => {
        setPanelNotification({ type: 'success', message: data.output || data.message || successMsg });
        refreshStatuses();
      },
      onError: (error) => {
        setPanelNotification({ type: 'error', message: `${errorMsg}: ${error.message}` });
        refreshStatuses();
      },
    });
  };
  

  const updateEnvMutation = handleMutation(updateBackendEnv, ".env Update Initiated", ".env Update Failed");
  const manageFeatureMutation = handleMutation(manageFeature, "File Patch Initiated", "File Patch Failed");
  const runSeedMutation = handleMutation(runSeed, "Seed Executed", "Seed Failed");

  // --- Event Handlers ---
  const handleFeatureAction = (action: 'apply' | 'revert', featureName: string) => {
      manageFeatureMutation.mutate({ action, featureName });
  };
  const handleUpdateEnv = () => {
      if (!mainDbInput) {
          setPanelNotification({ type: 'error', message: 'Main connection string cannot be empty.' });
          return;
      }
      updateEnvMutation.mutate({ mainConnectionString: mainDbInput, shadowConnectionString: shadowDbInput });
  };

  // --- JSX ---
  return (
    <Card className="h-full w-full flex flex-col border-l shadow-lg bg-card text-card-foreground rounded-none relative">
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 left-[-40px] z-10 rounded-r-none border border-r-0 bg-card hover:bg-accent text-card-foreground"
        onClick={onToggle}
        aria-label="Toggle Demo Panel"
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
      
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-heading text-lg pt-2">Demo Control Panel</CardTitle>
        <CardDescription>Manage demo state and features.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto pb-4 px-4">
        {/* Status Display */}
        <div>
          <Label className="font-semibold block mb-1">Status (Refreshes automatically)</Label>
          <Button
                variant="ghost"
                size="sm"
                onClick={refreshStatuses}
                disabled={isLoadingStatus || isLoadingFeatureStatus}
                className="px-2 h-auto text-xs text-muted-foreground hover:text-foreground"
                aria-label="Refresh Status"
            >
              <RefreshCw className={`h-3 w-3 ${ (isLoadingStatus || isLoadingFeatureStatus) ? 'animate-spin' : ''}`} />
            </Button>
          {isLoadingStatus ? <p className='text-sm text-muted-foreground'>Loading status...</p> : (
            <div className="text-sm space-y-1 mt-1 border rounded p-2 bg-muted/50 dark:bg-muted/20">
              <p>Main DB: <span className="font-medium break-words">{status?.currentDatabase ?? 'Error'}</span></p>
              <p>Shadow DB: <span className="font-medium break-words">{status?.rawShadowDbUrl ?? 'Not Set'}</span></p>
              <p>Feature Patch: <span className={`font-medium ${featureStatus?.isApplied ? 'text-orange-500' : 'text-gray-500' }`}>
                  {featureStatus?.isApplied ? 'Discount Feature Applied' : 'Base Version'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Connection String Inputs */}
        <div className="space-y-3 border-t pt-4">
          <Label className="font-semibold">Backend DB Connection Strings</Label>
          <div className="space-y-1">
            <Label htmlFor="main-db-string" className="text-xs">Main DB URL (DATABASE_URL)</Label>
            <Input
              id="main-db-string"
              value={mainDbInput}
              onChange={(e) => setMainDbInput(e.target.value)}
              placeholder="Paste Main DB connection string..."
              type="text"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="shadow-db-string" className="text-xs">Shadow DB URL (SHADOW_DATABASE_URL)</Label>
            <Input
              id="shadow-db-string"
              value={shadowDbInput}
              onChange={(e) => setShadowDbInput(e.target.value)}
              placeholder="Paste Shadow DB connection string (Optional)..."
              type="text"
            />
          </div>
          <Button onClick={handleUpdateEnv} disabled={updateEnvMutation.isPending || !mainDbInput} className="w-full">
            {updateEnvMutation.isPending ? 'Updating .env...' : 'Update Backend .env'}
          </Button>
           <p className="text-xs text-muted-foreground">Updates backend .env file. Requires manual backend restart.</p>
        </div>

        {/* Feature Management */}
        <div className="space-y-2 border-t pt-4">
          <Label className="font-semibold">Manage Discount Feature</Label>
          <div className="flex gap-2">
            <Button
              className="flex-1" variant="default"
              onClick={() => handleFeatureAction('apply', 'discount-feature')}
              disabled={manageFeatureMutation.isPending}
            >
              Apply Feature Files
            </Button>
            <Button
              className="flex-1" variant="outline"
              onClick={() => handleFeatureAction('revert', 'discount-feature')}
              disabled={manageFeatureMutation.isPending}
            >
              Revert Feature Files
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
              Updates source files. Switch branch in Guepard, run migrate manually, then restart servers.
          </p>
        </div>

        {/* Database Actions */}
        <div className="space-y-2 border-t pt-4">
          <Label className="font-semibold">Database Actions</Label>
          <Button onClick={() => runSeedMutation.mutate()} disabled={runSeedMutation.isPending} variant="secondary" className="w-full">
            {runSeedMutation.isPending ? 'Seeding...' : 'Run Seed'}
          </Button>
          <p className="text-xs text-muted-foreground">Run Seed manually after switching branch & migrating. Only runs if DB is empty.</p>
        </div>

      </CardContent>

      {/* Panel Notification Area */}
      {panelNotification && (
        <CardFooter className={`p-3 border-t flex-shrink-0 ${panelNotification.type === 'success' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
          <div className="flex items-start gap-2 w-full">
            {panelNotification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            )}
            <p className={`text-sm flex-grow ${panelNotification.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-destructive dark:text-red-300'}`}>
              {panelNotification.message}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-transparent flex-shrink-0"
              onClick={() => setPanelNotification(null)}
              aria-label="Close notification"
            >
              <CloseIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};