import React from "react";
import { LANGUAGE_TO_FLAG } from "../constants";

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    // Use React.createElement to avoid returning raw JSX in a .js file,
    // which can cause unexpected token errors if the JSX transform isn't applied.
    return React.createElement("img", {
      src: `https://flagcdn.com/24x18/${countryCode}.png`,
      alt: `${langLower} flag`,
      className: "h-3 mr-1 inline-block",
    });
  }
  return null;
}
