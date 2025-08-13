
import { Navbar } from "@/modules/home/ui/components/navbar";

interface Props {
    children: React.ReactNode;
};


const Layout = ({ children }: Props) => {
    return (
        <main className="flex flex-col min-h-screen max-h-screen">
            <div className="flex-1 flex-col flex px-4 pb-4">
                <Navbar />
                <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)]
                [background-size:16px_16px]"/>
                {children}
            </div>
       </main>
    );
};

export default Layout;
