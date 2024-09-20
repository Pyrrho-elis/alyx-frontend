import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'

export function useUser() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()
	const supabase = createClient()

	useEffect(() => {
		const getUser = async () => {
			try {
				const { data: { user } } = await supabase.auth.getUser()
				if (user) {
					setUser(user)
				} else {
					router.push('/login')
				}
			} catch (error) {
				console.error('Error fetching user:', error)
			} finally {
				setLoading(false)
			}
		}

		getUser()
	}, [router])

	const logout = useCallback(async () => {
		try {
			await supabase.auth.signOut()
			setUser(null)
			router.push('/login')
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}, [router, supabase.auth])

	return { user, loading, logout }
}