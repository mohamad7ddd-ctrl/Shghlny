import { useAuth } from '../hooks/useAuth'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const { user } = useAuth()
  const [userType, setUserType] = useState(null)

  useEffect(() => {
    if (user) {
      fetchUserType()
    }
  }, [user])

  const fetchUserType = async () => {
    const { data } = await supabase
      .from('users')
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setUserType(data.user_type)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold">مرحباً بك في شغلني</h1>
        <p className="text-gray-600">اختر كيف تريد المتابعة</p>
        
        <div className="space-y-4 mt-8">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            🔍 الدخول كزبون (البحث عن خدمات)
          </Link>
          
          {userType === 'worker' && (
            <Link
              href="/worker/dashboard"
              className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
            >
              🛠️ الدخول كعامل (لوحة التحكم)
            </Link>
          )}
          
          <button
            onClick={() => supabase.auth.signOut()}
            className="block w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
          >
            🚪 تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  )
    }
