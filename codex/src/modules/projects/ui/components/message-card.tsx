import { Fragment } from "@/generated/prisma";
import { MessageRole } from "@/generated/prisma";
import { MessageType } from "@/generated/prisma";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { ChevronRightIcon, Code2Icon} from "lucide-react";


interface userMessageProps{
    content: string;

}

interface fragmentCardProps {
    fragment: Fragment;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
}




const UserMessage = ({ content }: userMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-10">
            <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
                {content}
            </Card>
        </div>
    );
};

const FragmentCard = ({ fragment, isActiveFragment, onFragmentClick }: fragmentCardProps) => {
    return (
        <button className={cn(
            "flex items-start text-start gap-2 rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
            isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary"
        )}
            onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-4 mt-0.5" />
            <div className="flex flex-col flex-1">
                <span className="text-sm font-medium line-clamp-1">
                    {fragment.title}
                </span>
                <span className="text-sm">preview</span>
            </div>
            <div className="flex items-center justify-center mt-0.5">
                <ChevronRightIcon className="size-4" />
            </div>
        </button>
    )
}

interface AssistantMessageProps{ 
    content: string;
    createdAt: Date;
    isActiveFragment: boolean;
    onFragmentClick: (fragment: Fragment) => void;
    type: MessageType;
    fragment: Fragment | null;
}
const AssistantMessage = ({
    content,
    createdAt,
    isActiveFragment,
    onFragmentClick,
    type,
    fragment
}: AssistantMessageProps) => {
    return (
        <div className={cn(
            "flex flex-col group px-2 pb-4",
            type === "ERROR" && "text-red-700 dark:text-red-500"
        )}> 
            <div className="flex items-center  gap-2 pl-2 mb-2">
                <Image
                    src='/logo.svg'
                    width={18}
                    height={18}
                    className="shrink-0"
                    alt="Codex Logo" />
                
                <span className="text-sm font-medium">Codex</span>
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 ">{format(new Date(createdAt), "HH:mm 'on' MMM dd, yyyy")}</span>
        </div>
            <div className="pl-8.5 flex flex-col gap-y-4 ">
                <span>{content}</span>
                {fragment && type === "RESULT" && (
                    <FragmentCard
                        fragment={fragment}
                        isActiveFragment={isActiveFragment}
                        onFragmentClick={onFragmentClick}
                    />
                )}
                
            </div>
        </div>
    );
};

interface MessageCardProps{
    content: string;
    createdAt: Date;
    isActiveFragment: boolean;
    fragment: Fragment | null;
    onFragmentClick: (fragment : Fragment) => void;
    type: MessageType;
    role: MessageRole;
}

export const MessageCard = ({
    content,
    createdAt,
    isActiveFragment,
    fragment,
    onFragmentClick,
    type,
    role
}: MessageCardProps) => {
    if(role==='ASSISTANT') {
        return (
            <AssistantMessage content={content}
                fragment={fragment}
                createdAt={createdAt}
                isActiveFragment={isActiveFragment}
                onFragmentClick={onFragmentClick}
                type={type}
            />
       )
    } return (
        <div>
            <UserMessage content={content} />
        </div>
       )
};
