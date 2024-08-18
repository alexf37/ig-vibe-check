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
  onSuccess: (response: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [encoding, setEncoding] = useState(false);

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
      toast("Success!", {
        description: "Done.",
      });
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
      uploadMutation.mutate(serializedFiles);
    } catch {
      setEncoding(false);
      toast("Error", {
        description: "Something went wrong while encoding the files.",
      });
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div
        {...rootProps}
        className={twMerge(
          rootProps.className,
          "border-border bg-secondary cursor-pointer rounded-md border-2 border-dashed p-4 transition-opacity hover:opacity-75 dark:border-slate-600",
        )}
      >
        <input {...inputProps} />
        <p className="text-muted-foreground">
          Drag and drop your screenshots or click to select them in your file
          explorer
        </p>
      </div>
      {files.length > 0 && (
        <aside>
          <div className="max-h-72 w-full overflow-x-hidden rounded-md border">
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
                disabled={
                  files.length === 0 || encoding || uploadMutation.isPending
                }
              >
                {encoding || uploadMutation.isPending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Analyze my vibe</span>
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
