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

export default function Readme() {
  const [repoLink, setRepoLink] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [models, setModels] = useState<[string, string][]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');

  // Fetch models from backend
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('http://localhost:5000/api/models?provider=pollination');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (!data.models || !Array.isArray(data.models)) throw new Error("Invalid model data");

        const formatted: [string, string][] = data.models.map((m: { id: string, name: string }) => [m.id, m.name]);
        setModels(formatted);
        if (formatted.length) {
          setSelectedModel(formatted[0][0]);
          setSelectedModelName(formatted[0][1]);
        }
      } catch (err: any) {
        console.error(err);
        setError("Failed to load models. Please try again later.");
      }
    }
    fetchModels();
  }, []);

  // Generate README
  const handleGenerate = async () => {
    setResult('');
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/readme-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_link: repoLink, model: selectedModel }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      if (!res.body) throw new Error("Response body is null.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResult(prev => prev + chunk);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 gap-6 w-full h-full">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center">
        <span className="text-red-500">README</span> Generator
      </h1>

      {/* Model selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-52">
            <span className="truncate">{selectedModelName || "Select a model"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {models.map(([id, name]) => (
            <DropdownMenuItem key={id} onSelect={() => { setSelectedModel(id); setSelectedModelName(name); }}>
              {name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Input & generate button */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-3xl items-center">
        <Input
          placeholder="https://github.com/user/repo"
          value={repoLink}
          onChange={(e) => setRepoLink(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleGenerate} disabled={loading || !repoLink || !selectedModel}>
          {loading ? "Generating..." : "Generate README"}
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md w-full max-w-3xl text-center">
          {error}
        </div>
      )}

      {/* Result container */}
      <div className="w-full max-w-4xl h-[60vh] border rounded-lg overflow-auto p-4 bg-white dark:bg-neutral-950">
        {loading && result.length === 0 ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="p-2">

            <Response>
              {result || `

<div align="center">
<img src="https://cdn-icons-png.flaticon.com/512/1205/1205515.png" width="200"/>
</div>

# Project Name

A short description of what this project does and who it's for.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

Explain the purpose of your project, the problems it solves, and the value it provides.

---

## Features

- Feature 1: Brief description
- Feature 2: Brief description
- Feature 3: Brief description

---

## Installation

Clone the repo and install dependencies:

\`\`\`bash
git clone https://github.com/yourusername/project-name.git
cd project-name
npm install
\`\`\`

---

## Usage

Start the project locally:

\`\`\`bash
npm start
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Configuration

Provide any environment variables or configuration settings needed:

\`\`\`env
API_KEY=your_api_key_here
NODE_ENV=development
\`\`\`

---

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository
2. Create a new branch: \`git checkout -b feature-branch\`
3. Make your changes and commit: \`git commit -m "Add new feature"\`
4. Push to your branch: \`git push origin feature-branch\`
5. Open a Pull Request

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

Your Name – [your.email@example.com](mailto:your.email@example.com)  
Project Link: [https://github.com/yourusername/project-name](https://github.com/yourusername/project-name)

---

## Example Code

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

---

## Acknowledgements

- List any resources, tutorials, or inspirations you want to credit.
`}
            </Response>
          </div>

        )}
      </div>
    </div>
  );
}
