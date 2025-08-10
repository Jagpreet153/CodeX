import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
interface Props {
    projectId: string;
}

export const MessagesContainer = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({ projectId }));

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
                            isActiveFragment={false}
                            onFragmentClick={() => { }}
                            type={message.type}
                        />
                    ))}
                </div>
            </div>
            <div className="relative p-3 pt-1">
                <MessageForm projectId={projectId} />
            </div>
    </div>
    )
}

