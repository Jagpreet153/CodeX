"use Client"
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery} from "@tanstack/react-query";

export const Client = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text: "hello" }));
    return (
        <div>
            {JSON.stringify(data)}
        </div> 
    )
}