"use client";
import { FileUploadForm } from "./FileUploadForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h1 className="max-w-screen-md text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            analyse your instagram vibe
          </h1>
          <h2 className="text-muted-foreground">
            Upload screenshots of your Instagram profile below to get started
          </h2>
        </div>

        <FileUploadForm onSuccess={(response) => alert(response)} />
      </div>
    </main>
  );
}
