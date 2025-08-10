"use client"
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessagesContainer } from "../components/message-container";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { Suspense } from "react";
interface Props {
    projectId: string;
};

export const ProjectViews = ({ projectId }: Props) => {
    const trpc = useTRPC();
    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0" >
                <Suspense fallback={<div>Loading...</div>}>
                    <MessagesContainer projectId={projectId} />
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
