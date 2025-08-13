"use client"
import Image from "next/image"

import { PricingTable } from "@clerk/nextjs"
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-theme";



const Page = () => {
    const currentTheme = useCurrentTheme();
    if (!currentTheme) {
        return null; // or a loading state
    }
    return (
        <div className="flex flex-col mx-auto max-w-3xl w-full">
            <section className="space-y-6 pt-[16vh] 2xl:pt-[48]">
                <div className="flex flex-col items-center">
                    <Image
                        src="/logo.svg"
                        alt="codex"
                        width={50}
                        height={50}
                        className="hidden md:block"
                    />
                </div>
                <h1 className="text-xl md:text-3xl text-center font-bold my-3">Pricing</h1>
                <p className="text-center text-muted-foreground text-sm md:text-base">
                    Choose the plan that fits your needs.
                </p>
                <PricingTable
                    appearance={{
                        baseTheme: currentTheme === 'dark' ? dark : undefined,
                        elements: {
                            pricingTableCard: "border! shadow-none! rounded-lg!"
                        }
                    }}
                    />
            </section>
        </div>
    );
};

export default Page;
