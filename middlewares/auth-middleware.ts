import { TokenExpiredError } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../lib/jwt'
import { ApiResponse } from '../lib/types/api'
import { UserSession } from '../lib/types/auth'
import { Middleware } from '../lib/types/middleware'

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserSession
}

// middleware.ts
export const authMiddleware: Middleware =  async   <T extends ApiResponse<T>>(
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>,
  next?: Middleware
) => {
  
  const cookies = req.cookies; 
  
  const accessToken = cookies.accessToken;
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
      return res.status(401).json({
        success: false,
        message: 'Access Token not valid',
      } as T)
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
