import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TripDetail } from '@/components/trips/TripDetail'

export default async function TripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <TripDetail tripId={tripId} />
}
