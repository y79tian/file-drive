import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistance, formatRelative, subDays } from 'date-fns'
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  TrashIcon,
  ImageIcon,
  FileTextIcon,
  GanttChartIcon,
  StarIcon,
  StarHalf,
  UndoIcon,
  FileIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { ReactNode } from "react";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";

function FileCardAction({
  file,
  isFavorited,
}: {
  file: Doc<"files">;
  isFavorited: boolean;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const restoreFile = useMutation(api.files.restoreFile);
  const toggleFavorite = useMutation(api.files.toggleFavorite);

  const { toast } = useToast();

  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the file for our deletion process. Files are
              deleted periodically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({ fileId: file._id });
                toast({
                  variant: "default",
                  title: "File marked for deletion",
                  description: "Your file will be deleted soon",
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => window.open(file.url, "_blank")}
            className="flex gap-1 text-gray-600 items-center cursor-pointer"
          >
            <div className="flex gap-1 items-center cursor-pointer">
              <FileIcon className="w-4 h-4" />
              Download
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Protect role="org:admin">
            <>
              <DropdownMenuItem
                onClick={() => {
                  file.shouldDelete
                    ? restoreFile({ fileId: file._id })
                    : setIsConfirmOpen(true);
                }}
                className="flex gap-1 items-center cursor-pointer"
              >
                {file.shouldDelete ? (
                  <div className="flex gap-1 items-center cursor-pointer text-green-600">
                    <UndoIcon className="w-4 h-4" />
                    Restore
                  </div>
                ) : (
                  <div className="flex gap-1 items-center cursor-pointer text-red-600">
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </div>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          </Protect>

          <DropdownMenuItem
            onClick={async () => {
              await toggleFavorite({ fileId: file._id });
            }}
            className="flex gap-1 text-gray-600 items-center cursor-pointer"
          >
            {isFavorited ? (
              <div className="flex gap-1 items-center cursor-pointer">
                <StarIcon className="w-4 h-4" />
                Unfavorite
              </div>
            ) : (
              <div className="flex gap-1 items-center cursor-pointer">
                <StarHalf className="w-4 h-4" />
                Favorite
              </div>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function FileCard({
  file,
  favorites,
}: {
  file: Doc<"files">;
  favorites: Doc<"favorites">[];
}) {
  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  });
  const isFavorited = favorites.some(
    (favorite) => favorite.fileId === file.fileId
  );
  return (
    <Card className="flex flex-col gap-5">
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 text-base font-normal">
          <div className="flex justify-center">{typeIcons[file.type]}</div>
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardAction isFavorited={isFavorited} file={file} />
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
