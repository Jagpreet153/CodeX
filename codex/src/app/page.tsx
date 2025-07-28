"use client";
import {Button} from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
const Page = () => {
  const [value, setValue] = useState("");
  
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());
  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      toast.success("Message sent successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    }
  }))

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button disabled={createMessage.isPending} onClick={() => {
        createMessage.mutate({ value: value });
      }}>
      Send Message
      </Button>
      {JSON.stringify(messages, null, 2)}
    </div>
  )
 }
export default Page