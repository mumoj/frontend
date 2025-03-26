import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';
import { apiRequest } from '../services/api';


interface LocationMapPickerProps {
  show: boolean;
  onHide: () => void;
  onSelectLocation: (location: Location) => void;
  title: string;
  initialLocation?: Location | null;
}

// Default icon setup for Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks and marker updates
const MapClickHandler: React.FC<{
  onPositionChange: (lat: number, lng: number) => void;
  markerPosition: [number, number] | null;
}> = ({ onPositionChange, markerPosition }) => {
  const map = useMapEvents({
    click: (e) => {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  // If there's an initial position, pan to it
  useEffect(() => {
    if (markerPosition) {
      map.panTo(markerPosition);
    }
  }, [map, markerPosition]);

  return markerPosition ? <Marker position={markerPosition} /> : null;
};

const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  show,
  onHide,
  onSelectLocation,
  title,
  initialLocation,
}) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [locationName, setLocationName] = useState<string>(initialLocation?.name || '');
  const [address, setAddress] = useState<string>(initialLocation?.address || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Default center position (can be customized)
  const defaultCenter: [number, number] = [39.8283, -98.5795]; // Center of the US

  // Get CSRF token on component mount
  useEffect(() => {
    // Function to get cookie by name
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };
    
    const token = getCookie('csrftoken');
    if (token) {
      setCsrfToken(token);
    }
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      if (initialLocation) {
        setMarkerPosition([initialLocation.latitude, initialLocation.longitude]);
        setLocationName(initialLocation.name);
        setAddress(initialLocation.address || '');
      } else {
        setMarkerPosition(null);
        setLocationName('');
        setAddress('');
      }
      setError(null);
    }
  }, [show, initialLocation]);

  // Handle marker position change
  const handlePositionChange = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    
    // Always fetch address using reverse geocoding
    fetchAddressFromCoordinates(lat, lng);
  };

  // Fetch address from coordinates using Nominatim
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Trip Planner App',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service error');
      }

      const data = await response.json();
      
      if (data.display_name) {
        setAddress(data.display_name);
        
        // Always extract a meaningful name from the address
        // This will update the location name regardless of whether it's already set
        if (data.address) {
          const candidates = [
            data.address.amenity,
            data.address.building,
            data.address.tourism,
            data.address.shop,
            data.address.leisure,
            data.address.road,
            data.address.suburb,
            data.address.town,
            data.address.city,
            data.address.county
          ].filter(Boolean);
          
          if (candidates.length > 0) {
            setLocationName(candidates[0]);
          } else if (data.name) {
            // Sometimes OSM has a 'name' property we can use
            setLocationName(data.name);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching address:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save the selected location
  const handleSave = async () => {
    if (!locationName.trim()) {
      setError('Please provide a location name');
      return;
    }

    if (!markerPosition) {
      setError('Please select a location on the map');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Option 1: Save to database with CSRF token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
      
      // Add CSRF token if available
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }

      const response = await apiRequest('/api/locations/', {
        method: 'POST',
        headers: headers,
        credentials: 'include', // Important for sending cookies
        body: JSON.stringify({
          name: locationName,
          latitude: markerPosition[0],
          longitude: markerPosition[1],
          address: address || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save location');
      }

      const savedLocation = await response.json();
      onSelectLocation(savedLocation);
      onHide();

      // Option 2: Use local data without saving to database
      /* 
      const tempLocation: Location = {
        id: initialLocation?.id || -1, // Temporary ID if new
        name: locationName,
        latitude: markerPosition[0],
        longitude: markerPosition[1],
        address: address || undefined
      };
      onSelectLocation(tempLocation);
      onHide();
      */
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        <Form.Group className="mb-3">
          <Form.Label>Location Name</Form.Label>
          <Form.Control
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Enter a name for this location"
            required
          />
        </Form.Group>

        <div className="mb-3" style={{ height: '400px' }}>
          <MapContainer
            center={markerPosition || defaultCenter}
            zoom={markerPosition ? 13 : 4}
            style={{ height: '100%', width: '100%', borderRadius: '4px' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              onPositionChange={handlePositionChange}
              markerPosition={markerPosition}
            />
          </MapContainer>
          <small className="text-muted mt-1 d-block">
            Click on the map to set the location
          </small>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address will be populated automatically when you select a location"
          />
        </Form.Group>

        {markerPosition && (
          <div className="mb-3">
            <small className="text-muted">
              Selected coordinates: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
            </small>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading || !markerPosition}
        >
          {loading ? 'Saving...' : 'Save Location'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationMapPicker;