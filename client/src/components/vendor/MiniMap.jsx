import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom brutalist marker icon for Leaflet
const brutalIcon = L.divIcon({
  className: 'brutal-marker',
  html: `<div style="width: 16px; height: 16px; background: #C84B31; border: 2px solid #212121; box-shadow: 2px 2px 0px #212121; transform: rotate(45deg);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/**
 * MiniMap — a static, non-interactive Leaflet tile map thumbnail.
 * Used in vendor listing cards to show geolocation preview.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
const MiniMap = ({ lat, lng }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
      }).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      L.marker([lat, lng], { icon: brutalIcon }).addTo(mapRef.current);

      // Force recalculation of map container dimensions once rendered
      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="w-full h-36 border-b-2 border-[#212121]" />;
};

export default MiniMap;
