import { useState } from "react";

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}) {
  const [hovered, setHovered] = useState(0);

  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`${sizes[size]} transition-transform ${
            !readOnly ? "cursor-pointer hover:scale-110" : "cursor-default"
          }`}
        >
          <span
            className={
              star <= (hovered || value) ? "text-yellow-400" : "text-gray-200"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
