"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";

import UploadButton from "./upload-button";
import { FileCard } from "./file-card";
import { Loader2 } from "lucide-react";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");

  const isLoading = files === undefined;
  return (
    <main className="container mx-auto pt-12">
      {isLoading&& (
        <div className="flex flex-col gap-8 items-center mt-24">
          <Loader2 className="h-24 w-24 animate-spin text-gray-500" />
          <div className="text-2xl">Loading...</div>
        </div>
      )}

      {!isLoading && files.length === 0 && (
        <div className="flex flex-col gap-8 items-center mt-24">
          <Image
            alt="an image of empty data"
            src="/empty.svg"
            width="300"
            height="300"
          />
          <div className="text-2xl">
            You have no files, go ahead and upload one!
          </div>
          <UploadButton />
        </div>
      )}
      {!isLoading && files.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Your Files</h1>
            <UploadButton />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {files?.map((file) => {
              return <FileCard key={file._id} file={file} />;
            })}
          </div>
        </div>
      )}
    </main>
  );
}
