import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components/layout/main-layout";
import { CourseGrid } from "../../components/courses/course-grid";
import { useCourseStore } from "../../store/course-store";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";

export function CoursesPage() {
  const { courses, isLoading, fetchCourses, searchCourses } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchCourses(searchQuery);
    } else {
      fetchCourses();
    }
  };

  return (
    <MainLayout>
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Explore Our Courses
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-blue-200">
              Discover a wide range of courses taught by expert tutors
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CourseGrid courses={courses} isLoading={isLoading} />
      </div>
    </MainLayout>
  );
}
