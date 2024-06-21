"use client";

import FileBrowser from "../_components/file-browser";

export default function FavoritePage() {
  return (
    <div>
      <FileBrowser title={"Favorites"} favoritesOnly={true}/>
    </div>
  );
}
