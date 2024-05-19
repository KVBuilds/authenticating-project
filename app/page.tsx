import { Button } from "@/components/ui/Button"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"
import { LoginButton } from "@/components/auth/login-button"

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
})

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className={cn("text-6xl font-semibold text-black drolp-shadow-md", font.className)}>
          Auth
        </h1>
        <p className="text-black text-lg">
          A simple authentication service.
        </p>
        <div>
          <LoginButton mode="secondary">
          <Button variant='secondary' size='lg'>Sign In</Button>
          </LoginButton>
        </div>
      </div>

    </main>
  )
}
