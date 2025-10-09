import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface ImpactCertificateProps {
  userName: string;
  greenPoints: number;
  foodSavedKg: number;
  co2SavedKg: number;
  badgeLevel: string;
}

export function ImpactCertificate({
  userName,
  greenPoints,
  foodSavedKg,
  co2SavedKg,
  badgeLevel
}: ImpactCertificateProps) {
  
  const generatePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Background gradient effect (simulated with rectangles)
      doc.setFillColor(240, 253, 244);
      doc.rect(0, 0, 297, 210, 'F');
      
      // Green accent bar at top
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 297, 20, 'F');

      // Title
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.text('FOOD2PLATE', 148.5, 12, { align: 'center' });

      // Certificate of Impact heading
      doc.setFontSize(28);
      doc.setTextColor(34, 197, 94);
      doc.text('Certificate of Impact', 148.5, 45, { align: 'center' });

      // Divider line
      doc.setDrawColor(34, 197, 94);
      doc.setLineWidth(0.5);
      doc.line(50, 52, 247, 52);

      // Presented to
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('This certificate is proudly presented to', 148.5, 65, { align: 'center' });

      // User name
      doc.setFontSize(24);
      doc.setTextColor(34, 197, 94);
      doc.text(userName, 148.5, 78, { align: 'center' });

      // Recognition text
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text('In recognition of outstanding contribution to food waste reduction and community welfare', 148.5, 90, { align: 'center' });

      // Impact stats box
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(40, 100, 217, 70, 3, 3, 'FD');

      // Stats grid
      const statsY = 115;
      const col1X = 70;
      const col2X = 160;
      const col3X = 220;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Green Points', col1X, statsY, { align: 'center' });
      doc.text('Food Saved', col2X, statsY, { align: 'center' });
      doc.text('CO₂ Reduced', col3X, statsY, { align: 'center' });

      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94);
      doc.text(greenPoints.toString(), col1X, statsY + 12, { align: 'center' });
      doc.text(`${foodSavedKg.toFixed(1)} kg`, col2X, statsY + 12, { align: 'center' });
      doc.text(`${co2SavedKg.toFixed(1)} kg`, col3X, statsY + 12, { align: 'center' });

      // Badge level
      doc.setFontSize(14);
      doc.setTextColor(255, 159, 10);
      doc.text(`Achievement Level: ${badgeLevel}`, 148.5, statsY + 35, { align: 'center' });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.text(`Issued on ${date}`, 148.5, 185, { align: 'center' });
      doc.text('Food2Plate - Connecting Surplus Food with Those in Need', 148.5, 195, { align: 'center' });

      // Save the PDF
      doc.save(`Food2Plate_Impact_Certificate_${userName.replace(/\s+/g, '_')}.pdf`);
      
      toast.success('Certificate downloaded! 📜', {
        description: 'Your impact certificate has been generated successfully.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate certificate', {
        description: 'Please try again later.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Impact Certificate</CardTitle>
        <CardDescription>
          Generate a PDF certificate showcasing your contribution to food waste reduction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generatePDF} className="w-full" size="lg">
          <Download className="h-5 w-5 mr-2" />
          Generate PDF Certificate
        </Button>
      </CardContent>
    </Card>
  );
}