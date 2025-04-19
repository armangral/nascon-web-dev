import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/layout/main-layout";
import { useCourseStore } from "../../store/course-store";
import { useAuthStore } from "../../store/auth-store";
import { Button } from "../../components/ui/button";
import { Calendar, Clock, User, Play } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/utils";
import { format } from "date-fns";
import CourseContent from "../../components/courses/CourseContent";

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchCourseById, currentCourse, isLoading } = useCourseStore();
  const { user } = useAuthStore();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [lectures, setLectures] = useState<any[]>([]);
  const [instructorName, setInstructorName] = useState("");

  useEffect(() => {
    if (id) {
      fetchCourseById(id);
      checkEnrollment(id);
      fetchLectures(id);
    }
  }, [id, user]);

  useEffect(() => {
    if (currentCourse) {
      fetchInstructorName(currentCourse.tutor_id);
    }
  }, [currentCourse]);

  const checkEnrollment = async (courseId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (error) {
      console.error("Error checking enrollment:", error);
      return;
    }

    setIsEnrolled(!!data);
  };

  const fetchLectures = async (courseId: string) => {
    const { data, error } = await supabase
      .from("lectures")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching lectures:", error);
      return;
    }

    setLectures(data || []);
  };

  const fetchInstructorName = async (tutorId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", tutorId)
      .single();

    if (error) {
      console.error("Error fetching instructor name:", error);
      return;
    }

    setInstructorName(data.full_name);
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    // In a real implementation, this would redirect to the Stripe checkout
    // For this demo, we'll just create the enrollment directly

    try {
      const { error } = await supabase.from("enrollments").insert([
        {
          user_id: user.id,
          course_id: currentCourse?.id,
          status: "active",
        },
      ]);

      if (error) throw error;

      setIsEnrolled(true);
      navigate(`/courses/${id}/learn`);
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-8"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!currentCourse) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <p className="mt-2 text-gray-600">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/courses")} className="mt-6">
            Browse Courses
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              {currentCourse.title}
            </h1>
            <p className="mt-3 text-xl text-blue-200">
              {currentCourse.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center text-sm text-blue-100 space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{instructorName || "Unknown Instructor"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  Last updated:{" "}
                  {format(new Date(currentCourse.updated_at), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{lectures.length} lectures</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <img
                src={
                  currentCourse.image_url ||
                  "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                alt={currentCourse.title}
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Course Overview
              </h2>
              <p className="text-gray-700">{currentCourse.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Course Content
              </h2>

              {lectures.length === 0 ? (
                <p className="text-gray-600">
                  This course doesn't have any lectures yet.
                </p>
              ) : (
                <>
                  {user?.role === "student" && (
                    <div className="space-y-4">
                      {lectures.map((lecture, index) => (
                        <div
                          key={lecture.id}
                          className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-shrink-0 mr-4">
                            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-lg font-medium text-gray-900">
                              {lecture.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {lecture.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Play className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {user?.role === "tutor" && <CourseContent courseId={id} />}
                </>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(currentCourse.price)}
                  </span>
                </div>
                {isEnrolled ? (
                  <Button
                    onClick={() => navigate(`/courses/${id}/learn`)}
                    className="w-full"
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <Button onClick={handleEnroll} className="w-full">
                    Enroll Now
                  </Button>
                )}

                <div className="mt-6 space-y-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Full lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">
                      Access on mobile and TV
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">
                      Certificate of completion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
