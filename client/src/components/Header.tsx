import { Music } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none font-display text-gray-900">
              ScoreEditor
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Numeric Music Notation
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
          <span>v1.0.0</span>
          <span className="w-px h-4 bg-border"></span>
          <span>Offline Mode</span>
        </div>
      </div>
    </header>
  );
}
