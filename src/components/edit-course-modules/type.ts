import { type Course, type Module } from "@prisma/client";

export interface EditCourseModulesProps {
  course: Course;
}

export interface EditModuleProps {
  module?: Module;
  courseId: string;
  nextPosition: number;
}

export interface OnEditModuleProps {
  onEdit: (module: Module) => void;
}
