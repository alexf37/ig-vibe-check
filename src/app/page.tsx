"use client";
import { useState } from "react";
import { FileUploadForm } from "./FileUploadForm";
import { type Analysis } from "./types";

export default function Home() {
  const [analysis, setAnalysis] = useState<Analysis>();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-2">
          <h1 className="max-w-screen-md text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            analyse your instagram vibe
          </h1>
          <h2 className="text-muted-foreground text-center">
            Upload screenshots of your Instagram profile below to get started
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {analysis ? (
            <div className="flex flex-col gap-4">
              <ul className="flex flex-col items-center text-lg font-semibold">
                <li>
                  💯 Overall grade: {analysis.letterGrade} (
                  {analysis.overallScoreOutOf100})
                </li>
                <li>
                  👥 Follower to following:{" "}
                  {analysis.followerToFollowingLetterGrade}
                </li>
                <li>
                  {analysis.genreEmoji} Genre: {analysis.microGenre}
                </li>
              </ul>
              <div className="space-y-1.5">
                {analysis.fullAnalysisText.split("\n").map((line, index) => (
                  <p
                    key={index}
                    className="text-primary-foreground max-w-screen-sm"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <FileUploadForm onSuccess={(response) => setAnalysis(response)} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
