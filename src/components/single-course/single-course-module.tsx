import { type Module } from "@prisma/client";
import Image from "next/image";

export interface SingleCourseModuleProps {
  module: Module;
}

export function SingleCourseModule({ module }: SingleCourseModuleProps) {
  return (
    <div className="flex flex-row items-center gap-4">
      <div>
        <figure className="relative size-14 overflow-clip rounded-full md:size-16">
          <Image
            fill
            className="rounded-box object-cover contrast-125 grayscale"
            src={module.meta.thumbnailImage.url}
            alt={module.meta.thumbnailImage.alt}
            title={module.meta.thumbnailImage.alt ?? module.title}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 15vw"
          />
          <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center text-3xl font-extrabold text-white">
            {module.position + 1}
          </div>
        </figure>
      </div>
      <div>
        <div className="font-bold">{module.title}</div>
        <p>{module.description}</p>
      </div>
    </div>
  );
}
