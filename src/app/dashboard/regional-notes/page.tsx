import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RegionalNoteList } from '@/components/regional/RegionalNoteList'

export default async function RegionalNotesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Regional Notes</h1>
        <p className="text-gray-500 mt-1">Country-specific tips, customs and advice</p>
      </div>
      <RegionalNoteList />
    </div>
  )
}
