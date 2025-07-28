import { createTRPCRouter } from '@/trpc/init';
import { messaageRouter } from '@/modules/messages/server/procedures';
export const appRouter = createTRPCRouter({
  messages: messaageRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;