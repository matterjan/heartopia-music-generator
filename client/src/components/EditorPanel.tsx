import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

interface EditorPanelProps {
  value: string;
  onChange: (val: string) => void;
}

export function EditorPanel({ value, onChange }: EditorPanelProps) {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
          Input Score
          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Editor
          </span>
        </Label>
        
        <div className="group relative">
          <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
          <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <p className="mb-2 font-semibold">Quick Tips:</p>
            <ul className="space-y-1 list-disc pl-3 text-gray-300">
              <li>Use numbers 1-7 for notes</li>
              <li>Use | for bar lines</li>
              <li>Use space to separate notes</li>
              <li>New lines create new staff lines</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl -m-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="1 2 3 | 4 5 6..."
          className="h-[500px] sm:h-full resize-none font-mono text-lg leading-relaxed p-6 rounded-xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 shadow-sm bg-white custom-scrollbar"
          spellCheck={false}
        />
      </div>
      
      <p className="text-xs text-muted-foreground pl-1">
        Supports multi-line input. Layout updates automatically.
      </p>
    </div>
  );
}
