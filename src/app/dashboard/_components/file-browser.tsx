"use client";

import { useState } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";

import UploadButton from "./upload-button";
import { FileCard } from "./file-card";
import { Loader2 } from "lucide-react";
import { SearchBar } from "./search-bar";
import useDebouncedState from "../../hooks/useDebounce";

export default function FileBrowser({
  title,
  favoritesOnly = false,
}: {
  title: string;
  favoritesOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebouncedState<string>(query);

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );
  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId, favoritesOnly } : "skip"
  );
  const filteredFiles = files
    ? files.filter((file) =>
        file.name.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : [];
  const isLoading = files === undefined;
  return (
    <>
      {isLoading && (
        <div className="w-full flex flex-col gap-8 items-center mt-24">
          <Loader2 className="h-24 w-24 animate-spin text-gray-500" />
          <div className="text-2xl">Loading...</div>
        </div>
      )}
      {!isLoading && (files.length > 0 || query) && (
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">{title}</h1>
            <SearchBar query={query} setQuery={setQuery} />
            <UploadButton />
          </div>
          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {filteredFiles?.map((file) => {
                return (
                  <FileCard
                    favorites={favorites ?? []}
                    key={file._id}
                    file={file}
                  />
                );
              })}
            </div>
          ) : (
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
        </div>
      )}
    </>
  );
}
