import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function WorkerProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    neighborhood: '',
    years_experience: '',
    min_price: '',
    max_price: '',
    bio: '',
    phone_number: ''
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setFormData({
        full_name: data.full_name || '',
        job_title: data.job_title || '',
        neighborhood: data.neighborhood || '',
        years_experience: data.years_experience || '',
        min_price: data.min_price || '',
        max_price: data.max_price || '',
        bio: data.bio || '',
        phone_number: data.phone_number || ''
      })
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('worker_profiles')
      .upsert({
        user_id: user.id,
        full_name: formData.full_name,
        job_title: formData.job_title,
        neighborhood: formData.neighborhood,
        years_experience: parseInt(formData.years_experience) || null,
        min_price: parseFloat(formData.min_price) || null,
        max_price: parseFloat(formData.max_price) || null,
        bio: formData.bio,
        phone_number: formData.phone_number,
        is_active: true
      })

    if (error) {
      setError(error.message)
    } else {
      router.push('/worker/dashboard')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" dir="rtl">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">الملف الشخصي للعامل</h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← رجوع
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">المهنة (اكتب بحرية) *</label>
          <input
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
            placeholder="مثال: دهان، سباك، كهربائي، عزل..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">الحي / المنطقة *</label>
          <input
            type="text"
            name="neighborhood"
            value={formData.neighborhood}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
            placeholder="مثال: الوعر، الزهراء، الإنشاءات..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">سنوات الخبرة</label>
          <input
            type="number"
            name="years_experience"
            value={formData.years_experience}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">السعر الأدنى (ل.س)</label>
            <input
              type="number"
              name="min_price"
              value={formData.min_price}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">السعر الأعلى (ل.س)</label>
            <input
              type="number"
              name="max_price"
              value={formData.max_price}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">رقم الهاتف *</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">نبذة عني</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border rounded-md"
            placeholder="اكتب عن خبراتك ومهاراتك..."
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}
        </button>
      </form>
    </div>
  )
      }
