import React from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { formatPrice, truncateText } from '../../lib/utils';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link to={`/courses/${course.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img
            src={course.image_url || 'https://images.pexels.com/photos/4050312/pexels-photo-4050312.jpeg?auto=compress&cs=tinysrgb&w=600'}
            alt={course.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="text-white font-medium">
              {course.category}
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {truncateText(course.title, 50)}
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {truncateText(course.description, 100)}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-blue-600 font-bold">
              {formatPrice(course.price)}
            </span>
            <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">
              View Course
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}