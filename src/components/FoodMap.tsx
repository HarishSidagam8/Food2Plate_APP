import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FoodMapProps {
  foodPosts: any[];
  onReserve?: (id: string) => void;
}

export function FoodMap({ foodPosts, onReserve }: FoodMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenEntered, setTokenEntered] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !tokenEntered || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0],
        zoom: 2,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        map.current?.remove();
      };
    } catch (error) {
      toast.error('Failed to initialize map. Please check your Mapbox token.');
    }
  }, [tokenEntered, mapboxToken]);

  useEffect(() => {
    if (!map.current || !tokenEntered) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const validPosts = foodPosts.filter(post => post.latitude && post.longitude);

    if (validPosts.length === 0) return;

    // Add markers for each food post
    validPosts.forEach((post) => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${post.food_type}</h3>
          <p class="text-sm">${post.pickup_location}</p>
          <p class="text-sm">Qty: ${post.quantity}</p>
          ${post.description ? `<p class="text-sm text-muted-foreground">${post.description}</p>` : ''}
          ${onReserve ? `<button onclick="window.reserveFood('${post.id}')" class="mt-2 px-3 py-1 bg-primary text-white rounded text-sm">Reserve</button>` : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat([post.longitude, post.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Fit map to markers
    if (validPosts.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      validPosts.forEach(post => {
        bounds.extend([post.longitude, post.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [foodPosts, tokenEntered]);

  useEffect(() => {
    if (onReserve) {
      (window as any).reserveFood = (id: string) => onReserve(id);
    }
    return () => {
      delete (window as any).reserveFood;
    };
  }, [onReserve]);

  if (!tokenEntered) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Enter Mapbox Token</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get your free token at{' '}
              <a
                href="https://mapbox.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter your Mapbox token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <button
              onClick={() => {
                if (mapboxToken.trim()) {
                  setTokenEntered(true);
                  toast.success('Map initialized!');
                } else {
                  toast.error('Please enter a valid token');
                }
              }}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Load Map
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
}
