"use client";

import { useState } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";

import UploadButton from "./upload-button";
import { FileCard } from "./file-card";
import { GridIcon, Loader2, RowsIcon } from "lucide-react";
import { SearchBar } from "./search-bar";
import useDebouncedState from "../../hooks/useDebounce";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Label } from "@radix-ui/react-label";

export default function FileBrowser({
  title,
  favoritesOnly = false,
  deletedOnly = false,
}: {
  title: string;
  favoritesOnly?: boolean;
  deletedOnly?: boolean;
}) {
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Doc<'files'>['type'] | "all">("all");

  const debouncedQuery = useDebouncedState<string>(query);

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"
  );
  const filesQuery = useQuery(
    api.files.getFiles,
    orgId ? { orgId, type: type === "all"? undefined: type, favoritesOnly, deletedOnly } : "skip"
  );

  const files =
    organization.isLoaded && user.isLoaded
      ? orgId
        ? filesQuery
        : []
      : undefined;
  const filteredFiles = files
    ? files
        .filter((file) =>
          file.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        .map((file) => ({
          ...file,
          isFavorited: (favorites ?? []).some(
            (favorite) => favorite.fileId === file.fileId
          ),
        }))
    : [];

  const isLoading = files === undefined;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{title}</h1>
        <SearchBar query={query} setQuery={setQuery} />
        <UploadButton />
      </div>
      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center">
          <TabsList className="mb-4">
            <TabsTrigger value="grid" className="flex gap-2 items-center">
              <GridIcon />
              Grid
            </TabsTrigger>
            <TabsTrigger value="table" className="flex gap-2 items-center">
              <RowsIcon />
              Table
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2 items-center">
            <Label htmlFor="type-select">Type Filter</Label>
            <Select value={type} onValueChange={(newType) => { 
              setType(newType as any);
            }}>
                <SelectTrigger id="type-select" className="w-[180px]" defaultValue={"all"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
        </div>
        {isLoading ? (
          <div className="w-full flex flex-col gap-8 items-center mt-24">
            <Loader2 className="h-24 w-24 animate-spin text-gray-500" />
            <div className="text-2xl">Loading Your Files...</div>
          </div>
        ) : filteredFiles && filteredFiles.length > 0 ? (
          <>
            <TabsContent value="grid">
              <div className="grid grid-cols-3 gap-4">
                {filteredFiles?.map((file) => {
                  return <FileCard key={file._id} file={file} />;
                })}
              </div>
            </TabsContent>
            <TabsContent value="table">
              <DataTable columns={columns} data={filteredFiles} />
            </TabsContent>
          </>
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
      </Tabs>
    </div>
  );
}
