export const compressImageToDataUrl = (
  file: File,
  maxWidth = 512,
  maxHeight = 512,
  quality = 0.82,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Invalid image file"));

      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to process image"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
};

export const cropImageToSquareDataUrl = (
  file: File,
  size = 512,
  quality = 0.9,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file"));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("Invalid image file"));

      img.onload = () => {
        const cropSize = Math.min(img.width, img.height);
        const sx = Math.floor((img.width - cropSize) / 2);
        const sy = Math.floor((img.height - cropSize) / 2);

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to process image"));
          return;
        }

        ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
};

export const cropDataUrlToSquare = (
  dataUrl: string,
  size = 512,
  quality = 0.9,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onerror = () => reject(new Error("Invalid image data"));

    img.onload = () => {
      const cropSize = Math.min(img.width, img.height);
      const sx = Math.floor((img.width - cropSize) / 2);
      const sy = Math.floor((img.height - cropSize) / 2);

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to process image"));
        return;
      }

      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.src = dataUrl;
  });
};
