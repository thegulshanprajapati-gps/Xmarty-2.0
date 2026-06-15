try {
  console.log("Attempting to load root native binding...");
  const rootBinding = require("../node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node");
  console.log("Root native binding loaded successfully!");
} catch (e) {
  console.error("Root native binding failed to load:", e);
}

try {
  console.log("Attempting to load instructordomain native binding...");
  const instructorBinding = require("../instructordomain/node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node");
  console.log("Instructor native binding loaded successfully!");
} catch (e) {
  console.error("Instructor native binding failed to load:", e);
}
