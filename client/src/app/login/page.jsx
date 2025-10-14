import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import Logo from "../../../public/logo.svg"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Section */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative hidden lg:flex items-center justify-center bg-gray-100/20">
        <Image
          src={Logo}
          alt="Company Logo"
          width={500}
          height={600}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
