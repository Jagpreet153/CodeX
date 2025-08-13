"use client"

import { UserButton } from "@clerk/nextjs";
import {dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-theme";

interface Props {
    showName?: boolean;
}

export const UserControl = ({ showName }: Props) => {
    const currentTheme = useCurrentTheme();
    return (
        <UserButton
            showName={showName}
            appearance={{
                elements: {
                    userButtonBox: "rounded-md!",
                    userButtonBoxAvatar: "rounded-full!",
                    userButtonTrigger: "rounded-md!"
                },
                baseTheme: currentTheme === 'dark' ? dark : undefined,
            }}
        />
    )
}