import OnboardingForm from '@/components/OnboardingForm'
import { getCurrentUser } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const OnboardingPage = async () => {

   const { userId } = await auth();
  
  if (!userId) redirect("/sign-in");
  
  const user = await getCurrentUser();
  
  if (user?.isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <div>
      <OnboardingForm/>
    </div>
  )
}

export default OnboardingPage