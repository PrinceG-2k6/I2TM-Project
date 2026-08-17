export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '640px',
  boxShadow: 'var(--shadow-card)'
};

export const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry',            stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill',    stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke',  stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b687a' }] },
    { featureType: 'road',                elementType: 'geometry',        stylers: [{ color: '#304a7d' }] },
    { featureType: 'road',                elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway',        elementType: 'geometry',        stylers: [{ color: '#2c456b' }] },
    { featureType: 'road.highway',        elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'water',               elementType: 'geometry',        stylers: [{ color: '#0e1626' }] },
    { featureType: 'poi',                 elementType: 'labels',          stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.medical',         elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.school',          elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.government',      elementType: 'labels',          stylers: [{ visibility: 'on' }] },
    { featureType: 'transit',             elementType: 'labels',          stylers: [{ visibility: 'off' }] }
  ]
};
