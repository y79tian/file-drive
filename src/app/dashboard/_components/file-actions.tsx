  import { Doc, Id } from "../../../../convex/_generated/dataModel";
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
  } from "@/components/ui/alert-dialog";
  import { useState } from "react";
  import { useMutation } from "convex/react";
  import { api } from "../../../../convex/_generated/api";
  import { useToast } from "@/components/ui/use-toast";
  import { Protect } from "@clerk/nextjs";
  
  export function FileCardAction({
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