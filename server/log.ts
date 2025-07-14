const isProduction = process.env.NODE_ENV === "production";

export const log = (...args: any[]) => {
  if (isProduction) {
    console.log(...args);
  } else {
    // your fancy dev logger, like using chalk or emojis
    console.log("🛠️ ", ...args);
  }
};
