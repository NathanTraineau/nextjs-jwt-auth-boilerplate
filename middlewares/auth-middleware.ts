import { TokenExpiredError } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../lib/jwt'
import { ApiResponse } from '../lib/types/api'
import { UserSession } from '../lib/types/auth'
import { Middleware } from '../lib/types/middleware'
import { serialize } from 'cookie'; 
import { RefreshApiResponse } from '../pages/api/refresh'

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserSession
}

// middleware.ts
export const authMiddleware: Middleware =  async   <T extends ApiResponse<T>>(
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>,
  next?: Middleware
) => {
  // look for access token inside cookies
  const cookies = req.cookies; // The "cookies" object contains all the cookies sent with the request
  const refreshToken = cookies.refreshToken; 
  
  const accessToken = cookies.accessToken;// 'refreshToken' is the name of the cookie
console.log("qqqqqqqqqqqqqqqq",accessToken)
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: 'Missing accessToken',
    } as T)
  }

  // Check if access token is valid
  try {
    const decoded = await verifyToken(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    )

    if (!decoded) {
      // We try to refresh
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        credentials: 'include', 
      })
        .then(refreshRes => refreshRes.json() as Promise<RefreshApiResponse>)
        if(response?.success){

         const cookieSerialized = serialize('accessToken', response.data?.token || "", {
          sameSite: 'strict',
          path: '/', // Adjust the path based on your requirements
          maxAge: 30 * 24 * 60 * 60, // Expiration time in seconds (30 days in this example)
        });
        req.cookies.accessToken = response.data?.token
      
        // Set the cookie in the response headers
        res.setHeader('Set-Cookie', cookieSerialized);

        console.log("newwwwww",req.cookies.accessToken )
    }
    else{
      return res.status(401).json({
        success: false,
        message: 'You have to login',
      } as T)
    }
    
    } 

    // Add user to request
    req.user = decoded

    // and call next()
    if (next) await next(req, res, undefined)

  } catch (error) {
    if (error instanceof TokenExpiredError) {
      // answer with special error code
      return res.status(498).json({
        success: false,
        message: 'Token expired',
      } as T)
    }

    console.error('AUTH ERROR:', error)
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    } as T)
  }
}
