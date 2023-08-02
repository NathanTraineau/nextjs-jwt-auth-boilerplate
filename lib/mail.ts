
import * as sgMail from '@sendgrid/mail'

import { Options } from './types/mail'

export async function sendEmail({ to, subject, text, html }: Options) {

  if(!process.env.SENDGRID_API_KEY || !process.env.SMTP_FROM_ADDRESS) {
    throw new Error('Environment variables not set')
  }
  // create reusable transporter
  sgMail.setApiKey(process.env.SENDGRID_API_KEY )
  const msg = {
    to, // Change to your recipient
    from: process.env.SMTP_FROM_ADDRESS  , 
    subject,
    text,
    html,
  }
  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
      console.log(error.response?.body)
    })
}

export function generateProfileConfirmationBodyPlain(token: string) {
  return `
    Hi,
    You have updated your email address.
    Please click the following link to confirm your new email address:
    ${process.env.APP_URL}/confirm-email/${token}
    Thank you,
  `
}

export function generateProfileConfirmationBodyHTML(token: string) {
  return `
    <p>Hi,</p>
    <p>You have updated your email address.</p> 
    <p>Please click the following link to confirm your your new email address:</p>
    <p><a href="${process.env.APP_URL}/confirm-email/${token}">${process.env.APP_URL}/api/confirm-profile?token=${token}</a></p>
    <p>Thank you,</p>
  `
}

export function generateConfirmRegistrationBodyPlain(token: string) {
  // generate email body as plain text (no html)
  return `
    Please click the following link to confirm your email address:
    ${process.env.APP_URL}/confirm-email/${token}
  `
}

export function generateConfirmRegistrationBodyHTML(token: string) {
  return `
    <h1>Welcome to ${process.env.APP_NAME}</h1>
    <p>
      Please click the following link to confirm your account:
      <a href="${process.env.APP_URL}/confirm-email/${token}">Confirm email</a>
    </p>
  `
}

export function generateForgotPasswordBodyPlain(token: string) {
  return `
    Please click the following link to reset your password:
    ${process.env.APP_URL}/forgot-password/${token}
  `
}

export function generateForgotPasswordBodyHTML(token: string) {
  return `
    <h1>Reset your password</h1>
    <p>
      Please click the following link to reset your password:
      <a href="${process.env.APP_URL}/forgot-password/${token}">Reset password</a>
    </p>
  `
}
