export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface SessionData {
  session_id: number;
  locations: Location[];
  last_timestamp: number;
}

export type TrackingStatus = "ACTIVE" | "INACTIVE";

export interface TrackingState {
  path: [number, number][];
  currentLocation: Location | null;
  lastTimestamp: number | null;
  status: TrackingStatus;
  sessionId: number | null;
}
