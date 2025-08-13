import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import TextAutosize from "react-textarea-autosize";
import { toast } from 'sonner'
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useState } from "react";
import { useRouter } from "next/dist/client/components/navigation";
import {PROJECT_TEMPLATES} from '../../constants'
import { useClerk } from "@clerk/nextjs";


const formSchema = z.object({
    value: z.string()
        .min(2, "Value is too short")
        .max(1000, "Value is too long"),
});

export const ProjectForm = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const clerk = useClerk();

    const router = useRouter();

    

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: ""
        }
    });

    const createProject = useMutation(trpc.projects.create.mutationOptions({
        onSuccess: (data) => {
            form.reset();
            trpc.projects.getMany.queryOptions();
            router.push(`/projects/${data.id}`);
        },
        onError: (error) => {
            //pricing error
            toast.error(error.message);
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    }));

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createProject.mutateAsync(
            {
                value: values.value
            }
        );
    };



    const [isFocused, setIsFocused] = useState(false);
    const isPending = createProject.isPending;
    const isButtonDisabled = isPending || !form.formState.isValid;
    return (
        <Form {...form}>
            <section className="space-y-6">
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={cn(
                    "relative border pt-4 p-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
                    isFocused && "shadow-xs"
                )}>
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextAutosize
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
                            isButtonDisabled && "bg-muted-foreground border"
                        )}>
                        {isPending ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon />}
                    </Button>

                </div>
            </form>

            <div className="flex-wrap justify-center gap-2 hidden md:flex max-w-3xl">
                {PROJECT_TEMPLATES.map((template) => (
                    <Button
                        key={template.title}
                        variant="outline"
                        size="sm"
                        className=" bg-white dark:bg-sidebar"
                        onClick={() => {
                            form.setValue("value", template.prompt, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true
                            });
                        }}
                    >
                        {template.emoji} {template.title}
                    </Button>
                ))}
            </div>
        </section>
       </Form>
    );
};
