import { createContext, useContext, useEffect, useState } from 'react'
import { UserSession } from '../../lib/types/auth'
import { LoginApiResponse } from '../../pages/login/login'
import Cookies  from 'universal-cookie';
import { useRouter } from 'next/router';


interface AuthContextData {
  currentUser: UserSession | null
  logIn: (_data: LoginData) => Promise<void>
  logOut: () => void
}

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthContext = createContext<AuthContextData>({
  currentUser: null,
  logIn: () => Promise.resolve(),
  logOut: () => {},
})

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)

  const router = useRouter(); // Get the router instance

  const cookies = new Cookies();

  // Watch currentUser
  useEffect(() => {
    if (!currentUser) {
        const user = cookies.get('currentUser');
        console.log(user)
        setCurrentUser(user ? typeof user === 'object' ? user : JSON.parse(user)  as UserSession : null);
    }
  }, [currentUser, setCurrentUser]);



  const logIn = async (data: LoginData) => {
    return new Promise<void>((resolve, reject) => {
      // Send data to API
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(res => res.json() as Promise<LoginApiResponse>)
        .then(res => {
          if (res.success && res.data) {
            // save access token in cookies
         
            cookies.set('accessToken', res.data.token, {
              path: '/',
            });


            cookies.set('currentUser', res.data.session, {
              path: '/',
            });      
            
    

            // save user data inside state
            setCurrentUser(res.data.session)

            // set auth state
            resolve()
          } else {
            reject(new Error(res.message))
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  const logOut = async () => {

    await fetch('/api/logout')

    // Clear provider state
    setCurrentUser(null)

    

    //Remove cookies
    cookies.set('accessToken', "", {
      path: '/',
    });

    cookies.set('currentUser', "", {
      path: '/',
    });

    cookies.set('refreshToken', "", {
      httpOnly:true,
      secure:true,
      path: '/',
    });    
    
    router.push('/login');

  }

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  // Custom hook to use auth context
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext, AuthProvider, useAuth }
