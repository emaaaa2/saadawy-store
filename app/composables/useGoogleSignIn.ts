export function useGoogleSignIn() {
  const supabase = useSupabaseClient()
  const isRedirecting = ref(false)
  const errorMessage = ref('')

  async function signInWithGoogle(next = '/') {
    isRedirecting.value = true
    errorMessage.value = ''

    const redirectTo = `${window.location.origin}/confirm?next=${encodeURIComponent(safeRedirectPath(next))}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' }
      }
    })

    if (error) {
      isRedirecting.value = false
      errorMessage.value = 'Google sign-in is unavailable right now. Please try again.'
    }
  }

  return { signInWithGoogle, isRedirecting, errorMessage }
}
