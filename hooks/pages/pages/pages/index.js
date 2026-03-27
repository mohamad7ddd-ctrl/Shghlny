import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState('')
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')

  useEffect(() => {
    fetchWorkers()
  }, [selectedJob, selectedNeighborhood])

  const fetchWorkers = async () => {
    setLoading(true)
    let query = supabase
      .from('worker_profiles')
      .select('*')
      .eq('is_active', true)

    if (selectedJob) {
      query = query.eq('job_title', selectedJob)
    }

    if (selectedNeighborhood) {
      query = query.eq('neighborhood', selectedNeighborhood)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (!error) {
      setWorkers(data || [])
    }
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen" dir="rtl">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">شغلني</h1>
        <p className="text-gray-600">دليل خدمات الفنيين في مدينة حمص</p>
      </header>

      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">البحث عن فنيين</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="ابحث بالمهنة..."
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="البحث بحي..."
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">قائمة الفنيين</h2>
        {loading ? (
          <div className="text-center">جاري التحميل...</div>
        ) : workers.length === 0 ? (
          <div className="text-center text-gray-500">لا يوجد فنيين حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div key={worker.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                <h3 className="text-lg font-bold mb-2">{worker.full_name}</h3>
                <p className="text-blue-600 mb-2">{worker.job_title}</p>
                <p className="text-gray-600 mb-1">📍 {worker.neighborhood}</p>
                {worker.min_price && worker.max_price && (
                  <p className="text-gray-600 mb-1">💰 {worker.min_price} - {worker.max_price} ل.س</p>
                )}
                <p className="text-gray-500 text-sm mb-3">{worker.bio}</p>
                <div className="flex justify-between items-center">
                  <a
                    href={`tel:${worker.phone_number}`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    اتصل الآن
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
    }
