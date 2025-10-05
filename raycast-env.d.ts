/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Exa API Key - Your Exa API key for authentication */
  "apiKey": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `ask-exa` command */
  export type AskExa = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `ask-exa` command */
  export type AskExa = {
  /** What would you like to know? */
  "question": string
}
}

