"use client";
import {Button} from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
const Page = () => {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess: () => {
      toast.success("Background job invoked successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to invoke background job: ${error.message}`);
    }
  }))

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Button onClick={() => {
        invoke.mutate({ email: "abcd@gmail.com" });
      }}>
      Invoke background job
      </Button>
   </div>
  )
 }
export default Page