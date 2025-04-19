import React from "react";

import { BookOpenCheck } from "lucide-react";
import CourseForm from "../../components/courses/CourseForm";

const CreateCoursePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center">
            <BookOpenCheck className="h-8 w-8 text-white" />
            <h1 className="ml-3 text-2xl font-bold text-white">
              Create a New Course
            </h1>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-600">
                Fill in the details below to create your new course. Fields
                marked with * are required.
              </p>
            </div>

            <CourseForm />
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} EduPlatform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CreateCoursePage;
