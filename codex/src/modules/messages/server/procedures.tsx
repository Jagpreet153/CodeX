import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/db"
import { inngest } from "@/inngest/client";
import {z} from "zod";

export const messageRouter = createTRPCRouter({
    getMany: baseProcedure
         .input(
            z.object({
                projectId: z.string().min(1, "Project ID is required"),
                // value: z.string().min(1, "Message cannot be empty"),
            })
        )
        .query(async ({input}) => {
            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId, 
            },
            orderBy: {

                createdAt: "asc"
            },
            include: {
                    fragment: true
                }
        });
        return messages;
     }),
    create: baseProcedure
        .input(
            z.object({
                value: z.string().min(1, "Message cannot be empty"),
                projectId: z.string().min(1, "Project ID is required")
            })
        )
        .mutation(async ({ input }) => {
            const createMessage = await prisma.message.create({
                data: {
                    projectId: input.projectId,
                    content: input.value,
                    role: "USER",
                    type: "RESULT",

                }
            });
            await inngest.send({
                name: "codeAgentFunction/run",
                data: {
                    value: input.value,
                    projectId: input.projectId
                },
            });
            return createMessage;
        })
})

