import React, { useEffect, useState } from "react";
import { MainLayout } from "../../components/layout/main-layout";
import { useAuthStore } from "../../store/auth-store";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabase";
import { CourseCard } from "../../components/courses/course-card";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  BookOpen,
  Video,
  Clock,
  Users,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { Course } from "../../types";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedCount: 0,
    activeCount: 0,
    totalHours: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    fetchUserCourses();
  }, [user]);

  const fetchUserCourses = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      if (user.role === "student") {
        // Fetch courses enrolled by the student
        const { data, error } = await supabase
          .from("enrollments")
          .select(
            `
            *,
            course:courses(*)
          `
          )
          .eq("user_id", user.id);

        if (error) throw error;

        const courses = data.map((item) => item.course) as Course[];
        setEnrolledCourses(courses);

        // Calculate stats
        setStats({
          enrolledCount: courses.length,
          completedCount: data.filter((item) => item.status === "completed")
            .length,
          activeCount: data.filter((item) => item.status === "active").length,
          totalHours: courses.length * 5, // Assuming 5 hours per course
        });
      } else if (user.role === "tutor") {
        // Fetch courses created by the tutor
        const { data: tutorCourses, error: tutorError } = await supabase
          .from("courses")
          .select("*")
          .eq("tutor_id", user.id);

        if (tutorError) throw tutorError;

        setCreatedCourses(tutorCourses);

        // Calculate stats for tutor
        const { count } = await supabase
          .from("enrollments")
          .select("*", { count: "exact" })
          .in(
            "course_id",
            tutorCourses.map((course) => course.id)
          );

        setStats({
          enrolledCount: count || 0,
          completedCount: 0, // This would need another query
          activeCount: count || 0,
          totalHours: tutorCourses.length * 5, // Assuming 5 hours per course
        });
      }
    } catch (error) {
      console.error("Error fetching user courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="mt-2 text-blue-200">
            {user?.role === "student"
              ? "Track your learning progress and enrolled courses"
              : "Manage your courses and monitor student engagement"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  {user?.role === "student"
                    ? "Enrolled Courses"
                    : "Created Courses"}
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {user?.role === "student"
                    ? stats.enrolledCount
                    : createdCourses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Video className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  {user?.role === "student"
                    ? "Completed Courses"
                    : "Total Students"}
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {user?.role === "student"
                    ? stats.completedCount
                    : stats.enrolledCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  Total Hours
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalHours}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-500">
                  {user?.role === "student"
                    ? "Active Courses"
                    : "Active Students"}
                </h2>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activeCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.role === "student" ? "My Enrolled Courses" : "My Courses"}
            </h2>
            {user?.role === "tutor" && (
              <Link to="/courses/create">
                <Button className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-full"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : user?.role === "student" && enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                You haven't enrolled in any courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Browse our course catalog to find courses that interest you.
              </p>
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </div>
          ) : user?.role === "tutor" && createdCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                You haven't created any courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first course to start teaching!
              </p>
              <Link to="/dashboard/courses/create">
                <Button>Create Course</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {user?.role === "student"
                ? enrolledCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))
                : createdCourses.map((course) => (
                    <div key={course.id} className="relative group">
                      <CourseCard course={course} />
                      <Link
                        to={`/dashboard/courses/${course.id}/edit`}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Link>
                    </div>
                  ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <li key={i} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {i === 1 ? (
                          <BookOpen className="h-5 w-5" />
                        ) : i === 2 ? (
                          <Video className="h-5 w-5" />
                        ) : (
                          <MessageCircle className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {i === 1
                          ? "You enrolled in a new course"
                          : i === 2
                          ? "You completed a lecture"
                          : "You posted in a discussion"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {i === 1
                          ? "Web Development Bootcamp"
                          : i === 2
                          ? "Introduction to JavaScript - Lecture 3"
                          : "Web Development Bootcamp - Discussion"}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs text-gray-500">
                        {format(
                          new Date(Date.now() - i * 24 * 60 * 60 * 1000),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
