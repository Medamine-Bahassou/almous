'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Response } from "@/components/ui/shadcn-io/ai/response";
import { fetchModels } from "@/lib/models";
import { Card, CardHeader } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Type for our model structure
type Model = {
  id: string;
  name: string;
};

export default function Readme() {
  const [repoLink, setRepoLink] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const [selectedLangauge, setSelectedLanguage] = useState<{id:string,name:string}>({ id: "english", name: "English" });
  const languages = [
    { id: "english", name: "English" },
    { id: "french", name: "French" },
    { id: "arabic", name: "Arabic" },
  ]

  // Fetch models on component mount
  useEffect(() => {
    async function loadModels() {
      try {
        const fetchedModels = await fetchModels("pollination");
        const formattedModels = fetchedModels.map(([id, name]: [string, string]) => ({ id, name }));
        setModels(formattedModels);
        if (formattedModels.length > 0) {
          setSelectedModel(formattedModels[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch models.");
      }
    }
    loadModels();
  }, []);

  // Generate README using the SSE parsing logic from ChatPage
  const handleGenerate = async () => {
    if (!selectedModel) {
      setError("Please select a model.");
      return;
    }

    setResult('');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/readme-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: repoLink,
          provider: "pollination",
          model: selectedModel.id
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      if (!res.body) throw new Error("Response body is null.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // =================================================================
      // CORE LOGIC CHANGE: Adopted from your ChatPage component
      // This loop correctly parses the Server-Sent Events (SSE) stream.
      // =================================================================
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep the last, possibly incomplete line

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataContent = line.substring(5).trim();
            if (!dataContent) continue;

            try {
              const parsed = JSON.parse(dataContent);

              // Extract the text content from the parsed JSON object
              const chunkText = parsed.text;
              if (typeof chunkText === 'string') {
                setResult(prev => prev + chunkText);
              }
            } catch (e) {
              console.warn("Could not parse SSE JSON chunk:", dataContent, e);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex border divide-border w-full h-[100vh]  ">

      {/* readme preview */}
      <div className="flex flex-col items-center  w-7/12 h-full ">
        <div className="w-full max-w-4xl h-full overflow-auto p-4 bg-white dark:bg-neutral-950">
          {loading && !result ? (
            <div className="flex justify-center items-center h-full">
              <div className="loader"></div>
            </div>
          ) : (
            <div className="p-2">
              <Response>
                {result || "Enter a repository URL and click 'Generate' to see the result here."}
              </Response>
            </div>
          )}
        </div>
      </div>


      {/* parameters */}
      <Card className=" flex flex-col justify-between rounded-none border-l p-6 w-5/12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl pb-6">
            README Generator
          </h1>

          {/* models */}
          <Label htmlFor="models" >
            Models:
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id="models" variant="outline" className="  flex justify-between ">
                <span className="truncate">{selectedModel?.name || "Select a model"}</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-60" align="start" >
              {models.map((model) => (
                <DropdownMenuItem key={model.id} onSelect={() => setSelectedModel(model)}>
                  {model.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* repo link */}
          <Label htmlFor="models"  >
            Repository Link:
          </Label>
          <div className="flex flex-col md:flex-row gap-2 w-full  items-center  ">
            <Input
              placeholder="https://github.com/user/repo"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              className="flex-1"
            />

          </div>

          <Separator className="my-4" />


          {/* languages */}
          <Label htmlFor="models"  >
            Language:
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id="language" variant="outline" className="  flex justify-between ">
                <span className="truncate">{selectedLangauge?.name || "Select a model"}</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-60" align="start" >
              {languages.map((language) => (
                <DropdownMenuItem key={language.id} onClick={()=> setSelectedLanguage(language)} >
                  {language.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>


          {/* title optional */}
          <Label htmlFor="title"  >
            Project Title: (optional)
          </Label>
          <div className="flex flex-col md:flex-row gap-2 w-full  items-center  ">
            <Input
              placeholder="Title"
              className="flex-1"
            />

          </div>

        </div>


        {/* generate button */}
        <div className="flex justify-end">
          <Button className="" onClick={handleGenerate} disabled={loading || !repoLink || !selectedModel}>
            {loading ? "Generating..." : "Generate "}
          </Button>
        </div>
        {
          error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md w-full max-w-3xl text-center">
              {error}
            </div>
          )
        }
      </Card >

    </div >

  );
}