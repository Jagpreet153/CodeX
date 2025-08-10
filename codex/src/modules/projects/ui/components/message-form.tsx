import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextAreaAutosize from "react-textarea-autosize";
import { toast } from 'sonner'
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useState } from "react";

interface Props{
    projectId: string;
}



const formSchema = z.object({
    value: z.string()
        .min(2, "Value is too short")
        .max(1000, "Value is too long"),
});

export const MessageForm = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: ({data}) => {
            form.reset();
            queryClient.invalidateQueries(trpc.messages.getMan);
            toast.success("Message sent!");
        },
        onError: () => {
            toast.error("Failed to send message.");
        }
    }));


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: ""
        }
    });


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createMessage.mutateAsync({
            value: values.value,
            projectId,
        });
    };

    const [isFocused, setIsFocused] = useState(false);
    const isPending = false; // FIXTION NEEDED
    const isButtonDisabled = isPending  // FIXTION NEEDED
    const showUsage = false;
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    "relative border pt-4 p-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                    isFocused && "shadow-xs",
                    showUsage && "rounded-t-none"
                )}>
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextAreaAutosize
                            {...field}
                            disabled={isPending}

                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            minRows={2}
                            maxRows={8}
                            placeholder="Type your message..."
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)(e);
                                }
                            }}
                        />
                    )}
                />
                <div className="flex items-end justify-between mt-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none 
                            items-center gap-1 rounded border px-1.5 font-mono text-muted-foreground text-[10px] font-medium">
                            <span>⌘ + Enter</span>
                        </kbd>
                        &nbsp; to submit
                    </div>

                    <Button type="submit"
                        disabled={isButtonDisabled}
                        className={cn(
                            "size-8 rounded-full",
                            isButtonDisabled && "bg-muted-foreground border-muted-foreground"
                        )}>
                        {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon />}
                    </Button>

                </div>
            </form>
       </Form>
    );
};
