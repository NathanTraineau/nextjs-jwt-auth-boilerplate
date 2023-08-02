import { Box, Divider, Heading, HStack, Text, useToast } from '@chakra-ui/react'
import { InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR, { SWRConfig } from 'swr'
import Navbar from '../components/Navbar'
import NavbarProfile from '../components/NavbarProfile'
import { useAuth } from '../providers/auth/AuthProvider'

import { prisma } from '../lib/db'
import PostLibrary from '../components/PostLibrary'
import { PostsApiResponse } from './api/posts'
import { fetcher } from '../util/fetcher'

export const getServerSideProps = async () => {
  // `getStaticProps` is executed on the server side.
  const posts = await prisma.post.findMany()

  // Little workaround to get NextJS to convert Dates into JSON
  const postsJson = JSON.parse(JSON.stringify(posts))

  const postsApiResponse: PostsApiResponse = {
    success: true,
    data: {
      posts: postsJson,
    },
  }

  return {
    props: {
      fallback: {
        '/api/posts': postsApiResponse, // Empty array if error while fetching data
      },
    },
  }
}

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => {
  const handleClick = async () => {
    try {
      // Effectuez l'appel API vers "api/test"
      const response = await fetch('/api/test')
      if (response.ok) {
        const data = await response.json()
      } else {
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API :", error)
    }
  }

  const { currentUser, logOut } = useAuth()
  const router = useRouter()
  const toast = useToast()

  // Fetch posts using SWR
  const {
    data: posts,
    error,
    mutate,
  } = useSWR<PostsApiResponse>('/api/posts', fetcher, {
    // Ne pas effectuer de requête lors du montage initial
    refreshInterval: 50000, // Rafraîchir les données toutes les 5 secondes
  })

  return (
    <SWRConfig value={{ fallback }}>
      <Navbar
        homeURL="/"
        rightComponent={
          currentUser && [
            <NavbarProfile
              currentUser={currentUser}
              onLogOut={() => {
                // log out
                logOut()
                // redirect to home page
                router.push('/')
              }}
              key="avatar"
            />,
          ]
        }
      />

      <Box marginTop={'60px'} p={6}>
        <Heading>Your profile</Heading>
        <Divider mb={5} />
        {currentUser ? (
          <>
            <HStack>
              <Text fontWeight={'bold'}>User ID</Text>
              <Text>{currentUser.id}</Text>
            </HStack>
            <button onClick={handleClick}>Appeler l'API</button>
            <HStack>
              <Text fontWeight={'bold'}>Email:</Text>
              <Text>{currentUser.email}</Text>
            </HStack>
            <HStack>
              <Text fontWeight={'bold'}>Admin:</Text>
              <Text>{currentUser.role == 'ADMIN' ? 'Yes' : 'No'}</Text>
            </HStack>
            <Heading mt={5}>JWT tokens:</Heading>
            <Divider mb={5} />
          </>
        ) : (
          <Text fontSize="xl">You are not logged in</Text>
        )}

        <Heading mt={5}>Tesing - Post voting</Heading>
        <Divider mb={5} />
        <Text>
          Please, like or dislike the posts below. The data is persisted in the
          DB.
        </Text>

        {/* show library of available posts */}
        <Box>
          <PostLibrary
            posts={posts}
            isLoading={!posts}
            error={error}
            mutate={mutate}
            onVoteError={error => {
              toast({
                title: 'Failed to vote',
                description: (error || '').toString(),
                status: 'error',
                duration: 3000,
                isClosable: true,
              })
            }}
          />
        </Box>
      </Box>
    </SWRConfig>
  )
}

export default HomePage
