import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          analyse your instagram vibe
        </h1>

        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">loading...</p>
        </div>
      </div>
    </main>
  );
}
