
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Job {
  id: string;
  lat: number;
  lng: number;
}
interface MapboxMapProps {
  jobs: Job[];
  activeJobId: string | null;
  onPinClick: (jobId: string) => void;
  mapboxToken: string;
}
const defaultCenter = [-111.873, 40.7608]; // SLC, Utah as central fallback

const pinColor = "#F97316";
const pinActiveColor = "#E05E00";

const MapboxMap: React.FC<MapboxMapProps> = ({ jobs, activeJobId, onPinClick, mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<{[id: string]: mapboxgl.Marker}>({});

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    mapboxgl.accessToken = mapboxToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: jobs.length ? [jobs[0].lng, jobs[0].lat] : defaultCenter,
      zoom: 11,
      attributionControl: false,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current.scrollZoom.disable();

    // Add markers
    jobs.forEach((job) => {
      const el = document.createElement("div");
      el.className = "job-pin";
      el.style.width = activeJobId === job.id ? "38px" : "28px";
      el.style.height = activeJobId === job.id ? "38px" : "28px";
      el.style.background = "#fff";
      el.style.borderRadius = "50%";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.boxShadow = activeJobId === job.id
        ? "0 2px 12px 2px rgba(249,115,22,0.25)"
        : "0 2px 8px 0 rgba(0,0,0,0.12)";
      el.style.border = `3px solid ${activeJobId === job.id ? pinActiveColor : pinColor}`;
      el.style.cursor = "pointer";
      el.innerHTML = \`
        <svg width="\${activeJobId === job.id ? 24 : 20}" height="\${activeJobId === job.id ? 24 : 20}" fill="none" viewBox="0 0 24 24" stroke-width="2.4" stroke="\${pinColor}">
          <circle cx="12" cy="12" r="9" fill="#FFEDD5" stroke="\${pinColor}"/>
          <svg x="4" y="3" width="16" height="18">
            <path d="M10.32 17.195a2.397 2.397 0 0 1 3.36 0m-1.68-13.41V3.25m7.86 7.33c.122.436.26.913.26 1.42C20.76 15.628 12 20.75 12 20.75s-8.76-5.123-8.76-8.747c0-.507.138-.985.26-1.42m7.86-7.33c.276.003.553.01.83.026m-1.66 0c.277-.016.554-.024.83-.026" stroke="\${pinColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </svg>
      \`;

      el.onclick = () => {
        onPinClick(job.id);
      };

      const marker = new mapboxgl.Marker(el)
        .setLngLat([job.lng, job.lat])
        .addTo(mapRef.current!);
      markerRefs.current[job.id] = marker;
    });

    return () => {
      Object.values(markerRefs.current).forEach(marker => marker.remove());
      mapRef.current?.remove();
      markerRefs.current = {};
    };
    // we only want this to run on mount/unmount and when jobs or token change
    // eslint-disable-next-line
  }, [jobs, mapboxToken]);

  // highlight active marker
  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (!el) return;
      el.style.width = activeJobId === id ? "38px" : "28px";
      el.style.height = activeJobId === id ? "38px" : "28px";
      el.style.border = \`3px solid \${activeJobId === id ? pinActiveColor : pinColor}\`;
      el.style.boxShadow = activeJobId === id
        ? "0 2px 12px 2px rgba(249,115,22,0.25)"
        : "0 2px 8px 0 rgba(0,0,0,0.12)";
    });

    // pan/zoom to active marker
    if (activeJobId && markerRefs.current[activeJobId]) {
      markerRefs.current[activeJobId].getMap()?.flyTo({center: markerRefs.current[activeJobId].getLngLat(), zoom: 12, speed: 0.8, essential: true });
    }
  }, [activeJobId]);

  return (
    <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg z-0" />
  );
};

export default MapboxMap;
