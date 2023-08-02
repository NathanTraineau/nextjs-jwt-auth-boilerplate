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
  FormLabel,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEye, FiEyeOff } from 'react-icons/fi'

type RegisterData = {
  name: string
  email: string
  password: string
}

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)

  // React hook form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>()

  const toast = useToast()
  const router = useRouter()

  const onSubmit = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Ajoute la propriété "body" contenant les données "data"
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'You have successfully signed up',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })

        // Redirect to home page
        router.push('/two-factor')
      } else {
        // En cas de réponse non ok (erreur du serveur, etc.)
        const errorData = await response.json()
        throw new Error(errorData.message || 'Signup failed')
      }
    } catch (err) {
      toast({
        title: 'Authentication error',
        description: 'Signup failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <VStack spacing={4} align="stretch" maxW="sm" mx="auto" mt={8}>
      <Heading as="h1" size="2xl">
        Sign Up
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            id="name"
            placeholder="Name"
            {...register('name', {
              required: 'Name is required',
            })}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={!!errors.email}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            placeholder="Email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@wanadoo\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          <FormErrorMessage>
            {errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={!!errors.password}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <InputGroup>
            <Input
              id="password"
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
          <FormErrorMessage>
            {errors.password && errors.password.message}
          </FormErrorMessage>
        </FormControl>

        <Button type="submit" mt={4} isLoading={isSubmitting}>
          Sign Up
        </Button>
      </form>
      <LinkBox>
        <Link href="/login">Already have an account? Sign in</Link>
      </LinkBox>
    </VStack>
  )
}

export default RegisterPage
