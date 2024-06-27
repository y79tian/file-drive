import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from 'date-fns'
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { ReactNode } from "react";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
import {
  ImageIcon,
  FileTextIcon,
  GanttChartIcon,
} from "lucide-react";
import { useQuery } from "convex/react";
import { FileCardAction } from "./file-actions";

export function FileCard({
  file,
}: {
  file: Doc<"files"> & {isFavorited: boolean};
}) {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });
  return (
    <Card className="flex flex-col gap-5">
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div className="flex justify-center">{typeIcons[file.type]}</div>
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardAction isFavorited={file.isFavorited} file={file} />
        </div>
      </CardHeader>
      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type == "image" && (
          <Image src={file.url} alt={file.name} width={200} height={100} />
        )}
        {file.type == "pdf" && <FileTextIcon className="w-20 h-20" />}
        {file.type == "csv" && <GanttChartIcon className="w-20 h-20" />}
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-600">
        <div className="flex gap-2 items-center">
          <Avatar className="w-6 h-6 ">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div>  
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  );
}
