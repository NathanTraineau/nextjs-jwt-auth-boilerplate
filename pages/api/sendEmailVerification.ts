// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import * as auth from '../../lib/auth'
import { UserSession } from '../../lib/types/auth'
import { sendEmail } from '../../lib/mail'
import { SignUpApiResponse } from '../signup/signup'

const emailVerificationRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<SignUpApiResponse>
) => {
  // Extract email and password from request body
  const {  id } = req.body as { id: number; }



  // Check if user exists in database
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })


  // If user does not exist, return a 401 response
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No user found',
    })
  } else {
   
      // Keep only fields defined in SessionUser
      const session: UserSession = {
        id: user.id,
        email: user.email,
        name:user.name,
        role: user.role,
      }

      // should i use this session object to do that ? role, name may change...
      const twoFactorToken = auth.generateTwoFactorToken(session)
      // save refresh token + second factor auth to database
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorToken,
        },
      })


      //  Send email with specified token
      sendEmail({
        to: user.email,
        subject: 'Sign Up',
        text: `Click this link to login...`,
        html: `<a href="http://localhost:3000/two-factor?token=${twoFactorToken}">Click here to login</a>`,
      })

      // return access and refresh token
      return {
        success: true,
      }
    }
  }


export default withMiddlewares(emailVerificationRoute)
