import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/db"
import { inngest } from "@/inngest/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const messageRouter = createTRPCRouter({
    getMany: protectedProcedure
         .input(
            z.object({
                projectId: z.string().min(1, "Project ID is required")
            })
        )
        .query(async ({ input, ctx }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.projectId,
                    userId: ctx.auth.userId
                }
            });

            if (!existingProject) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found"
                });
            }

            const messages = await prisma.message.findMany({
                where: {
                    projectId: input.projectId,
                    project: {
                        userId: ctx.auth.userId,
                    },
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
    create: protectedProcedure
        .input(
            z.object({
                value: z.string().min(1, "Message cannot be empty"),
                projectId: z.string().min(1, "Project ID is required")
            })
        )
        .mutation(async ({ input, ctx }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.projectId,
                    userId: ctx.auth.userId
                }
            });

            if (!existingProject) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found"
                });
            }
            
             try {
                await consumeCredits();
            } 
            catch (error) {
                if (error instanceof Error) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: error.message
                    });
                }

                else {
                    throw new TRPCError({
                        code: "TOO_MANY_REQUESTS",
                        message: "You have  exceeded your usage limits"
                    });
                }
            }

            const createMessage = await prisma.message.create({
                data: {
                    projectId: existingProject.id,
                    content: input.value,
                    role: "USER",
                    type: "RESULT"
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

