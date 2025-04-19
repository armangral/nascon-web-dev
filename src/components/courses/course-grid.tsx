import React from 'react';
import { CourseCard } from './course-card';
import type { Course } from '../../types';

interface CourseGridProps {
  courses: Course[];
  isLoading?: boolean;
}

export function CourseGrid({ courses, isLoading }: CourseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4 space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-300 rounded w-16"></div>
                <div className="h-8 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
        <p className="mt-2 text-sm text-gray-600">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}