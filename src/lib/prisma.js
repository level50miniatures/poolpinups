import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = global;
delete globalForPrisma.prisma; // THIS IS CRITICAL TO CLEAR THE BROKEN CACHED INSTANCE!

const url = (process.env.DATABASE_URL && process.env.DATABASE_URL !== "undefined")
  ? process.env.DATABASE_URL
  : 'file:dev.db';

const authToken = process.env.DATABASE_AUTH_TOKEN;

const adapter = authToken
  ? new PrismaLibSql({ url, authToken })
  : new PrismaLibSql({ url });

export const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
