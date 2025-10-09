import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

type LocationPickerProps = {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
};

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York as default
};

export const LocationPicker = ({ onLocationSelect, initialLocation }: LocationPickerProps) => {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyEntered, setApiKeyEntered] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(initialLocation || defaultCenter);
  const [address, setAddress] = useState('');
  const [mapCenter, setMapCenter] = useState(initialLocation || defaultCenter);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      reverseGeocode(lat, lng);
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setAddress(formattedAddress);
          onLocationSelect({ address: formattedAddress, lat, lng });
          toast.success('Location selected!');
        } else {
          toast.error('Could not fetch address for this location');
        }
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to get address');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarkerPosition({ lat, lng });
          setMapCenter({ lat, lng });
          reverseGeocode(lat, lng);
          if (mapRef.current) {
            mapRef.current.panTo({ lat, lng });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not get your current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleLoadMap = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your Google Maps API key');
      return;
    }
    setApiKeyEntered(true);
    toast.success('Loading map...');
  };

  if (!apiKeyEntered) {
    return (
      <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
        <div className="space-y-2">
          <Label htmlFor="google-api-key" className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Google Maps API Key
          </Label>
          <p className="text-sm text-muted-foreground">
            To use the location picker, please enter your Google Maps API key.{' '}
            <a
              href="https://developers.google.com/maps/documentation/javascript/get-api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              Get your API key here
            </a>
          </p>
          <Input
            id="google-api-key"
            type="text"
            placeholder="Enter your Google Maps API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <Button onClick={handleLoadMap} className="w-full">
          <MapPin className="h-4 w-4 mr-2" />
          Load Map
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Select Location
        </Label>
        <Button onClick={getCurrentLocation} variant="outline" size="sm">
          <Navigation className="h-4 w-4 mr-2" />
          Use Current Location
        </Button>
      </div>

      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={13}
          onLoad={onLoad}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={markerPosition} />
        </GoogleMap>
      </LoadScript>

      <div className="space-y-2">
        <Label htmlFor="selected-address">Selected Address</Label>
        <Input
          id="selected-address"
          value={address}
          readOnly
          placeholder="Click on the map to select a location"
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Click anywhere on the map to set your pickup location, or use the "Use Current Location" button.
        </p>
      </div>
    </div>
  );
};