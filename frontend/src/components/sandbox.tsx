'use client';

import {
  SandboxProvider,
  SandboxLayout,
  SandboxTabs,
  SandboxTabsList,
  SandboxTabsTrigger,
  SandboxTabsContent,
  SandboxCodeEditor,
  SandboxPreview,
  SandboxConsole,
} from '@/components/ui/shadcn-io/sandbox';
import { AppWindowIcon, CodeIcon, TerminalIcon } from 'lucide-react';

const initialFiles = {
  '/App.js': {
    code: `export default function App() {
  return <h1>Hello World! </h1>;
}`,
    active: true,
  },
};

const Sandbox = () => (
  <SandboxProvider template="react" files={initialFiles}>
    <SandboxLayout>
      <SandboxTabs defaultValue="preview">
        <SandboxTabsList>
          <SandboxTabsTrigger value="code">
            <CodeIcon size={14} /> Code
          </SandboxTabsTrigger>
          <SandboxTabsTrigger value="preview">
            <AppWindowIcon size={14} /> Preview
          </SandboxTabsTrigger>
          <SandboxTabsTrigger value="console">
            <TerminalIcon size={14} /> Console
          </SandboxTabsTrigger>
        </SandboxTabsList>

        <SandboxTabsContent value="code">
          <SandboxCodeEditor showTabs />
        </SandboxTabsContent>

        <SandboxTabsContent value="preview">
          <SandboxPreview showOpenInCodeSandbox={false} />
        </SandboxTabsContent>

        <SandboxTabsContent value="console">
          <SandboxConsole />
        </SandboxTabsContent>
      </SandboxTabs>
    </SandboxLayout>
  </SandboxProvider>
);

export default Sandbox;
