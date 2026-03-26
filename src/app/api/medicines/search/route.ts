import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  try {
    let medicines
    
    if (query) {
      medicines = await db.medicine.findMany({
        where: {
          OR: [
            { brandName: { contains: query } },
            { generic: { contains: query } },
            { manufacturer: { contains: query } },
          ]
        },
        take: limit,
        skip: offset,
        orderBy: { brandName: 'asc' }
      })
    } else {
      medicines = await db.medicine.findMany({
        take: limit,
        skip: offset,
        orderBy: { brandName: 'asc' }
      })
    }

    return NextResponse.json(medicines)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
