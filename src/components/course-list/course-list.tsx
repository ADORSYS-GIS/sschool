import { type Course, UserRole } from "@prisma/client";
import { CourseCard } from "@app/components/course-card";
import { auth } from "@app/server/auth";

export interface SchoolListProps {
  data: Array<Course>;
}

export async function CourseList({ data }: SchoolListProps) {
  const session = await auth();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((course) => (
        <CourseCard
          canEdit={session?.user.role === UserRole.ADMIN}
          key={course.id}
          course={course}
        />
      ))}
    </div>
  );
}
