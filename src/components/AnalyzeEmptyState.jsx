import { Brain } from 'lucide-react'

export default function AnalyzeEmptyState() {
    return (
      <div className="rounded-2xl w-full grid place-items-center p-4">
        <div className="text-center">
          {/* Icon block */}
          <div
            aria-hidden
            className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-cyan-500 shadow-[0_10px_20px_rgba(8,145,178,0.35)] grid place-items-center"
          >
            <Brain size={30} color='white' />
          </div>
  
          {/* Heading */}
          <h1 className="text-2xl font-semibold tracking-tight text-cyan-900 ">
            Let's Analyze
          </h1>
  
          {/* Subtext */}
          <p className="mt-3 max-w-xl text-balance text-cyan-800/80 mx-auto">
            Upload your meeting content and click analyze to get AI-powered insights, summaries, and action items.
          </p>
        </div>
      </div>
    );
  }
  