import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function WorkerDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  useEffect(() => {
    if (profile) {
      fetchRequests()
      fetchReviews()
    }
  }, [profile])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        client:users(full_name, phone_number)
      `)
      .eq('worker_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setRequests(data || [])
    }
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        client:users(full_name)
      `)
      .eq('worker_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setReviews(data || [])
    }
  }

  const updateRequestStatus = async (requestId, newStatus) => {
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId)

    if (!error) {
      fetchRequests()
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen" dir="rtl">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          يرجى إكمال ملفك الشخصي أولاً
        </div>
        <Link href="/worker/profile" className="bg-blue-600 text-white px-4 py-2 rounded inline-block">
          إكمال الملف الشخصي
        </Link>
      </div>
    )
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">لوحة تحكم العامل</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← العودة للرئيسية
        </Link>
      </div>

      {/* نبذة عن العامل */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{profile.full_name}</h2>
            <p className="text-blue-600 mb-2">{profile.job_title}</p>
            <p className="text-gray-600">📍 {profile.neighborhood}</p>
            {profile.years_experience && (
              <p className="text-gray-600">📅 {profile.years_experience} سنوات خبرة</p>
            )}
            {profile.min_price && profile.max_price && (
              <p className="text-gray-600">💰 {profile.min_price} - {profile.max_price} ل.س</p>
            )}
            <p className="text-gray-600">📞 {profile.phone_number}</p>
            <p className="text-gray-700 mt-2">{profile.bio}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">{avgRating}</div>
            <div className="text-gray-500">⭐ ({reviews.length} تقييم)</div>
          </div>
        </div>
        <Link href="/worker/profile" className="inline-block mt-4 text-blue-600 hover:underline">
          تعديل الملف الشخصي
        </Link>
      </div>

      {/* الطلبات الواردة */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">📋 الطلبات الواردة</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500">لا توجد طلبات حالياً</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{req.client?.full_name || 'زبون'}</p>
                    <p className="text-gray-600 text-sm">📞 {req.client?.phone_number}</p>
                    <p className="text-gray-600 text-sm mt-1">{req.description}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(req.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                  <div>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'accepted')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        قبول
                      </button>
                    )}
                    {req.status === 'accepted' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'completed')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        إكمال
                      </button>
                    )}
                    {req.status === 'completed' && (
                      <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">
                        مكتمل
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* التقييمات والتعليقات */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">💬 آراء الزبائن</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">لا توجد تعليقات حتى الآن</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{review.client?.full_name}</span>
                  <span className="text-yellow-500">{"⭐".repeat(review.rating)}</span>
                </div>
                <p className="text-gray-600 mt-1">{review.comment}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(review.created_at).toLocaleDateString('ar')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
    }
