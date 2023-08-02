/**
 * This library is used to generate confirmation tokens needed for certain actions.
 */

import { sign, verify, decode } from 'jsonwebtoken'
import { UserSession } from './types/auth'
const blacklist = new Set(); // Use a Set to store the JWT IDs in the blacklist

export const generateToken = <T extends Object | string>(
  payload: T,
  secret: string,
  expiresIn: string | number | undefined
) => {
  const token = sign(payload, secret, {
    expiresIn 
  })

  return token
}

export const verifyToken = (
  token: string,
  secret: string
): Promise<UserSession> => {
  return new Promise((resolve, reject) => {
    try {
      verify(token, secret, (err, decoded) => {
        if (err || !decoded) {
          return reject(err)
        }

         // Check if the JWT ID is in the blacklist

        const userDecoded = decoded as UserSession
        // Now, convert decoded to UserSession by removing additional properties
       
        if (blacklist.has(userDecoded.id)) {
          throw new Error('JWT is blacklisted'); // You can also create a custom JWT verification error
        }
            
        const userSession: UserSession = {
          id: userDecoded.id,
          email: userDecoded.email,
          role: userDecoded.role,
          name: userDecoded.name,
        }
        resolve(userSession)
      })
    } catch (err) {
      reject(err)
    }
  })
}

// Function to revoke (invalidate) a JWT
export const revokeToken = (token: string) => {
  // Not used yet, just an idea, to work on the scalablity
  const decoded = decode(token);

  if(!decoded){
    throw new Error('Token not valid');
  }

  const userDecoded = decoded as UserSession

  // Add the JWT ID to the blacklist
  if (userDecoded && userDecoded.id) {
    blacklist.add(userDecoded.id);
  }
};
