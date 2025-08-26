"use client";

import { useState, useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LatexProvider, useLatex } from "@/context/LatexContext";

// 1. Define props for the component for type safety and clarity.
interface LatexPreviewProps {
  /** The full string content, which may contain LaTeX code blocks. */
  latexContent: string | null | undefined;
}

// 2. Renamed the component to be more descriptive and accept props.
export default function LatexPreview({ latexContent }: LatexPreviewProps) {

  const { latex } = useLatex();


  // State for the PDF URL and loading status remains the same.
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 3. Added state to store the cleanly extracted LaTeX code.
  // This avoids re-extracting it in multiple places.
  const [extractedLatex, setExtractedLatex] = useState<string | null>(null);

  const overleafFormRef = useRef<HTMLFormElement>(null);
  const overleafTextareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Extracts LaTeX code from a markdown-style code block.
   * It first looks for ```latex, then falls back to a generic ```.
   */
  // function extractLatex(content: string): string | null {
  //   let match = content.match(/```latex\s*([\s\S]*?)```/i);
  //   if (!match) {
  //     match = content.match(/```\s*([\s\S]*?)```/i);
  //   }
  //   return match ? match[1].trim() : null;
  // }

  // 4. The core logic is now in a useEffect that reacts to changes in the `latexContent` prop.
  useEffect(() => {
    // If there's no content, reset everything.
    if (!latexContent) {
      setPdfUrl(null);
      setExtractedLatex(null);
      setLoading(false);
      return;
    }

    // const latexOnly = extractLatex(latexContent);
    const latexOnly = latex ; 
    setExtractedLatex(latexOnly); // Store the extracted code

    if (!latexOnly) {
      console.warn("No valid LaTeX code block found in the provided content.");
      setPdfUrl(null); // Ensure no old PDF is shown
      return;
    }

    // Set loading state and prepare the URL for the iframe.
    setLoading(true);
    const encodedLatex = encodeURIComponent(latexOnly);
    const url = `https://latexonline.cc/compile?text=${encodedLatex}`;
    setPdfUrl(url);

  }, [latex]); // This effect runs whenever the prop changes.

  const openInOverleaf = () => {
    // 5. Improved the Overleaf logic to use the extracted LaTeX.
    if (overleafTextareaRef.current && overleafFormRef.current && extractedLatex) {
      overleafTextareaRef.current.value = extractedLatex; // Put only the clean LaTeX in the form
      overleafFormRef.current.submit();
    }
  };

  // 6. Simplified the render logic. If no content, show placeholder.
  if (!latexContent || !extractedLatex) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-muted dark:bg-muted">
        <div className="flex flex-col items-center justify-center   opacity-50">
          <FileText className="h-10 w-10" />
          <p className="mt-2 text-sm">No LaTeX Preview Available</p>
        </div>
      </div>
    );
  }

  return (

    <div className="h-full w-full">
      {/* Header with Preview label and Overleaf button */}
      <div className="flex items-center justify-between p-2">
        <div className="px-2 text-sm text-slate-500">
          <p>Preview</p>
        </div>
        <Button
          onClick={openInOverleaf}
          type="button"
          variant="outline"
          size="sm"
        >
          Edit in Overleaf
        </Button>
      </div>

      {/* PDF Viewer Area */}
      <div className="relative h-[calc(100%-40px)]">
        {loading && (
          <div className="absolute inset-0 h-full flex flex-col justify-center items-center gap-4 p-8">
            <div className="loader"></div>
          </div>
        )}
        
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            title="LaTeX PDF Preview"
            className="rounded-lg border"
            onLoad={() => setLoading(false)} // Hide skeleton when PDF is loaded
            onError={() => setLoading(false)} // Also hide on error
          />
        )}
      </div>

      {/* Hidden form for Overleaf submission */}
      <form
        ref={overleafFormRef}
        action="https://www.overleaf.com/docs"
        method="post"
        target="_blank"
        className="hidden"
      >
        <textarea
          ref={overleafTextareaRef}
          name="snip"
          readOnly
          value={extractedLatex || ""} // Use value instead of defaultValue
        />
      </form>
    </div>

  );
}