import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/db"
import { inngest } from "@/inngest/client";
import { z } from "zod";
import {generateSlug} from 'random-word-slugs'
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne: protectedProcedure
        .input(z.object({
            id: z.string().min(1, "Project ID is required")
        }))
        .query(async ({ input,ctx }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.id,
                    userId: ctx.auth.userId
                },
            });

            if(!existingProject) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Project not found"
                });
            }
            return existingProject;
        }),
    
    getMany: protectedProcedure.query(async ({ctx}) => {
        const projects = await prisma.project.findMany({
            where: {
                userId: ctx.auth.userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return projects;
     }),
    create: protectedProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, "Message cannot be empty")
                    .max(10000, "Message is too long"),
            })
        )
        .mutation(async ({ input,ctx }) => {
            const createProject = await prisma.project.create({
                data: {
                    userId: ctx.auth.userId,            
                    name: generateSlug(2, { format: 'kebab' }),
                    messages: {
                        create: {
                            content: input.value,
                            role: "USER",
                            type: "RESULT",
                        }
                    }
                }
            });
           
            await inngest.send({
                name: "codeAgentFunction/run",
                data: {
                    projectId: createProject.id,
                    value: input.value
                },
            });
            return createProject;
        })
})

