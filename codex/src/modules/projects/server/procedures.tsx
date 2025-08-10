import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/db"
import { inngest } from "@/inngest/client";
import { z } from "zod";
import {generateSlug} from 'random-word-slugs'
import { TRPCError } from "@trpc/server";

export const projectsRouter = createTRPCRouter({
    getOne: baseProcedure
        .input(z.object({
            id: z.string().min(1, "Project ID is required")
        }))
        .query(async ({ input }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.id
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

    getMany: baseProcedure.query(async () => {
        const projects = await prisma.project.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        return projects;
    }),
    
    getMany: baseProcedure.query(async () => {    
        const projects = await prisma.project.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });
        return projects;
     }),
    create: baseProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, "Message cannot be empty")
                    .max(10000, "Message is too long"),
                // projectId: z.string().min(1, "Project ID is required")
            })
        )
        .mutation(async ({ input }) => {
            // const createMessage = await prisma.message.create({
            //     data: {
            //         ProjectId: input.projectId,
            //         content: input.value,
            //         role: "USER",
            //         type: "RESULT",

            //     }
            // });
            

            const createProject = await prisma.project.create({
                data: {
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

