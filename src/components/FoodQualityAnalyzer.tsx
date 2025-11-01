import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Clock, CheckCircle2, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface AnalysisResult {
  quality: 'Fresh' | 'Medium' | 'Stale';
  shelfLifeHours: number;
  confidence: number;
  reasoning: string;
  isFood?: boolean;
  error?: string;
}

const qualityConfig = {
  Fresh: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', label: 'Fresh' },
  Medium: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950', label: 'Fair Quality' },
  Stale: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', label: 'Poor Quality' }
};

interface FoodQualityAnalyzerProps {
  preloadedImageUrl?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  showAsCard?: boolean;
}

export function FoodQualityAnalyzer({ 
  preloadedImageUrl, 
  onAnalysisComplete,
  showAsCard = true 
}: FoodQualityAnalyzerProps = {}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(preloadedImageUrl || null);
  const [notFoodError, setNotFoodError] = useState<string | null>(null);

  const handleImageAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous states
    setNotFoodError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAnalyzing(true);

    try {
      // Convert image to base64
      const base64Reader = new FileReader();
      base64Reader.onloadend = async () => {
        const base64Image = base64Reader.result as string;

        const { data, error } = await supabase.functions.invoke('analyze-food-quality', {
          body: { imageBase64: base64Image }
        });

        if (error) {
          throw error;
        }

        // Check if it's not a food item
        if (data.isFood === false || data.error) {
          setNotFoodError(data.error || data.reasoning || 'This image does not appear to be food.');
          toast.error('Not a food image');
          setImagePreview(null); // Clear the preview
          return;
        }

        // The edge function returns the analysis directly
        const analysisResult: AnalysisResult = {
          quality: data.quality,
          shelfLifeHours: data.shelfLifeHours,
          confidence: data.confidence,
          reasoning: data.reasoning,
          isFood: data.isFood
        };
        setResult(analysisResult);
        onAnalysisComplete?.(analysisResult);
        toast.success('Analysis completed!');
      };
      base64Reader.readAsDataURL(file);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze food');
      setNotFoodError('Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzePreloadedImage = async () => {
    if (!preloadedImageUrl) return;

    setAnalyzing(true);
    setResult(null);
    setNotFoodError(null);

    try {
      const response = await fetch(preloadedImageUrl);
      const blob = await response.blob();
      
      const base64Reader = new FileReader();
      base64Reader.onloadend = async () => {
        const base64Image = base64Reader.result as string;

        const { data, error } = await supabase.functions.invoke('analyze-food-quality', {
          body: { imageBase64: base64Image }
        });

        if (error) throw error;

        // Check if it's not a food item
        if (data.isFood === false || data.error) {
          setNotFoodError(data.error || data.reasoning || 'This image does not appear to be food.');
          toast.error('Not a food image');
          return;
        }

        // The edge function returns the analysis directly
        const analysisResult: AnalysisResult = {
          quality: data.quality,
          shelfLifeHours: data.shelfLifeHours,
          confidence: data.confidence,
          reasoning: data.reasoning,
          isFood: data.isFood
        };
        setResult(analysisResult);
        onAnalysisComplete?.(analysisResult);
        toast.success('Analysis completed!');
      };
      base64Reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze food');
      setNotFoodError('Failed to analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const content = (
    <CardContent className="space-y-4">
      {!preloadedImageUrl && (
        <div className="space-y-2">
          <Label htmlFor="analyze-image">Upload Food Image</Label>
          <Input
            id="analyze-image"
            type="file"
            accept="image/*"
            onChange={handleImageAnalysis}
            disabled={analyzing}
          />
        </div>
      )}

      {preloadedImageUrl && !result && !notFoodError && (
        <Button 
          onClick={analyzePreloadedImage}
          disabled={analyzing}
          className="w-full"
        >
          {analyzing ? 'Analyzing...' : 'Check Food Quality with AI'}
        </Button>
      )}

      {analyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Analyzing food quality...</p>
          </div>
        </div>
      )}

      {/* Show error when not a food image */}
      {notFoodError && !analyzing && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not a Food Image</AlertTitle>
          <AlertDescription>
            {notFoodError}
            <br />
            <span className="text-xs mt-2 block">
              Please upload a clear photo of food items such as fruits, vegetables, cooked meals, or baked goods.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {imagePreview && !analyzing && !notFoodError && (
        <div className="rounded-lg overflow-hidden border">
          <img src={imagePreview} alt="Food preview" className="w-full h-48 object-cover" />
        </div>
      )}

      {result && !analyzing && !notFoodError && (
        <div className={`p-6 rounded-lg ${qualityConfig[result.quality].bg} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = qualityConfig[result.quality].icon;
                return <Icon className={`h-8 w-8 ${qualityConfig[result.quality].color}`} />;
              })()}
              <div>
                <h3 className="font-semibold text-lg">{qualityConfig[result.quality].label}</h3>
                <p className="text-sm text-muted-foreground">Confidence: {result.confidence}%</p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              {result.shelfLifeHours}h
            </Badge>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm font-medium mb-1">Analysis:</p>
            <p className="text-sm text-muted-foreground">{result.reasoning}</p>
          </div>
        </div>
      )}
    </CardContent>
  );

  if (!showAsCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Food Quality Analyzer
        </CardTitle>
        <CardDescription>
          Upload a food image to check quality and predict shelf-life
        </CardDescription>
      </CardHeader>
      {content}
    </Card>
  );
}
