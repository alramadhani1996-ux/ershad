import type { TranslationKey } from "@/lib/i18n";

export function Notice({ message, type = "success" }: { message?: string; type?: "success" | "error" }) {
  if (!message) {
    return null;
  }

  return <p className={`notice ${type}`}>{message}</p>;
}

export async function getSearchMessage(searchParams?: Promise<Record<string, string | string[] | undefined>>) {
  const params = searchParams ? await searchParams : {};
  const message = typeof params.message === "string" ? params.message : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  return { message, error };
}

export function Field({
  label,
  name,
  type = "text",
  required = true,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

export function TextArea({ label, name, required = true }: { label: string; name: string; required?: boolean }) {
  return (
    <label className="field field-wide">
      <span>{label}</span>
      <textarea name={name} required={required} rows={5} />
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="primary-button" type="submit">
      {children}
    </button>
  );
}

export type FormLabel = TranslationKey | string;
