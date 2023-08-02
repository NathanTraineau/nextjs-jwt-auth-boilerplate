import Cookie from 'cookie-universal'
import { RefreshApiResponse } from '../pages/login/login'
import { useRouter } from 'next/router'; // Import useRouter hook

/**
 * Fetcher is a wrapper around fetch that adds the necessary headers and handles token refresh
 * @param url The url to fetch
 * @param isRetrying Whether this is a retry after a token refresh
 * @returns The response from the fetch
 */
export const fetcher = <T>(url: string,request:RequestInit,  isRetrying = false): Promise<T> =>
  fetch(url,request)
    .then(async res => {
      // Check if response is ok
      if (res.status == 498) {
        // If not, check if we are already retrying
        if (isRetrying) {
          throw new Error('Unable to refresh token')
        }

        // Token expired, refresh it and retry the request using recursion
        return  fetch('/api/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
          credentials: 'include', 
        })
          .then(refreshRes => refreshRes.json() as Promise<RefreshApiResponse>)
          .then(refreshRes => {
            if (refreshRes.success && refreshRes.data) {
              // Update the new access token in cookies
              const cookie = Cookie()
              cookie.set('accessToken', refreshRes.data.token)
              return refreshRes
            } else {
              throw new Error('Unable to refresh token')
            }
          }).then(() => fetcher<T>(url, request, true))
      } else if (!res.ok) {
        throw new Error(res.statusText)
      } else {
        return res.json() as Promise<T>
      }
    })
    .catch(err => {
      const router = useRouter(); // Initialize useRouter hook
        router.push('/login'); // Redirect to /login page
      throw new Error(err);
    })

