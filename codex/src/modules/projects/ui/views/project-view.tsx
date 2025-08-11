"use client"
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessagesContainer } from "../components/message-container";
import { ProjectHeader } from "../components/project-header";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
};

export const ProjectViews = ({ projectId }: Props) => {
    const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
    const trpc = useTRPC();
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

                <ResizableHandle withHandle />
                
            <ResizablePanel defaultSize={65} minSize={50}>
                TODO: PREIVIEW
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};
