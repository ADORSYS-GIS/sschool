"use client";

import { type EditCoursePagesProps } from "./types";
import { Container } from "@app/components/container";
import { api } from "@app/trpc/react";
import { type PropsWithChildren, useCallback, useId, useMemo } from "react";
import type { Page } from "@prisma/client";
import { Grid, RefreshCw } from "react-feather";
import { ReactSortable, type Sortable, type Store } from "react-sortablejs";
import { AddPageModal } from "./edit-page";
import Image from "next/image";
import Link from "next/link";
import { UploadCourse } from "../downloads/upload-course";

interface EditCoursePageProps {
  page: Page;
}

export function EditCoursePage({ page }: EditCoursePageProps) {
  const id = useId();
  const { data = [], refetch } = api.page.latestPages.useQuery({
    page: 0,
    size: 10_000,
    courseId: page.courseId,
    parentId: page.id,
  });
  const { mutateAsync: updatePosition } = api.page.updatePosition.useMutation();

  const onChange = useCallback(
    async (
      newState: typeof data,
      _sortable: Sortable | null,
      _store: Store,
    ) => {
      await updatePosition(
        newState.map((sub_page, position) => ({
          id: sub_page.id,
          position,
        })),
      );

      await refetch();
    },
    [refetch, updatePosition],
  );
  const meta = useMemo(
    () =>
      page.meta as {
        thumbnailImage: { url: string; alt: string };
      },
    [page.meta],
  );

  return (
    <div id={id}>
      <Link
        href={`/courses/${page.courseId}/edit/${page.id}`}
        className="flex flex-row items-center gap-4"
      >
        <div className="relative size-10">
          <Image
            fill
            className="rounded-box object-cover"
            src={meta.thumbnailImage.url}
            alt={meta.thumbnailImage.alt}
            sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 5vw"
          />
        </div>
        <h3 className="line-clamp-2 font-thin tracking-wide md:text-2xl">
          {page.title}
        </h3>
      </Link>

      <ul className="list pl-8">
        <ReactSortable
          fallbackOnBody={true}
          swapThreshold={0.65}
          animation={150}
          list={data}
          setList={onChange}
          handle=".d-handle"
        >
          {data.map((sub_page) => {
            const meta = sub_page.meta as {
              thumbnailImage: { url: string; alt: string };
            };
            return (
              <li key={sub_page.id} className="list-row items-center">
                <div className="flex flex-row items-center gap-4">
                  <Grid className="d-handle hover:cursor-pointer" />
                  <div className="relative size-10">
                    <Image
                      fill
                      className="rounded-box object-cover"
                      src={meta.thumbnailImage.url}
                      alt={meta.thumbnailImage.alt}
                      sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 5vw"
                    />
                  </div>
                </div>

                <Link href={`/courses/${page.courseId}/edit/${sub_page.id}`}>
                  <div className="line-clamp-2 tracking-wide">
                    {sub_page.title}
                  </div>
                  <div className="line-clamp-none opacity-50">
                    {sub_page.description}
                  </div>
                </Link>
              </li>
            );
          })}
        </ReactSortable>

        <li className="list-row">
          <AddPageModal
            courseId={page.courseId}
            parentPageId={page.id}
            nextPosition={data.length}
            onEdit={(_page) => refetch()}
          />
        </li>
      </ul>
    </div>
  );
}

export function EditCoursePages({
  course,
  children,
}: PropsWithChildren<EditCoursePagesProps>) {
  const { data = [], refetch } = api.page.latestPages.useQuery({
    page: 0,
    size: 10_000,
    courseId: course.id,
    parentId: null,
  });
  const meta = useMemo(
    () =>
      course.meta as {
        thumbnailImage: { url: string; alt: string };
      },
    [course.meta],
  );
  return (
    <Container>
      <div className="mb-4 flex flex-row items-center gap-4">
        <h2 className="app-title">Edit course</h2>
        <UploadCourse courseId={course.id} />
        <button
          onClick={() => refetch()}
          className="btn btn-soft btn-primary btn-circle"
        >
          <RefreshCw />
        </button>

        <AddPageModal
          courseId={course.id}
          onEdit={(_page) => refetch()}
          nextPosition={data.length}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 xl:grid-cols-7">
        <div className="md:col-span-1 xl:col-span-2">
          <div className="mb-8">
            <Link
              href={`/courses/${course.id}/edit`}
              className="flex flex-row items-center gap-4"
            >
              <div className="relative size-10">
                <Image
                  fill
                  className="rounded-box object-cover"
                  src={meta.thumbnailImage.url}
                  alt={meta.thumbnailImage.alt}
                  sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 5vw"
                />
              </div>
              <h3 className="line-clamp-2 hidden font-thin tracking-wide md:block md:text-2xl">
                {course.name}
              </h3>
            </Link>
          </div>

          {data.map((page) => (
            <EditCoursePage page={page} key={page.id} />
          ))}
        </div>

        <div className="hidden sm:block md:col-span-5 xl:col-span-5">
          {children}
        </div>
      </div>
    </Container>
  );
}
