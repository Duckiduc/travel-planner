import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ChecklistTemplateList } from '@/components/checklist/ChecklistTemplateList'

export default async function ChecklistTemplatesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Checklist Templates</h1>
        <p className="text-gray-500 mt-1">Reusable packing and preparation templates</p>
      </div>
      <ChecklistTemplateList />
    </div>
  )
}
