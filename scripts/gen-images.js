const sharp = require("sharp");
const fs = require("fs");

const animals = ["cat", "cow", "dog", "duck", "elephant", "horse", "lion", "monkey"];
const objects = [
  "ball.png",
  "book.png",
  "chair.png",
  "clock.jpg",
  "cup.png",
  "key.jpg",
  "shoe.jpg",
  "table.png",
];

(async () => {
  let out = "";
  out += 'import type { FlashCardImage } from "@/types/decks";\n\n';
  out += "export const IMAGE_URIS: Record<string, FlashCardImage> = {\n";

  for (const name of animals) {
    const buf = await sharp("public/images/animals/" + name + ".jpg")
      .resize(224, 224, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 68 })
      .toBuffer();
    out +=
      '  "/images/animals/' +
      name +
      '.jpg": { type: "url", value: "data:image/jpeg;base64,' +
      buf.toString("base64") +
      '" },\n';
  }

  for (const f of objects) {
    const ext = f.split(".").pop();
    let img = sharp("public/images/objects/" + f).resize(224, 224, {
      fit: "inside",
      withoutEnlargement: true,
    });
    const buf =
      ext === "png"
        ? await img.png({ compressionLevel: 9 }).toBuffer()
        : await img.jpeg({ quality: 68 }).toBuffer();
    out +=
      '  "/images/objects/' +
      f +
      '": { type: "url", value: "data:image/' +
      (ext === "png" ? "png" : "jpeg") +
      ";base64," +
      buf.toString("base64") +
      '" },\n';
  }

  out += "};\n";
  fs.writeFileSync("lib/data/images.ts", out);
  console.log("wrote lib/data/images.ts, size=" + (out.length / 1024).toFixed(1) + "KB");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
