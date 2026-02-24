import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, X, RotateCcw } from 'lucide-react';
import FingeringEditor from './FingeringEditor';
import HolePositioningEditor from './HolePositioningEditor';
import { useOcarinaColors } from '../hooks/useOcarinaColors';
import { useOcarinaPhoto } from '../hooks/useOcarinaPhoto';
import { useCustomHolePositions } from '../hooks/useCustomHolePositions';
import type { HoleShape, BodyShape } from '../App';
import type { FingeringChart, FingeringPattern } from '../types/fingering';
import { toast } from 'sonner';

interface OcarinaSettingsProps {
  holeShape: HoleShape;
  onHoleShapeChange: (shape: HoleShape) => void;
  bodyShape: BodyShape;
  onBodyShapeChange: (shape: BodyShape) => void;
  fingeringChart: FingeringChart;
  onUpdatePattern: (note: string, pattern: FingeringPattern) => void;
  onResetFingering: () => void;
  onClose?: () => void;
}

export default function OcarinaSettings({
  holeShape,
  onHoleShapeChange,
  bodyShape,
  onBodyShapeChange,
  fingeringChart,
  onUpdatePattern,
  onResetFingering,
}: OcarinaSettingsProps) {
  const { colors, setHoleFill, setHoleStroke, setBodyFill, setBodyOutline, resetToDefaults } = useOcarinaColors();
  const { photoUrl, uploadPhoto, removePhoto } = useOcarinaPhoto();
  const { positions, setPosition, resetToDefaults: resetPositions } = useCustomHolePositions(bodyShape);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      await uploadPhoto(file);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
      console.error(error);
    }

    // Reset the input
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    removePhoto();
    resetPositions();
    toast.success('Photo removed');
  };

  return (
    <div className="space-y-6">
      {/* Shape Settings */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Label htmlFor="hole-shape" className="text-sm font-medium">
            Hole Shape:
          </Label>
          <Select value={holeShape} onValueChange={(value) => onHoleShapeChange(value as HoleShape)}>
            <SelectTrigger id="hole-shape" className="w-[180px]">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">Round</SelectItem>
              <SelectItem value="oval">Oval</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label htmlFor="body-shape" className="text-sm font-medium">
            Body Shape:
          </Label>
          <Select value={bodyShape} onValueChange={(value) => onBodyShapeChange(value as BodyShape)}>
            <SelectTrigger id="body-shape" className="w-[180px]">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">Round</SelectItem>
              <SelectItem value="oval">Oval</SelectItem>
              <SelectItem value="square">Square</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FingeringEditor
          fingeringChart={fingeringChart}
          holeShape={holeShape}
          onUpdatePattern={onUpdatePattern}
          onReset={onResetFingering}
        />
      </div>

      <Separator />

      {/* Color Customization */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Color Customization</h3>
          <Button variant="ghost" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Colors
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hole-fill" className="text-xs">
              Hole Fill (Covered)
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="hole-fill"
                type="color"
                value={colors.holeFill}
                onChange={(e) => setHoleFill(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={colors.holeFill}
                onChange={(e) => setHoleFill(e.target.value)}
                className="flex-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hole-stroke" className="text-xs">
              Hole Border
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="hole-stroke"
                type="color"
                value={colors.holeStroke}
                onChange={(e) => setHoleStroke(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={colors.holeStroke}
                onChange={(e) => setHoleStroke(e.target.value)}
                className="flex-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body-fill" className="text-xs">
              Body Fill
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="body-fill"
                type="color"
                value={colors.bodyFill}
                onChange={(e) => setBodyFill(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={colors.bodyFill}
                onChange={(e) => setBodyFill(e.target.value)}
                className="flex-1 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body-outline" className="text-xs">
              Body Outline
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="body-outline"
                type="color"
                value={colors.bodyOutline}
                onChange={(e) => setBodyOutline(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={colors.bodyOutline}
                onChange={(e) => setBodyOutline(e.target.value)}
                className="flex-1 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Photo Upload */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Custom Ocarina Photo</h3>
        <div className="space-y-4">
          {!photoUrl ? (
            <div>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload Ocarina Photo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, or JPEG (recommended: 400x200px)
                  </p>
                </div>
              </Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={photoUrl}
                    alt="Uploaded ocarina"
                    className="w-32 h-16 object-cover rounded-lg border border-border"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Photo uploaded</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Position the holes below to match your ocarina
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRemovePhoto}>
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>

              <HolePositioningEditor
                photoUrl={photoUrl}
                holeShape={holeShape}
                positions={positions}
                onPositionChange={setPosition}
                onReset={resetPositions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
