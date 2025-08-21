"use client"

import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LatexPreview from "@/components/latex/latexPreview"
import { useLatex } from "@/context/LatexContext"

export default function LatexEditor() {
  const { latex, setLatex } = useLatex()

  return (
    <Tabs defaultValue="input" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="input">Input</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="input" className="mt-4 h-full">
        <Textarea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="Enter your LaTeX code here..."
          className="h-[calc(100vh-150px)] font-mono text-sm"
        />
      </TabsContent>

      <TabsContent value="preview" className="mt-4 h-full">
        <LatexPreview latexContent={latex} />
      </TabsContent>
    </Tabs>
  )
}
