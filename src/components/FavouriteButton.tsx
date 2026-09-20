"use client";

import { useEffect, useState } from "react";
import { isFavourite, toggleFavourite } from "@/lib/favourites";

export default function FavouriteButton({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavourite(id));
  }, [id]);

  return (
    <button
      aria-label={fav ? "Remove from favourites" : "Add to favourites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setFav(toggleFavourite(id));
      }}
      className={`transition-transform active:scale-90 ${size === "sm" ? "text-lg" : "text-2xl"}`}
    >
      {fav ? "❤️" : "🤍"}
    </button>
  );
}
