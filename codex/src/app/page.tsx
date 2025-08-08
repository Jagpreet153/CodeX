"use client";
import {Button} from "@/components/ui/button";
import { useMutation} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
const Page = () => {
  const [value, setValue] = useState("");
  const router = useRouter();
  const trpc = useTRPC();
  // const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());
  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: (data) => {
      // toast.success(`Project created successfully: ${data.id}`);
      router.push(`/projects/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    }
  }))

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button disabled={createProject.isPending} onClick={() => {
          createProject.mutate({ value: value });
        }}>
        Submit
        </Button>
        {JSON.stringify(createProject.data, null, 2)}
      </div>
    </div>
  )
 }
export default Page