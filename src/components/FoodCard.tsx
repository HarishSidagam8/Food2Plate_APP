import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, Package, Star, Store, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FoodQualityAnalyzer, type AnalysisResult } from '@/components/FoodQualityAnalyzer';

type DonorInfo = {
  id: string;
  full_name: string;
  restaurant_name?: string;
  restaurant_description?: string;
  profile_image_url?: string;
  is_restaurant?: boolean;
  rating?: number;
  total_ratings?: number;
};

type FoodCardProps = {
  id: string;
  food_type: string;
  quantity: string;
  description?: string;
  pickup_location: string;
  available_until: string;
  status: string;
  image_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  donor?: DonorInfo;
  quality_status?: string;
  quality_confidence?: number;
  shelf_life_hours?: number;
  quality_reasoning?: string;
  onReserve?: (id: string, analysis?: AnalysisResult | null) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  actionType?: 'reserve' | 'manage';
};

export const FoodCard = ({
  id,
  food_type,
  quantity,
  description,
  pickup_location,
  available_until,
  status,
  image_url,
  latitude,
  longitude,
  donor,
  quality_status,
  quality_confidence,
  shelf_life_hours,
  quality_reasoning,
  onReserve,
  onEdit,
  onDelete,
  showActions = true,
  actionType = 'reserve'
}: FoodCardProps) => {
  const [showQualityCheck, setShowQualityCheck] = useState(false);
  const [receiverQualityCheck, setReceiverQualityCheck] = useState<AnalysisResult | null>(null);

  const handleReserveAfterQualityCheck = () => {
    if (onReserve) {
      onReserve(id, receiverQualityCheck);
      setShowQualityCheck(false);
      setReceiverQualityCheck(null);
    }
  };

  const qualityIcons = {
    Fresh: CheckCircle2,
    Medium: AlertTriangle,
    Stale: XCircle
  };

  const qualityColors = {
    Fresh: 'text-green-600',
    Medium: 'text-amber-600',
    Stale: 'text-red-600'
  };
  const statusColors = {
    available: 'bg-primary text-primary-foreground',
    reserved: 'bg-accent text-accent-foreground',
    expired: 'bg-muted text-muted-foreground',
    completed: 'bg-secondary text-secondary-foreground'
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      {image_url && (
        <div className="w-full h-48 bg-muted overflow-hidden">
          <img 
            src={image_url} 
            alt={food_type}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        {donor && (
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <Avatar className="h-12 w-12">
              <AvatarImage src={donor.profile_image_url} alt={donor.full_name} />
              <AvatarFallback>{donor.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {donor.is_restaurant && <Store className="h-4 w-4 text-primary" />}
                <h4 className="font-semibold">
                  {donor.is_restaurant && donor.restaurant_name ? donor.restaurant_name : donor.full_name}
                </h4>
              </div>
              {donor.rating !== undefined && donor.total_ratings !== undefined && donor.total_ratings > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span>{donor.rating.toFixed(1)}</span>
                  <span className="text-xs">({donor.total_ratings} ratings)</span>
                </div>
              )}
              {donor.is_restaurant && donor.restaurant_description && (
                <p className="text-xs text-muted-foreground line-clamp-1">{donor.restaurant_description}</p>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{food_type}</CardTitle>
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {description && (
          <p className="text-muted-foreground mb-4">{description}</p>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-primary" />
            <span>{quantity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="flex-1">{pickup_location}</span>
            {latitude && longitude && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span>Until {format(new Date(available_until), 'PPp')}</span>
          </div>
        </div>

        {/* AI Quality Report - Prominent Display for Receivers */}
        {quality_status && actionType === 'reserve' && (
          <div className="mt-4 pt-4 border-t">
            <div className="bg-primary/5 rounded-lg p-4 border-2 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                {(() => {
                  const Icon = qualityIcons[quality_status as keyof typeof qualityIcons];
                  return Icon ? <Icon className={`h-6 w-6 ${qualityColors[quality_status as keyof typeof qualityColors]}`} /> : null;
                })()}
                <span className="font-bold text-lg">AI Quality Report</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Quality Status:</span>
                  <span className={`font-bold ${qualityColors[quality_status as keyof typeof qualityColors]}`}>
                    {quality_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">AI Confidence:</span>
                  <span className="font-bold">{quality_confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Estimated Shelf-life:</span>
                  <span className="font-bold">{shelf_life_hours}h</span>
                </div>
                {quality_reasoning && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground italic">{quality_reasoning}</p>
                  </div>
                )}
              </div>
              <Badge className="mt-3 w-full justify-center bg-primary/10 text-primary hover:bg-primary/20">
                ✓ AI Verified by Donor
              </Badge>
            </div>
          </div>
        )}

        {/* AI Quality Report - Compact Display for Donors */}
        {quality_status && actionType === 'manage' && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const Icon = qualityIcons[quality_status as keyof typeof qualityIcons];
                return Icon ? <Icon className={`h-5 w-5 ${qualityColors[quality_status as keyof typeof qualityColors]}`} /> : null;
              })()}
              <span className="font-semibold">AI Quality Report:</span>
            </div>
            <div className="space-y-1 text-sm">
              <p><strong>Quality:</strong> {quality_status} ({quality_confidence}% confidence)</p>
              <p><strong>Shelf-life:</strong> {shelf_life_hours} hours</p>
              {quality_reasoning && <p className="text-muted-foreground text-xs">{quality_reasoning}</p>}
            </div>
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="flex flex-col gap-2">
          {actionType === 'reserve' && status === 'available' && onReserve && (
            <Button 
              onClick={() => setShowQualityCheck(true)} 
              className="w-full"
            >
              Reserve Food
            </Button>
          )}
          {actionType === 'manage' && (
            <>
              {onEdit && (
                <Button onClick={() => onEdit(id)} variant="outline" className="flex-1">
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button onClick={() => onDelete(id)} variant="destructive" className="flex-1">
                  Delete
                </Button>
              )}
            </>
          )}
        </CardFooter>
      )}

      <Dialog open={showQualityCheck} onOpenChange={setShowQualityCheck}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Food Quality Verification & Reservation</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Review the donor's AI quality report below. You can optionally run your own quality check for additional verification.
            </p>
          </DialogHeader>
          {image_url && (
            <div className="space-y-6">
              {/* Food Image Preview */}
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={image_url} 
                  alt={food_type}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Donor's Report - Prominent */}
              {quality_status ? (
                <div className="border-2 border-primary rounded-lg p-5 bg-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    {(() => {
                      const Icon = qualityIcons[quality_status as keyof typeof qualityIcons];
                      return Icon ? <Icon className={`h-6 w-6 ${qualityColors[quality_status as keyof typeof qualityColors]}`} /> : null;
                    })()}
                    <h3 className="font-bold text-lg">Donor's AI Quality Report</h3>
                    <Badge className="ml-auto">Verified</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Quality Status</p>
                      <p className={`font-bold text-lg ${qualityColors[quality_status as keyof typeof qualityColors]}`}>
                        {quality_status}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">AI Confidence</p>
                      <p className="font-bold text-lg">{quality_confidence}%</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Shelf Life</p>
                      <p className="font-bold text-lg">{shelf_life_hours}h</p>
                    </div>
                  </div>
                  {quality_reasoning && (
                    <div className="mt-3 p-3 bg-background rounded-lg">
                      <p className="text-xs font-semibold mb-1">AI Analysis:</p>
                      <p className="text-sm text-muted-foreground italic">{quality_reasoning}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">No AI quality report available from donor</p>
                </div>
              )}

              {/* Receiver's Optional Quality Check */}
              <div className="border rounded-lg p-5 bg-muted/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Run Your Own Quality Check (Optional)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Want a second opinion? Upload or use the food image to run an independent AI quality analysis.
                </p>
                <FoodQualityAnalyzer 
                  preloadedImageUrl={image_url}
                  onAnalysisComplete={(result) => {
                    setReceiverQualityCheck(result);
                  }}
                  showAsCard={false}
                />
              </div>

              {/* Reserve Button */}
              <div className="space-y-3 pt-4 border-t">
                <Button 
                  onClick={handleReserveAfterQualityCheck}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                >
                  {receiverQualityCheck ? '✓ Confirm Reservation (Both Reports Verified)' : '✓ Confirm Reservation'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {receiverQualityCheck 
                    ? 'Both the donor\'s report and your verification will be attached to your reservation.' 
                    : 'The donor\'s AI quality report will be attached to your reservation.'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
