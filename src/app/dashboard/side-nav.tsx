"use client";

import Link from "next/link";

import { FileIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export function SideNav() {
  const pathname = usePathname();
  return (
    <div className="w-40 flex flex-col gap-4">
      <Link href="/dashboard/files">
        <Button
          className={clsx("flex gap-2", {
            "text-blue-500": pathname.includes("/dashboard/files"),
          })}
          variant={"link"}
        >
          <FileIcon />
          Files
        </Button>
      </Link>
      <Link href="/dashboard/favorites">
        <Button
          className={clsx("flex gap-2", {
            "text-blue-500": pathname.includes("/dashboard/favorites"),
          })}
          variant={"link"}
        >
          <StarIcon />
          Favorites
        </Button>
      </Link>
    </div>
  );
}
