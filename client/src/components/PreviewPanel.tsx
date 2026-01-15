import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Share2 } from "lucide-react";
import { useNumericScore } from "@/hooks/use-numeric-score";

interface PreviewPanelProps {
  input: string;
}

export function PreviewPanel({ input }: PreviewPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { downloadPng } = useNumericScore({ text: input, canvasRef });

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
          Preview
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Live
          </span>
        </Label>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="hidden sm:flex gap-2 text-xs font-semibold h-8"
            onClick={() => alert("Share feature coming soon!")}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          <Button 
            size="sm" 
            onClick={downloadPng}
            className="bg-gray-900 hover:bg-gray-800 text-white gap-2 text-xs font-semibold h-8 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            PNGで保存
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-100/50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex items-start justify-center p-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Canvas Wrapper with realistic paper shadow */}
        <div className="relative shadow-2xl shadow-gray-900/10 rounded-sm overflow-hidden bg-white max-w-full max-h-full overflow-auto custom-scrollbar">
          <canvas 
            ref={canvasRef}
            className="block max-w-full"
            style={{ width: 800, height: 600 }} // Default size for initial render
          />
        </div>
      </div>
      
      <div className="sm:hidden w-full">
         <Button 
            onClick={downloadPng}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2 shadow-lg"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
      </div>
    </div>
  );
}
