"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BACKGROUND_COLORS, BACKGROUND_PHOTOS, photoBackground } from "@/lib/templates";

const BUCKET = "board-backgrounds";
const MAX_BYTES = 5 * 1024 * 1024;

export function BackgroundPicker({
  value,
  onChange,
  compact,
}: {
  value: string;
  onChange: (background: string) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photos = compact ? BACKGROUND_PHOTOS.slice(0, 8) : BACKGROUND_PHOTOS;

  async function upload(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    if (file.size > MAX_BYTES) return setError("Images must be 5 MB or smaller.");
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return setError("Please log in again.");
    }
    // Files live under the uploader's id, which the storage policy checks.
    const ext = (file.name.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    setBusy(false);
    if (err) return setError(err.message);
    onChange(photoBackground(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl, "#6b7280"));
  }

  const swatch = (background: string, label: string, size: string) => (
    <button
      type="button"
      key={background}
      onClick={() => onChange(background)}
      style={{ background }}
      title={label}
      aria-label={label}
      aria-pressed={background === value}
      className={`${size} rounded-md ${background === value ? "ring-2 ring-[#0c66e4] ring-offset-2" : "hover:brightness-90"}`}
    />
  );

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-semibold text-gray-600">Photos</p>
        <div className={`grid gap-1.5 ${compact ? "grid-cols-4" : "grid-cols-2"}`}>
          {photos.map((p) => swatch(p.background, p.label, compact ? "h-10" : "h-20"))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-gray-600">Colors</p>
        <div className={`grid gap-1.5 ${compact ? "grid-cols-7" : "grid-cols-4"}`}>
          {BACKGROUND_COLORS.map((c) => swatch(c, "Color background", compact ? "h-8" : "h-12"))}
        </div>
      </div>
      {!compact && (
        <div>
          <p className="mb-1.5 text-xs font-semibold text-gray-600">Your own image</p>
          <label
            className={`flex h-12 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-[#0c66e4] hover:text-[#0c66e4] ${
              busy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {busy ? "Uploading…" : "Upload an image (max 5 MB)"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) upload(file);
              }}
            />
          </label>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
