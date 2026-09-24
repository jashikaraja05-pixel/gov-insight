import React, { useState } from 'react';
import { CivicIssue, LocationData } from '../../types';
import { MapPin, Navigation, ExternalLink, Globe, Layers } from 'lucide-react';

interface GlobalMapProps {
  issues?: CivicIssue[];
  selectedIssue?: CivicIssue | null;
  onSelectIssue?: (issue: CivicIssue) => void;
  interactiveLocation?: LocationData;
  onLocationChange?: (location: LocationData) => void;
  mode?: 'view' | 'picker';
  activeLayer?: 'all' | 'critical' | 'underrepresented' | 'hotspots';
  heightClass?: string;
  zoomLevel?: 'city' | 'global';
}

export const GlobalMap: React.FC<GlobalMapProps> = ({
  issues = [],
  selectedIssue = null,
  interactiveLocation,
  mode = 'view',
  heightClass = 'h-96',
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoom, setZoom] = useState<number>(16);

  // Target coordinates
  const lat = interactiveLocation?.lat ?? selectedIssue?.location?.lat ?? 13.0827;
  const lng = interactiveLocation?.lng ?? selectedIssue?.location?.lng ?? 80.2707;
  const address =
    interactiveLocation?.address ||
    selectedIssue?.location?.address ||
    `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

  // Google Maps embed URL
  const embedQuery = encodeURIComponent(
    interactiveLocation?.address && interactiveLocation.address.length > 5
      ? `${interactiveLocation.address}`
      : `${lat},${lng}`
  );
  const mapTypeParam = mapType === 'satellite' ? 'k' : 'm';
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${embedQuery}&t=${mapTypeParam}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  const externalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl flex flex-col`}
    >
      {/* Top Map HUD Bar */}
      <div className="absolute top-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/40 text-xs shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-red-400" />
            <span>Google Maps GPS Location</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-emerald-400 font-bold">
            {lat.toFixed(4)}°, {lng.toFixed(4)}°
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-950/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg text-xs">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              mapType === 'roadmap'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🗺️ Street
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              mapType === 'satellite'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🛰️ Satellite
          </button>

          <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(19, z + 1))}
            className="w-6 h-6 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(10, z - 1))}
            className="w-6 h-6 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold"
            title="Zoom Out"
          >
            -
          </button>

          <a
            href={externalGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center"
            title="Open in Google Maps App"
          >
            <ExternalLink className="w-3.5 h-3.5 text-red-400" />
          </a>
        </div>
      </div>

      {/* Embedded Google Map iframe */}
      <div className="relative flex-1 w-full h-full bg-slate-950">
        <iframe
          title="Google Map Location"
          src={googleMapsEmbedUrl}
          className="w-full h-full border-0 filter contrast-[1.05]"
          loading="lazy"
        />

        {/* Center Target Crosshair Pin Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <div className="relative">
            <MapPin className="w-8 h-8 text-red-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-bounce" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/60 rounded-full blur-[1px]" />
          </div>
        </div>
      </div>

      {/* Bottom Address Footer Bar */}
      <div className="p-2.5 bg-slate-950/95 border-t border-white/10 flex items-center justify-between text-xs px-4">
        <div className="flex items-center gap-2 truncate text-slate-300">
          <Navigation className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="truncate font-medium">
            {address}
          </span>
        </div>
        <a
          href={externalGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-400 hover:text-red-300 text-[11px] font-bold flex items-center gap-1 shrink-0 ml-2"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
