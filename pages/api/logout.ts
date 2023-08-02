// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import cookie from 'cookie';
import { ApiResponse } from '../../lib/types/api'
import { verifyToken } from '../../lib/jwt';

const logoutRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) => {
  // Extract email and password from request body

  
  const cookies = req.cookies; // The "cookies" object contains all the cookies sent with the request
  const refreshToken = cookies.refreshToken; // 'refreshToken' is the name of the cookie

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Already logout',
    })
  }

  // Ok, decode JWT to get user infos
  try {
    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    )


      // save refresh token + second factor auth to database
      await prisma.user.update({
        where: {
          id: Number(decoded.id),
          email: decoded.email,
        },
        data: {
          refreshToken : '',
        },
      })


      // return access and refresh token
      const cookieOptions = {
        httpOnly: true,
        secure:true,
        expires: new Date(0), // Set expiration to a past date to delete the cookie
      path:'/api'
      };
      res.setHeader('Set-Cookie', cookie.serialize('refreshToken', '', cookieOptions));
    
     
      return res.status(200).json({
        success: true,
      })
  
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Not logged in',
      })
  }
}

export default withMiddlewares(logoutRoute)
