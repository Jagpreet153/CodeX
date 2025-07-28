import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/db"
import { inngest } from "@/inngest/client";
import {z} from "zod";

export const messaageRouter = createTRPCRouter({
    getMany: baseProcedure.query(async () => {
        const messages = await prisma.message.findMany({
            orderBy: {
                createdAt: "desc"
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
            })
        )
        .mutation(async ({ input }) => {
            const createMessage = await prisma.message.create({
                data: {
                    content: input.value,
                    role: "USER",
                    type: "RESULT",

                }
            });
            await inngest.send({
                name: "codeAgentFunction/run",
                data: {
                    value: input.value
                },
            });
            return createMessage;
        })
})

