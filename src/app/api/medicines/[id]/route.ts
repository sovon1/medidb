import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const medicine = await db.medicine.findUnique({
      where: { id: parseInt(id) }
    })

    if (!medicine) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 })
    }

    // Find related generic info
    const generic = await db.generic.findFirst({
      where: { name: medicine.generic }
    })

    return NextResponse.json({ medicine, generic })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch medicine' }, { status: 500 })
  }
}
