import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Map } from './components/Map';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { TrackingState, SessionData, Location } from './types';

const BUS_ID = "101";
const UPDATE_INTERVAL = 1000; // 1 second

export default function App() {
  const [state, setState] = useState<TrackingState>({
    path: [],
    currentLocation: null,
    lastTimestamp: null,
    status: "INACTIVE",
    sessionId: null,
  });
  const [zoom, setZoom] = useState(15);

  const lastUpdateRef = useRef<number | null>(null);

  // Initial Load: Fetch full session
  const fetchInitialSession = useCallback(async () => {
    try {
      const response = await axios.get<SessionData>(`/api/tracking/session/${BUS_ID}`);
      const { session_id, locations, last_timestamp } = response.data;
      
      const path: [number, number][] = locations.map(loc => [loc.latitude, loc.longitude]);
      const current = locations.length > 0 ? locations[locations.length - 1] : null;

      setState({
        path,
        currentLocation: current,
        lastTimestamp: last_timestamp,
        status: "ACTIVE",
        sessionId: session_id,
      });
      lastUpdateRef.current = Date.now();
    } catch (error) {
      console.error("Failed to fetch initial session:", error);
      setState(prev => ({ ...prev, status: "INACTIVE" }));
    }
  }, []);

  // Incremental Updates
  const fetchUpdates = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      const response = await axios.get<{ locations: Location[]; last_timestamp: number }>(
        `/api/location/updates?bus_id=${BUS_ID}&since=${state.lastTimestamp || 0}`
      );
      
      const { locations, last_timestamp } = response.data;

      if (locations.length > 0) {
        const newPoints: [number, number][] = locations.map(loc => [loc.latitude, loc.longitude]);
        const newCurrent = locations[locations.length - 1];

        setState(prev => ({
          ...prev,
          path: [...prev.path, ...newPoints],
          currentLocation: newCurrent,
          lastTimestamp: last_timestamp,
          status: "ACTIVE",
        }));
        lastUpdateRef.current = Date.now();
      } else {
        // Check for inactivity
        if (lastUpdateRef.current && Date.now() - lastUpdateRef.current > 10000) {
          setState(prev => ({ ...prev, status: "INACTIVE" }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch updates:", error);
    }
  }, [state.sessionId, state.lastTimestamp, state.currentLocation]);

  useEffect(() => {
    fetchInitialSession();
  }, [fetchInitialSession]);

  useEffect(() => {
    const interval = setInterval(fetchUpdates, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUpdates]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-white text-black font-headline overflow-hidden h-screen flex flex-col">
      <Header status={state.status} />

      <main className="flex-grow relative bg-gray-100 overflow-hidden p-2 md:p-8 pb-20 md:pb-32">
        <Map 
          path={state.path} 
          currentLocation={state.currentLocation ? [state.currentLocation.latitude, state.currentLocation.longitude] : null}
          zoom={zoom}
        />
        
        <TelemetryOverlay 
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        {/* Side Decoration */}
        <div className="fixed left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-left z-0 pointer-events-none opacity-5">
          <span className="text-[6rem] md:text-[12rem] font-black leading-none whitespace-nowrap select-none">TRK-DSH-0822</span>
        </div>
      </main>

      <Footer 
        busId={BUS_ID}
        sessionId={state.sessionId}
        lastUpdated={state.currentLocation ? new Date(state.currentLocation.timestamp).toLocaleTimeString('en-GB', { hour12: false }) : "N/A"}
      />
    </div>
  );
}
