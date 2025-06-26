import { UserRegistrationForm } from '@/components/auth/UserRegistrationForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register - Trivia Game Platform',
  description: 'Create your account to start playing trivia games',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Join Our Trivia Community
        </h1>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <UserRegistrationForm />
        </div>
      </div>
    </div>
  )
} 