"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDropzone, type FileWithPath } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TrashIcon } from "@/components/icons/TrashIcon";
import { type Analysis } from "./types";
import { Slider } from "@/components/ui/slider";

type SerializedFile = {
  name: string;
  base64: string;
};

async function serializeFiles(files: File[]) {
  return await Promise.all(
    files.map(
      (file: File) =>
        new Promise<SerializedFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              name: file.name,
              base64: reader.result as string,
            });
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export function FileUploadForm({
  onSuccess,
}: {
  onSuccess: (response: Analysis) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [encoding, setEncoding] = useState(false);
  const [temperature, setTemperature] = useState(undefined);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles]);
    },
    [files],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  const rootProps = getRootProps();
  const inputProps = getInputProps();

  const uploadMutation = api.ai.analyse.useMutation({
    onSuccess(res) {
      setFiles([]);
      onSuccess(res);
    },
    onError() {
      toast("Error", {
        description: "Something went wrong while uploading the files.",
      });
    },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0) return;
    setEncoding(true);

    try {
      const serializedFiles = await serializeFiles(files);
      setEncoding(false);
      uploadMutation.mutate({
        files: serializedFiles,
        temperature,
      });
    } catch {
      setEncoding(false);
      toast("Error", {
        description: "Something went wrong while encoding the files.",
      });
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {/* <div className="mb-4 space-y-4">
        <div>Spiciness: {(temperature * 100).toFixed(0)}%</div>
        <Slider
          className="cursor-grab"
          value={[temperature]}
          onValueChange={(val) => setTemperature(val[0] ?? 0.5)}
          min={0}
          max={1}
          step={0.01}
        />
      </div> */}
      <div
        {...rootProps}
        className={twMerge(
          rootProps.className,
          "border-border cursor-pointer rounded-md border-2 border-dashed bg-white/10 p-4 transition-opacity hover:opacity-75 dark:border-slate-600",
        )}
      >
        <input
          {...inputProps}
          disabled={uploadMutation.isPending || encoding}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-muted-foreground text-sm">
          Drag and drop your screenshots or click to select them in your file
          explorer
        </p>
      </div>
      {files.length > 0 && (
        <aside>
          <div className="max-h-72 w-full overflow-x-hidden rounded-md border bg-white/10">
            <div className="p-4">
              <h4 className="mb-2 text-sm font-medium leading-none">Files</h4>
              {files.map((file: FileWithPath) => (
                <>
                  <div
                    key={file.name}
                    className="group flex justify-between py-2 text-sm"
                  >
                    <span className="w-72 overflow-hidden truncate">
                      {file.name}
                    </span>
                    <span className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setFiles(files.filter((f) => f !== file));
                        }}
                      >
                        <TrashIcon className="text-muted-foreground hover:text-destructive hidden h-4 w-4 group-hover:block" />
                      </button>
                      <span>{(file.size / 1_000_000).toFixed(1)} MB</span>
                    </span>
                  </div>
                  <Separator className="last:hidden" />
                </>
              ))}
            </div>
          </div>
        </aside>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-fit">
              <Button
                variant={"outline"}
                className="text-primary"
                disabled={
                  files.length === 0 || encoding || uploadMutation.isPending
                }
              >
                {encoding || uploadMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    <span>Analysing...</span>
                  </>
                ) : (
                  <span>Analyse my vibe</span>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent hidden={files.length !== 0}>
            <p>You must select a file before uploading</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </form>
  );
}
