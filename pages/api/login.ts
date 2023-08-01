// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import * as auth from '../../lib/auth'
import { UserSession } from '../../lib/types/auth'
import { LoginApiResponse } from '../login/login'
import emailVerificationRoute from './sendEmailVerification'
import cookie from 'cookie';

const loginRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<LoginApiResponse>
) => {
  // Extract email and password from request body
  const { email, password } = req.body as { email: string; password: string }
console.log("req.body", req.body)
  // If email or password is not present, return a 400 response
  if (!email || !password ) {
    console.log("yyyyyyyyyyyyiii")
    return res.status(400).json({
      success: false,
      message: 'Missing email or password',
    })
  }

  // Check if user exists in database
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })


  // If user does not exist, return a 401 response
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  }else if(!user.emailVerified){ 
       //  Send email with specified token
       
      emailVerificationRoute({body : {id: user.id}}, res)
      return res.status(401).json({
        success: false,
        message: 'You should verify you email first, one email has been sent to you',
      })
      
  } else {
    // If user exists, check if password is correct using auth lib
    if (await auth.verifyPassword(password, user.password)) {
      // Keep only fields defined in SessionUser
      const session: UserSession = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }

      // generate access + refresh token + email token for 2 factor authentication
      const token = auth.generateAccessToken(session)
      const refreshToken = auth.generateRefreshToken(session)

      // save refresh token + second factor auth to database
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken,
        },
      })


      // return access and refresh token
      res.setHeader('Set-Cookie', cookie.serialize('refreshToken', String(refreshToken), {
        httpOnly: true,
        secure:true,
        maxAge: 60 * 60 * 24 * 7 // 1 week
      }));



      
      return res.status(200).json({
        success: true,
        data: {
          token,
          refreshToken,
          session,
        },
      })
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }
  }
}

export default withMiddlewares(loginRoute)
