// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import { SignUpApiResponse } from '../signup/signup'
import emailVerificationRoute from './sendEmailVerification'
import bcrypt from 'bcrypt'

const signUpRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<SignUpApiResponse>
) => {
  // Extract email and password from request body
  const { email, password, name } = req.body as {
    email: string
    password: string
    name: string
  }

  const encryptedPassword = await bcrypt.hash(password, 10)

  // If email or password is not present, return a 400 response
  if (!email || !encryptedPassword || !name) {
    return res.status(400).json({
      success: false,
      message: 'Missing ane element of the form',
    })
  }

  // Check if user exists in database
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  // If user does not exist, return a 401 response
  if (user) {
    return res.status(401).json({
      success: false,
      message: 'Email already used',
    })
  } else {
    // If user exists, check if password is correct using auth lib

    const createUser = await prisma.user.create({
      data: { id: 7, email, password: encryptedPassword, name },
    })

    console.log(createUser)

    emailVerificationRoute({ body: { id: createUser.id } }, res)
    // return access and refresh token
    return res.status(200).json({
      success: true,
    })
  }
}

export default withMiddlewares(signUpRoute)
