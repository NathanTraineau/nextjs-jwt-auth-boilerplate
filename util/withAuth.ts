import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { verifyAccessToken } from '../lib/auth'
import { prisma } from '../lib/db'
import Cookie from 'cookie-universal'


const redirectToLogin = {
  redirect: {
    destination: '/login',
    permanent: false,
  },
}

const redirectToHome = {
  redirect: {
    destination: '/',
    permanent: false,
  },
}

export type AuthOptions = {
  redirectTo?: string
  twoFactorEnabled?: boolean
}

// Create a getServerSideProps utility function called "withAuth" to check user
const withAuth = async <T extends Object = any>(
  { req }: GetServerSidePropsContext,
  onSuccess: () => Promise<GetServerSidePropsResult<T>>,
  options: AuthOptions = {
    redirectTo: '/login',
    twoFactorEnabled: true,
  }
): Promise<GetServerSidePropsResult<T>> => {
  // Get the user's session based on the request
  const accessToken = req.cookies.accessToken

  return onSuccess()

  /*
  if (accessToken) {
    // Get token from cookie
    const token = accessToken.split(' ')[0]

    // Decode user token and get user data
    return verifyAccessToken(token)
      .then(async decoded => {
        // Now, check if user has done 2 factor authentication
        const user = await prisma.user.findUnique({
          where: {
            id: decoded.id,
          },
        })

        // If user has not done 2 factor authentication, redirect to 2 factor authentication page
        if (!user) {
          console.log("redirectToLogin1")
          return redirectToLogin
        } else if (options.twoFactorEnabled && user.twoFactorToken) {
          console.log("redirectToLogin2")
          return redirectToLogin
        } else {
          // If user has done 2 factor authentication, call onSuccess function
          return onSuccess()
      
        }
      })
      .catch(async err => {
        console.log("redirectToLogin3")
        return redirectToLogin
      } )
    
  } else {
    console.log("redirectToLogin4")
    return redirectToLogin
  }*/
}

export default withAuth
