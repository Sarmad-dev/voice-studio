import { auth } from "@/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { experimental_nextAppDirCaller } from "@trpc/server/adapters/next-app-dir";
import { prisma } from "@/lib/db";

interface Meta {
  span: string;
}

export const t = initTRPC.meta<Meta>().create();

export const serverActionProcedure = t.procedure
  .experimental_caller(
    experimental_nextAppDirCaller({
      pathExtractor: ({ meta }) => meta ? (meta as Meta).span : 'unknown',
    })
  )
  .use(async (opts) => {
    const session = await auth();

    return opts.next({ ctx: { user: session?.user } });
  });

export const protectedAction = serverActionProcedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  // Always get the latest user data from the database using the email
  // This ensures we always have the correct database ID regardless of auth method
  if (opts.ctx.user.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: opts.ctx.user.email },
    });
    
    if (!dbUser) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found in database",
      });
    }
    
    // Return the context with the database user
    return opts.next({
      ctx: {
        ...opts.ctx,
        user: {
          ...opts.ctx.user,
          id: dbUser.id, // Always use the database ID
        },
        dbUser, // Also include the full database user for convenience
      },
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      user: opts.ctx.user,
    },
  });
});
