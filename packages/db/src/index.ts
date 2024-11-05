import { PrismaClient } from "@prisma/client";

let db: PrismaClient | undefined;

const getPrismaClient = (): PrismaClient => {
  if (!db) {
    db = new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      // In development mode, store the instance in globalThis for hot-reloading support
      (globalThis as any).db = db;
    }
  }
  return db;
};

export default getPrismaClient();