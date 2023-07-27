
import {
    VStack,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    LinkBox,
    Button,
    FormControl,
    Text,
    useToast,
  } from '@chakra-ui/react'
  import Link from 'next/link'
  import { useRouter } from 'next/router'
  import { useState } from 'react'
  
  import { useForm } from 'react-hook-form'
  import { FiEye, FiEyeOff } from 'react-icons/fi'
  import { useAuth } from '../../providers/auth/AuthProvider'
  
  const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState<boolean>(false)
  
    // React hook form
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<LoginData>()
  
    const toast = useToast()
    const router = useRouter()
    const { logIn } = useAuth()
  
    const onSubmit = async (data: LoginData) => {
      await logIn(data)
        .then(() => {
          toast({
            title: 'Success',
            description: 'You have successfully sign up',
            status: 'success',
            duration: 5000,
            isClosable: true,
          })
  
          // Redirect to home page
          router.push('/two-factor')
        })
        .catch(err => {
          toast({
            title: 'Authentication error',
            description: err.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        })
    }
  
    return (
        <VStack spacing={4} align="stretch" maxW="sm" mx="auto" mt={8}>
          <Heading as="h1" size="2xl">
            Log In
          </Heading>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={!!errors.email}>
              <Input
                placeholder="Email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@amaris\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </FormControl>
    
            {/* Affichage de l'erreur */}
            {errors.email && (
              <Text fontSize="sm" color="red.500">
                {errors.email.message}
              </Text>
            )}
    
            <FormControl mt={4} isInvalid={!!errors.password}>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                        value: 6, 
                        message: 'Password should be at least 6 characters long', 
                      },
                  })}
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Show password"
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
    
            {/* Affichage de l'erreur */}
            {errors.password && (
              <Text fontSize="sm" color="red.500">
                {errors.password.message}
              </Text>
            )}
    
            <Button type="submit" mt={4} isLoading={isSubmitting}>
              Log In
            </Button>
          </form>
          <LinkBox>
            <Link href="/signup">Already have an account? Sign in</Link>
          </LinkBox>
        </VStack>
    )
  }
  
  export default RegisterPage
  