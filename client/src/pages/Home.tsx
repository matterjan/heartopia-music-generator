import { useState } from "react";
import { Header } from "@/components/Header";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewPanel } from "@/components/PreviewPanel";

export default function Home() {
  const [scoreInput, setScoreInput] = useState<string>(
    "1 2 3 1 | 1 2 3 1\n" +
    "3 4 5 - | 3 4 5 -\n" +
    "5 6 5 4 | 3 1 -"
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 h-[calc(100vh-140px)] min-h-[600px]">
          
          {/* Left Column: Editor */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 lg:p-1.5 flex flex-col hover:shadow-md transition-shadow duration-300">
            <div className="bg-white rounded-xl border border-gray-100 flex-1 p-4 sm:p-6">
              <EditorPanel 
                value={scoreInput} 
                onChange={setScoreInput} 
              />
            </div>
          </section>

          {/* Right Column: Preview */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 lg:p-1.5 flex flex-col hover:shadow-md transition-shadow duration-300">
            <div className="bg-white rounded-xl border border-gray-100 flex-1 p-4 sm:p-6">
              <PreviewPanel input={scoreInput} />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
