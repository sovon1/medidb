import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const generic = await db.generic.findUnique({
      where: { id: parseInt(id) }
    })

    if (!generic) {
      return NextResponse.json({ error: 'Generic not found' }, { status: 404 })
    }

    // Find related medicines
    const medicines = await db.medicine.findMany({
      where: { generic: generic.name },
      take: 50,
      orderBy: { brandName: 'asc' }
    })

    return NextResponse.json({ generic, medicines })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch generic' }, { status: 500 })
  }
}
