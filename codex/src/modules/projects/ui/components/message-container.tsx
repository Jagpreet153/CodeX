import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";
import { MessageLoading } from "./message-loading";
import { Fragment } from "@/generated/prisma/wasm";
interface Props {
    projectId: string;
    activeFragment: Fragment | null;
    setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: Props) => {

    const trpc = useTRPC();
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const lastAssistantMessageIdRef = useRef<string | null>(null);

    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
        projectId
    }, {
         refetchInterval: 5000
    }));
    
    
    useEffect(() => {
        const lastAssistantMessage  = messages.findLast(
            (message) => message.role === "ASSISTANT"
        );

        if (lastAssistantMessage?.fragment
            && lastAssistantMessage.id !== lastAssistantMessageIdRef.current
        ) {
            setActiveFragment(lastAssistantMessage.fragment);
            lastAssistantMessageIdRef.current = lastAssistantMessage.id;
        }
    }, [messages,setActiveFragment]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [messages.length]);


    const lastMessage = messages[messages.length - 1];
    const isLastMessageUser = lastMessage?.role === "USER";
    return (
    <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="pt-1 pr-1">
                    {messages.map(message => (
                        <MessageCard key={message.id}
                            role={message.role}
                            fragment={message.fragment}
                            content={message.content}
                            createdAt={message.createdAt}
                            onFragmentClick={() => { setActiveFragment(message.fragment) }}
                            type={message.type}
                            isActiveFragment={activeFragment?.id === message.fragment?.id}
                        />
                    ))}
                    { isLastMessageUser && <MessageLoading/> }
                    <div ref={bottomRef} />
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none" />
                    <MessageForm projectId={projectId} />
            </div>
    </div>
    )
}

