import { UserButton } from "@clerk/nextjs";

export default function Header() {
    return(
        <div className="flex flex-row border-b p-2">
            <div className="text-2xl font-bold">
                Cacey Cace Training
            </div>
            <div className="flex-grow"/>
            <UserButton afterSignOutUrl="/welcome"/>
        </div>
    )
}