
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Property {
  id: string;
  lat: number;
  lng: number;
  price?: number;
}

interface PropertyMapViewProps {
  properties: Property[];
  activePropertyId: string | null;
  onPinClick: (propertyId: string) => void;
  mapboxToken: string;
}

const defaultCenter = [-111.873, 40.7608]; // SLC, Utah as central fallback

const PropertyMapView: React.FC<PropertyMapViewProps> = ({ 
  properties, 
  activePropertyId, 
  onPinClick, 
  mapboxToken 
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<{[id: string]: mapboxgl.Marker}>({});

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    mapboxgl.accessToken = mapboxToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: properties.length ? [properties[0].lng, properties[0].lat] : defaultCenter,
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current.scrollZoom.disable();

    // Add markers
    properties.forEach((property) => {
      const el = document.createElement("div");
      el.className = "property-pin";
      el.style.width = activePropertyId === property.id ? "80px" : "70px";
      el.style.height = activePropertyId === property.id ? "36px" : "32px";
      el.style.background = "#fff";
      el.style.borderRadius = "4px";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.boxShadow = activePropertyId === property.id
        ? "0 2px 12px 2px rgba(20,66,95,0.25)"
        : "0 2px 8px 0 rgba(0,0,0,0.12)";
      el.style.border = "2px solid #15425F";
      el.style.cursor = "pointer";
      el.style.fontWeight = "bold";
      el.style.color = "#15425F";
      el.style.fontSize = activePropertyId === property.id ? "14px" : "12px";
      
      const formattedPrice = property.price 
        ? `$${Math.round(property.price / 1000)}k`
        : "N/A";
      
      el.textContent = formattedPrice;

      el.onclick = () => {
        onPinClick(property.id);
      };

      const marker = new mapboxgl.Marker(el)
        .setLngLat([property.lng, property.lat])
        .addTo(mapRef.current!);
      markerRefs.current[property.id] = marker;
    });

    return () => {
      Object.values(markerRefs.current).forEach(marker => marker.remove());
      mapRef.current?.remove();
      markerRefs.current = {};
    };
  }, [properties, mapboxToken]);

  // highlight active marker
  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (!el) return;
      
      el.style.width = activePropertyId === id ? "80px" : "70px";
      el.style.height = activePropertyId === id ? "36px" : "32px";
      el.style.boxShadow = activePropertyId === id
        ? "0 2px 12px 2px rgba(20,66,95,0.25)"
        : "0 2px 8px 0 rgba(0,0,0,0.12)";
      el.style.fontSize = activePropertyId === id ? "14px" : "12px";
      el.style.zIndex = activePropertyId === id ? "10" : "1";
    });

    // pan/zoom to active marker
    if (activePropertyId && markerRefs.current[activePropertyId] && mapRef.current) {
      mapRef.current.flyTo({
        center: markerRefs.current[activePropertyId].getLngLat(),
        zoom: 13,
        speed: 0.8,
        essential: true
      });
    }
  }, [activePropertyId]);

  return (
    <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg z-0" />
  );
};

export default PropertyMapView;
