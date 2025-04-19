import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Video,
  FileText,
  Upload,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import type {
  LectureFormData,
  VideoData,
  UploadProgress,
} from "../../lib/types";
import { useModalStore } from "../../store/modalStore";
import Modal from "../ui/Modal";
import VideoUploader from "../ui/VideoUploader";

const UploadContentModal: React.FC = () => {
  const { isOpen, modalType, courseId, closeModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"lectures" | "materials">(
    "lectures"
  );
  const [files, setFiles] = useState<File[]>([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number | null>(
    null
  );
  const [videoUploads, setVideoUploads] = useState<Record<number, VideoData>>(
    {}
  );
  const [uploadProgress, setUploadProgress] = useState<
    Record<number, UploadProgress>
  >({});

  const [lectures, setLectures] = useState<LectureFormData[]>([
    {
      title: "",
      description: "",
      video_url: "",
      transcript: "",
      position: 1,
    },
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setLectures([
          {
            title: "",
            description: "",
            video_url: "",
            transcript: "",
            position: 1,
          },
        ]);
        setVideoUploads({});
        setUploadProgress({});
        setFiles([]);
        setError(null);
        setSuccess(null);
        setCurrentEditingIndex(null);
        setActiveTab("lectures");
      }, 300);
    }
  }, [isOpen]);

  const handleAddLecture = () => {
    setLectures([
      ...lectures,
      {
        title: "",
        description: "",
        video_url: "",
        transcript: "",
        position: lectures.length + 1,
      },
    ]);
  };

  const handleRemoveLecture = (index: number) => {
    // Remove related video data
    const updatedVideoUploads = { ...videoUploads };
    delete updatedVideoUploads[index];
    setVideoUploads(updatedVideoUploads);

    // Remove related progress data
    const updatedProgress = { ...uploadProgress };
    delete updatedProgress[index];
    setUploadProgress(updatedProgress);

    // Update lectures
    const updatedLectures = lectures.filter((_, i) => i !== index);

    // Update positions
    updatedLectures.forEach((lecture, i) => {
      lecture.position = i + 1;
    });

    setLectures(updatedLectures);
  };

  const handleLectureChange = (
    index: number,
    field: keyof LectureFormData,
    value: string | number
  ) => {
    setLectures((prevLectures) => {
      const updatedLectures = [...prevLectures];
      updatedLectures[index] = {
        ...updatedLectures[index],
        [field]: value,
      };

      return updatedLectures;
    });
  };

  // New function to update multiple fields at once
  const handleMultiFieldUpdate = (
    index: number,
    updates: Partial<LectureFormData>
  ) => {
    setLectures((prevLectures) => {
      const updatedLectures = [...prevLectures];
      updatedLectures[index] = {
        ...updatedLectures[index],
        ...updates,
      };

      return updatedLectures;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleVideoUploaded = (
    index: number,
    url: string,
    transcript: string
  ) => {
    // Update video uploads state
    setVideoUploads((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        url,
        transcript,
      },
    }));

    // Update progress state
    setUploadProgress((prev) => ({
      ...prev,
      [index]: {
        status: "complete",
        progress: 100,
      },
    }));

    // Update lecture data - fix by updating both fields at once
    handleMultiFieldUpdate(index, {
      video_url: url,
      transcript: transcript,
    });
  };

  const handleVideoError = (index: number, errorMessage: string) => {
    setUploadProgress((prev) => ({
      ...prev,
      [index]: {
        status: "error",
        progress: 0,
        error: errorMessage,
      },
    }));
  };

  const startEditingLecture = (index: number) => {
    setCurrentEditingIndex(index);
  };

  const cancelEditingLecture = () => {
    setCurrentEditingIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to upload course content");
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

      // Upload supplementary files if any
      const fileUrls: Record<string, string> = {};

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${courseId}/${Math.random()
            .toString(36)
            .substring(2)}.${fileExt}`;

          const { error: uploadError, data } = await supabase.storage
            .from("course-materials")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          if (data) {
            const { data: urlData } = supabase.storage
              .from("course-materials")
              .getPublicUrl(data.path);

            fileUrls[file.name] = urlData.publicUrl;
          }
        }
      }

      // Save all lectures
      for (const lecture of lectures) {
        if (!lecture.title.trim()) continue; // Skip empty lectures

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

      setSuccess("Course content uploaded successfully!");

      // Reset form after successful upload
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload content");
    } finally {
      setIsLoading(false);
    }
  };

  if (modalType !== "upload" || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Upload Course Content"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center"
          >
            <Check className="w-5 h-5 mr-2" />
            {success}
          </motion.div>
        )}

        {/* Tab navigation */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab("lectures")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "lectures"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Lectures
              </span>
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "materials"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Additional Materials
              </span>
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lectures tab content */}
          <AnimatePresence mode="wait">
            {activeTab === "lectures" && (
              <motion.div
                key="lectures-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  Lecture Content
                </h3>

                {lectures.map((lecture, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg border space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium flex items-center">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                        {currentEditingIndex === index ? (
                          <input
                            value={lecture.title}
                            onChange={(e) =>
                              handleLectureChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="font-medium border-b border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent"
                            placeholder="Lecture title"
                            autoFocus
                            onBlur={cancelEditingLecture}
                            onKeyDown={(e) =>
                              e.key === "Enter" && cancelEditingLecture()
                            }
                          />
                        ) : (
                          <span
                            onClick={() => startEditingLecture(index)}
                            className="cursor-pointer hover:text-blue-600"
                          >
                            {lecture.title || `Untitled Lecture ${index + 1}`}
                          </span>
                        )}
                      </h4>
                      {lectures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLecture(index)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor={`title-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Lecture Title
                        </label>
                        <input
                          id={`title-${index}`}
                          value={lecture.title}
                          onChange={(e) =>
                            handleLectureChange(index, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter lecture title"
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
                            handleLectureChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          rows={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Brief description of this lecture"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lecture Video
                      </label>

                      <VideoUploader
                        onVideoUploaded={(url, transcript) =>
                          handleVideoUploaded(index, url, transcript)
                        }
                        onError={(errorMsg) =>
                          handleVideoError(index, errorMsg)
                        }
                      />

                      {/* Show status when a video is uploaded */}
                      {lecture.video_url && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-sm text-green-600 flex items-center">
                          <Check className="w-4 h-4 mr-2" />
                          Video uploaded successfully
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                <button
                  type="button"
                  onClick={handleAddLecture}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Lecture
                </button>
              </motion.div>
            )}

            {/* Materials tab content */}
            {activeTab === "materials" && (
              <motion.div
                key="materials-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  Additional Materials
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-blue-400">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Drag and drop files, or click to select files
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOCX, PPT, ZIP up to 50MB
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <input
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleFileChange}
                        />
                        Select Files
                      </label>
                    </div>
                  </div>
                </div>

                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Selected Files ({files.length})
                    </h4>
                    <ul className="divide-y divide-gray-200 border rounded-md">
                      {files.map((file, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between py-2 px-4"
                        >
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
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
                  Uploading...
                </>
              ) : (
                "Upload Content"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UploadContentModal;
