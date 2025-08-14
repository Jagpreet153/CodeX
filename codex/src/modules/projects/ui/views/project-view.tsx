"use client"
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessagesContainer } from "../components/message-container";
import { ProjectHeader } from "../components/project-header";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs"
import { FragmentWeb } from "../components/fragment-web";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import { EyeIcon, CodeIcon, CrownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import { UserControl } from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";

interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
};

export const ProjectViews = ({ projectId }: Props) => {

    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

    const [tabState, setTabState] = useState<"preview" | "code">("preview");
    const trpc = useTRPC();
    const { has }= useAuth();
    const hasProAccess = has?.({ plan: "pro" });
    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0" >
                    <Suspense fallback={<div>Loading...</div>}>
                        <ProjectHeader projectId={projectId}/>
                </Suspense>
                <Suspense fallback={<div>Loading...</div>}>
                        <MessagesContainer
                            projectId={projectId}
                            activeFragment={activeFragment}
                            setActiveFragment={setActiveFragment}
                        />
                </Suspense>
            </ResizablePanel>

                <ResizableHandle className="hover:bg-primary transition-colors"  />
                
            <ResizablePanel defaultSize={65} minSize={50}>
                    <Tabs
                        className="h-full gap-y-0"
                        defaultValue="preview"
                        value={tabState}
                        onValueChange={(value: string) => setTabState(value as "preview" | "code")}
                    >
                    <div className="w-full flex items-center p-2 gap-x-2 border-b">
                            <TabsList className="h=8 p-0 border-0 rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon />
                                    <span> Demo</span>
                                </TabsTrigger>

                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon />
                                    <span>Code</span>
                                </TabsTrigger>
                            </TabsList>

                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess && <Button asChild size="sm" variant="default">
                                    <Link href='/pricing'>
                                        <CrownIcon />
                                        Upgrade
                                    </Link>
                                </Button>}
                            </div>
                             <UserControl/>
                        </div>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb data={activeFragment} />}
                        </TabsContent>

                        <TabsContent value="code" className="min-h-0" >
                            {   activeFragment?.files
                                && <FileExplorer
                                        files={activeFragment.files as { [path:string]: string }}
                                    />
                            }
                        </TabsContent>
                   </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};
