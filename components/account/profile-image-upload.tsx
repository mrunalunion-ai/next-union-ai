"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import type { ChangeEvent } from "react";
import { toast } from "react-toastify";

const defaultAcceptedTypes = ["image/jpeg", "image/png"] as const;

interface ProfileImageUploadProps {
  imageUrl: string | null;
  initials: string;
  isUploading: boolean;
  onFileChange: (file: File) => void | Promise<void>;
  onRemove: () => void;
  inputId: string;
  acceptedTypes?: readonly string[];
  maxSizeMB?: number;
}

function readableImageTypes(types: readonly string[]) {
  return types.map((type) => {
    if (type === "image/jpeg" || type === "image/jpg") return "JPG/JPEG";
    if (type === "image/png") return "PNG";
    if (type === "image/webp") return "WebP";
    return type.replace(/^image\//, "").toUpperCase();
  }).join(", ");
}

export function ProfileImageUpload({
  imageUrl,
  initials,
  isUploading,
  onFileChange,
  onRemove,
  inputId,
  acceptedTypes = defaultAcceptedTypes,
  maxSizeMB = 5,
}: ProfileImageUploadProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Choose an image in ${readableImageTypes(acceptedTypes)} format.`);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be ${maxSizeMB} MB or smaller.`);
      return;
    }

    void onFileChange(file);
  };

  return (
    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0 self-center sm:self-auto">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary/15 bg-primary/10 shadow-sm">
            {imageUrl ? (
              <Image src={imageUrl} alt="Profile" width={80} height={80} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-primary">
                {initials}
              </div>
            )}
          </div>
          {imageUrl && !isUploading && (
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove profile image"
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-destructive text-destructive-foreground shadow-sm transition hover:scale-105"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold text-foreground">
            Add a profile image <span className="font-normal text-muted-foreground">(optional)</span>
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {readableImageTypes(acceptedTypes)} · Up to {maxSizeMB} MB
          </p>
          <label
            htmlFor={inputId}
            className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 ${isUploading ? "pointer-events-none opacity-60" : ""}`}
          >
            <ImagePlus className="h-4 w-4" />
            {isUploading ? "Uploading…" : imageUrl ? "Change image" : "Choose image"}
          </label>
          <input
            id={inputId}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleChange}
            disabled={isUploading}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
