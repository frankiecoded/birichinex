/**
 * Upload one or more image files to the Portmetals/BirichiNex API and receive
 * their public `/uploads/...` URLs for storage on inventory items.
 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error(`"${file.name}" is not an image file.`);
    }
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-Filename": encodeURIComponent(file.name),
      },
      body: file,
    });
    if (!res.ok) {
      let detail = "";
      try {
        const data = await res.json();
        detail = data?.error ?? "";
      } catch {
        /* not JSON */
      }
      throw new Error(`Upload failed (${res.status})${detail ? `: ${detail}` : ""}`);
    }
    const data = (await res.json()) as { url?: string };
    if (!data.url) throw new Error(`Upload returned no URL for "${file.name}".`);
    urls.push(data.url);
  }
  return urls;
}