import { prepareImageForUpload } from "lib/compress-image";

export async function uploadImageFile(file: File): Promise<string> {
  const prepared = await prepareImageForUpload(file);
  const formData = new FormData();
  formData.append("file", prepared);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let data: { url?: string; error?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error("Грешка при обработка на отговора от сървъра");
  }

  if (!response.ok) {
    throw new Error(
      data.error || `Грешка при качване на снимка (${response.status})`,
    );
  }

  if (!data.url) {
    throw new Error("Сървърът не върна URL на снимката");
  }

  return data.url;
}
