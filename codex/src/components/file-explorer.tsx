import { CopyIcon } from "lucide-react";
import { Hint } from "./hint";
import { Button } from "./ui/button";
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup
} from "./ui/resizable";
import { CodeView } from "./code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbEllipsis,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "./ui/breadcrumb";
import { useCallback, useMemo, useState, Fragment } from "react";
import { TreeView } from "./tree-view";
import { CheckIcon } from "lucide-react";

type FileCollection = { [path: string]: string };

function getLanguageFromExtension(filename: string): string | undefined {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension || "text";
}

interface FileBreadcrumbProps {
  filePath: string;
}

const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegments = filePath.split("/");
  const maxParts = 4;

  const renderedBreadcrumbItems = () => {
    if (pathSegments.length <= maxParts) {
      return pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">{segment}</BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        );
      });
    } else {
      const firstSegment = pathSegments[0];
      const lastSegment = pathSegments[pathSegments.length - 1];
      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstSegment}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{lastSegment}</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>{renderedBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
};

interface FileExplorerProps {
  files: FileCollection;
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) setSelectedFile(filePath);
    },
    [files]
    );

    const [copied, setCopied] = useState(false);

    return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Sidebar Tree */}
      <ResizablePanel
        defaultSize={30}
        minSize={30}
        className="bg-gray-50 border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 overflow-y-auto"
      >
        <TreeView
          data={treeData}
          selectedFile={selectedFile}
          onSelect={handleFileSelect}
        />
      </ResizablePanel>

      <ResizableHandle className="hover:bg-primary transition-colors" />

      {/* File Viewer */}
      <ResizablePanel defaultSize={70} minSize={50} className="flex flex-col">
        {selectedFile && files[selectedFile] ? (
          <div className="flex flex-col h-full">
            {/* Sticky header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 sticky top-0 z-10">
              <FileBreadcrumb filePath={selectedFile} />
              <Hint text="Copy to clipboard" side="bottom" align="start">
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                  onClick={() => {
                    if (selectedFile) {
                        navigator.clipboard.writeText(files[selectedFile]);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                  disabled={copied}
                >
                {copied ? <CheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>

            {/* Scrollable code area */}
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <CodeView
                code={files[selectedFile]}
                lang={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a file to view its content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
