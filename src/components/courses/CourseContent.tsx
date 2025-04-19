import React, { useState, useEffect } from "react";
import { Plus, Trash2, MoveUp, MoveDown, Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { LectureFormData } from "../../lib/types";

import { useAuthStore } from "../../store/auth-store";
import { useModalStore } from "../../store/modalStore";
import UploadContentModal from "./UploadContentModal";

interface CourseContentProps {
  courseId: string | null;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseId }) => {
  const [lectures, setLectures] = useState<
    (LectureFormData & { id?: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openModal } = useModalStore();
  const { user } = useAuthStore();

  const isTutor = user?.role === "tutor";
  const isCourseTutor = user?.id === lectures[0]?.tutor_id;

  useEffect(() => {
    loadLectures();
  }, [courseId]);

  const loadLectures = async () => {
    try {
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .eq("course_id", courseId)
        .order("position");

      if (error) throw error;
      setLectures(data || []);
    } catch (err) {
      console.error("Error loading lectures:", err);
      setError("Failed to load lectures");
    }
  };

  const addNewLecture = () => {
    const newPosition =
      lectures.length > 0
        ? Math.max(...lectures.map((l) => l.position)) + 1
        : 1;

    setLectures([
      ...lectures,
      {
        title: "",
        description: "",
        video_url: "",
        transcript: "",
        position: newPosition,
      },
    ]);
  };

  const updateLecture = (
    index: number,
    field: keyof LectureFormData,
    value: string | number
  ) => {
    const updatedLectures = [...lectures];
    updatedLectures[index] = {
      ...updatedLectures[index],
      [field]: value,
    };
    setLectures(updatedLectures);
  };

  const removeLecture = (index: number) => {
    const updatedLectures = lectures.filter((_, i) => i !== index);
    // Reorder positions
    updatedLectures.forEach((lecture, i) => {
      lecture.position = i + 1;
    });
    setLectures(updatedLectures);
  };

  const moveLecture = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === lectures.length - 1)
    ) {
      return;
    }

    const updatedLectures = [...lectures];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    // Swap positions
    const temp = updatedLectures[index].position;
    updatedLectures[index].position = updatedLectures[swapIndex].position;
    updatedLectures[swapIndex].position = temp;

    // Swap elements
    [updatedLectures[index], updatedLectures[swapIndex]] = [
      updatedLectures[swapIndex],
      updatedLectures[index],
    ];

    setLectures(updatedLectures);
  };

  const saveLectures = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to update course content");
      }

      // Verify user has permission to edit this course
      const { data: courseData } = await supabase
        .from("courses")
        .select("tutor_id")
        .eq("id", courseId)
        .single();

      if (courseData?.tutor_id !== user.id) {
        throw new Error("You do not have permission to edit this course");
      }

      // Save all lectures
      for (const lecture of lectures) {
        if (lecture.id) {
          // Update existing lecture
          const { error } = await supabase
            .from("lectures")
            .update({
              title: lecture.title,
              description: lecture.description,
              video_url: lecture.video_url,
              transcript: lecture.transcript,
              position: lecture.position,
            })
            .eq("id", lecture.id);

          if (error) throw error;
        } else {
          // Insert new lecture
          const { error } = await supabase.from("lectures").insert({
            course_id: courseId,
            title: lecture.title,
            description: lecture.description,
            video_url: lecture.video_url,
            transcript: lecture.transcript,
            position: lecture.position,
          });

          if (error) throw error;
        }
      }

      await loadLectures(); // Reload lectures to get updated data
    } catch (err) {
      console.error("Error saving lectures:", err);
      setError(err instanceof Error ? err.message : "Failed to save lectures");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadContent = () => {
    openModal("upload", courseId);
  };

  return (
    <div className="space-y-6 my-6">
      <UploadContentModal />

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
        <div className="flex space-x-3">
          {isTutor && (
            <button
              type="button"
              onClick={handleUploadContent}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </button>
          )}
          {isTutor && (
            <button
              type="button"
              onClick={addNewLecture}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lecture
            </button>
          )}
        </div>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">
            No lectures have been added to this course yet.
          </p>
          {isTutor && (
            <button
              type="button"
              onClick={handleUploadContent}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Course Content
            </button>
          )}
        </div>
      ) : (
        lectures.map((lecture, index) => (
          <div
            key={lecture.id || index}
            className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Lecture {index + 1}
              </h3>
              {isTutor && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => moveLecture(index, "up")}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLecture(index, "down")}
                    disabled={index === lectures.length - 1}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLecture(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {isTutor ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`title-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Title
                    </label>
                    <input
                      id={`title-${index}`}
                      value={lecture.title}
                      onChange={(e) =>
                        updateLecture(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`description-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id={`description-${index}`}
                      value={lecture.description}
                      onChange={(e) =>
                        updateLecture(index, "description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`video-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Video URL
                    </label>
                    <input
                      id={`video-${index}`}
                      value={lecture.video_url}
                      onChange={(e) =>
                        updateLecture(index, "video_url", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`transcript-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Transcript
                    </label>
                    <textarea
                      id={`transcript-${index}`}
                      value={lecture.transcript}
                      onChange={(e) =>
                        updateLecture(index, "transcript", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter lecture transcript or notes"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h4 className="font-medium text-lg mb-2">{lecture.title}</h4>
                {lecture.description && (
                  <p className="text-gray-600 mb-4">{lecture.description}</p>
                )}
                {lecture.video_url && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Video
                    </h5>
                    <a
                      href={lecture.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Watch Lecture Video
                    </a>
                  </div>
                )}
                {lecture.transcript && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Transcript
                    </h5>
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {lecture.transcript}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}

      {lectures.length > 0 && isTutor && (
        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={saveLectures}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save All Lectures"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseContent;
