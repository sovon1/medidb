import path from 'node:path'
import { PrismaClient } from '@prisma/client'

function normalizeDatabaseUrl() {
  const configuredUrl = process.env.DATABASE_URL?.trim()

  if (!configuredUrl) {
    const fallbackPath = path.resolve(process.cwd(), 'db', 'custom.db').replace(/\\/g, '/')
    return `file:${fallbackPath}`
  }

  if (!configuredUrl.startsWith('file:')) {
    return configuredUrl
  }

  const sqlitePath = configuredUrl.slice('file:'.length)

  if (sqlitePath.startsWith('./') || sqlitePath.startsWith('../')) {
    const absolutePath = path.resolve(process.cwd(), sqlitePath).replace(/\\/g, '/')
    return `file:${absolutePath}`
  }

  return configuredUrl
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: normalizeDatabaseUrl(),
      },
    },
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
