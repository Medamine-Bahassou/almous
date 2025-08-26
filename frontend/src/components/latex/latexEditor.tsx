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
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="input" >Input</TabsTrigger>
      </TabsList>

      <TabsContent value="input" className="mt-4 h-full">
        <Textarea
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          placeholder="Your LaTeX code here..."
          className=" font-mono text-sm h-full"
          disabled
        />
      </TabsContent>

      <TabsContent value="preview" className="mt-4 h-full">
        <LatexPreview latexContent={latex} />
      </TabsContent>
    </Tabs>
  )
}
