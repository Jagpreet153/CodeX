import { lazy, useState } from "react"
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react"
import { Fragment } from "@/generated/prisma"
import { Button } from "@/components/ui/button"
import { Hint } from "@/components/hint"

interface Props{
    data:Fragment
}


export function FragmentWeb({ data }: Props) {

    const [copied, setCopied] = useState(false);
    const [fragmentKey, setFragmentKey] = useState(0);

    const onRefresh = () => {
        setFragmentKey((prev) => prev + 1);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(data.sandboxUrl || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
                <Hint text="Refresh" side="bottom" align="start">
                    <Button size="sm" variant="outline" onClick={onRefresh}>
                        <RefreshCcwIcon/>
                    </Button>
                </Hint>

                <Hint text="Copy to clipboard" side="bottom" align="center">
                    <Button size="sm" variant="outline" onClick={handleCopy}
                        className="flex-1 justify-start text-start font-normal"
                        disabled={!data.sandboxUrl}
                    >
                    <span className="truncate">
                        {data.sandboxUrl}
                    </span>
                    </Button>
                </Hint>
               

                <Hint text="Open in new tab" side="top" align="start">
                    <Button size="sm" disabled={!data.sandboxUrl} onClick={() => {
                        if (!data.sandboxUrl)
                            return;
                        window.open(data.sandboxUrl, "_blank");
                    }}>
                        <ExternalLinkIcon />
                    </Button>
                </Hint>
            </div>
            <iframe className="h-full w-full "
                sandbox="allow-forms allow-scripts allow-same-origin"
                loading="lazy"
                src={data.sandboxUrl}
                key={fragmentKey}
            >

            </iframe>
        </div>
    )
}