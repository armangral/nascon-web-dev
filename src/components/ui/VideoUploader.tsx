import React, { useState, useCallback } from "react";
import { Upload, FileVideo, X, AlertCircle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary } from "../../lib/cloudinary";
import {
  submitTranscriptionJob,
  pollTranscriptionUntilComplete,
} from "../../lib/assemblyAI";

interface VideoUploaderProps {
  onVideoUploaded: (url: string, transcript: string) => void;
  onError?: (error: string) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoUploaded,
  onError,
}) => {
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcriptionStatus, setTranscriptionStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setError(null);
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoUrl(null);
    setTranscript("");
    setError(null);
    setUploadProgress(0);
    setTranscriptionStatus("");
  };

  const handleVideoUpload = useCallback(async () => {
    if (!video) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload video to Cloudinary
      const url = await uploadToCloudinary(video, "video", setUploadProgress);

      if (!url) {
        throw new Error("Failed to upload video");
      }

      setVideoUrl(url);
      setIsUploading(false);

      // Start transcription
      setIsTranscribing(true);
      setTranscriptionStatus("starting");

      const transcriptId = await submitTranscriptionJob(url);

      const transcriptionText = await pollTranscriptionUntilComplete(
        transcriptId,
        (status) => setTranscriptionStatus(status)
      );

      setTranscript(transcriptionText);
      setIsTranscribing(false);

      // Notify parent component
      onVideoUploaded(url, transcriptionText);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process video";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
      setIsTranscribing(false);
    }
  }, [video, onVideoUploaded, onError]);

  return (
    <div className="space-y-4">
      {!video ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-blue-400">
          <div className="flex flex-col items-center justify-center space-y-3">
            <FileVideo className="w-12 h-12 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drag and drop your video file, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                MP4, WebM, or MOV up to 500MB
              </p>
            </div>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <input
                type="file"
                className="sr-only"
                accept="video/*"
                onChange={handleVideoChange}
              />
              Select Video
            </label>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg border overflow-hidden"
          >
            <div className="flex justify-between items-center p-3 bg-gray-100 border-b">
              <div className="flex items-center space-x-3">
                <FileVideo className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium truncate max-w-[180px] md:max-w-xs">
                  {video.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(video.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={removeVideo}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
                disabled={isUploading || isTranscribing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!videoUrl && !isUploading && (
              <div className="p-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleVideoUpload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Transcribe
                </button>
              </div>
            )}

            {isUploading && (
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Uploading video...
                  </span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {isTranscribing && (
              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500"
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
                  <span className="text-sm text-gray-700">
                    {transcriptionStatus === "queued" && "Waiting in queue..."}
                    {transcriptionStatus === "processing" &&
                      "Transcribing audio..."}
                    {transcriptionStatus === "starting" &&
                      "Starting transcription..."}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border-t border-red-200">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {videoUrl && !isUploading && !isTranscribing && (
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Video processed successfully
                  </span>
                </div>

                <div className="aspect-video bg-black rounded overflow-hidden">
                  <video src={videoUrl} controls className="w-full h-full" />
                </div>

                {transcript && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Transcript
                    </h4>
                    <div className="max-h-32 overflow-y-auto p-3 bg-white border rounded text-sm text-gray-700">
                      {transcript}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default VideoUploader;
