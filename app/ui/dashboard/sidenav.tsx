import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton, RedirectToSignUp } from '@clerk/nextjs';


export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
        
        ><header>
        
        
        <SignedOut>
            <RedirectToSignUp />
          </SignedOut>
      </header>
          <Link href="/">
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <SignedIn>
              <UserButton appearance={{
        elements: {
          // Customizing the avatar button
          userButtonAvatarBox: {
            width: "40px",
            height: "40px",
            border: "2px solid #4A90E2", // Add border to avatar
            borderRadius: "50%", // Make it circular
          },
          // Styling the dropdown menu
          userButtonPopoverCard: {
            backgroundColor: "#F9FAFB", // Light background color
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add shadow
          },
          // Customizing the sign-out button
          userButtonPopoverActionButton: {
            color: "#FF4136", // Red color for sign-out
            fontSize: "16px", // Larger text
          },
        },
      }} />
            </SignedIn>

          </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
