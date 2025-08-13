"use client"

import { UserControl } from "@/components/user-control"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, SignOutButton, SignUpButton } from "@clerk/nextjs"
import { useScroll } from "@/hooks/use-scroll"
import { cn } from "@/lib/utils"

export const Navbar = () => {
    const isScrolled = useScroll();
    return (
        <nav className={cn({
            "p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent": !isScrolled,
            "bg-white shadow-md border-b border-muted": isScrolled && "bg-background border-border"
        })}>
            <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.svg"
                        alt="Codex"
                        width={24}
                        height={23}
                    />
                    <span className="text-lg font-semibold"> Codex </span>
                </Link>

                <SignedOut>
                    <div className="flex gap-2 ">
                        <SignUpButton >
                            <Button variant="outline" size="sm">
                                Sign up
                            </Button>
                        </SignUpButton>
                        <SignInButton>
                            <Button size="sm">
                                Sign in
                            </Button>
                    </SignInButton>
                    </div>
                </SignedOut>

                <SignedIn>
                    <UserControl showName={true} />
                </SignedIn>
            </div>
            </nav>
    )
}