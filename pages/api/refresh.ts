import { NextApiResponse } from 'next'
import { verifyToken } from '../../lib/jwt'
import { prisma } from '../../lib/db'
import { withMiddlewares } from '../../middlewares'
import { NextApiRequestWithUser } from '../../middlewares/auth-middleware'
import { generateAccessToken } from '../../lib/auth'
import { ApiResponse } from '../../lib/types/api'
import { UserSession } from '../../lib/types/auth'

export type RefreshApiResponse = ApiResponse<{
  token: string
}>

const refreshRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<RefreshApiResponse>
) => {
  // Read refresh token from body

  const cookies = req.cookies; // The "cookies" object contains all the cookies sent with the request
  const refreshToken = cookies.refreshToken; // 'refreshToken' is the name of the cookie


  // If refresh token is not present, return a 400 response
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Missing refresh token',
    })
  }

  // Ok, decode JWT to get user infos
  try {
    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    )

    // Check if refresh token is valid
    if (decoded) {
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.id,
          email: decoded.email,
        },
      })

      // If user does not exist, return a 401 response
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        })
      } else if(user.refreshToken === refreshToken) {
        const session: UserSession = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        }

        // If user exists, generate new access token
        const token = generateAccessToken(session)
        // return new access token
        return res.status(200).json({
          success: true,
          data: {
            token,
          },
        })
      
    } 
    
    throw new Error('Invalid refresh token')
    
  }
  } catch (e) {
    console.log(e)
    // If they don't match, return a 401 response
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }
}

export default withMiddlewares(refreshRoute)
