import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { ChevronLeft, List, MessageCircle, ChevronDown, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { ChatRoom } from "../../components/chat/chat-room";

export function CourseLearnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [currentLecture, setCurrentLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [courseRooms, setCourseRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    fetchCourseData();
    fetchCourseRooms();
  }, [id, user]);

  const fetchCourseData = async () => {
    if (!id) return;

    setIsLoading(true);

    try {
      // Check if user is enrolled
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user?.id)
        .eq("course_id", id)
        .maybeSingle();

      if (enrollmentError) throw enrollmentError;

      if (!enrollment) {
        navigate(`/courses/${id}`);
        return;
      }

      // Fetch course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;

      setCourse(course);

      // Fetch lectures
      const { data: lectures, error: lecturesError } = await supabase
        .from("lectures")
        .select("*")
        .eq("course_id", id)
        .order("position", { ascending: true });

      if (lecturesError) throw lecturesError;

      setLectures(lectures || []);

      if (lectures && lectures.length > 0) {
        setCurrentLecture(lectures[0]);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseRooms = async () => {
    if (!id) return;

    try {
      // Fetch all chat rooms for this course
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("course_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCourseRooms(data);
        setSelectedRoom(data[0]); // Select the first room by default
      } else {
        // Create default course room if none exists
        const { data: course } = await supabase
          .from("courses")
          .select("title")
          .eq("id", id)
          .single();

        if (course) {
          const { data: newRoom, error: createError } = await supabase
            .from("chat_rooms")
            .insert({
              name: `${course.title} Discussion`,
              course_id: id,
              is_private: false,
            })
            .select()
            .single();

          if (createError) throw createError;

          setCourseRooms([newRoom]);
          setSelectedRoom(newRoom);
        }
      }
    } catch (error) {
      console.error("Error fetching course rooms:", error);
    }
  };

  const selectLecture = (lecture: any) => {
    setCurrentLecture(lecture);
    setIsSidebarOpen(false);
  };

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    setIsRoomDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course || lectures.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Course not available
        </h2>
        <p className="mt-2 text-gray-600">
          This course doesn't have any content yet.
        </p>
        <Link to={`/courses/${id}`}>
          <Button className="mt-6">Back to Course</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center">
          <Link
            to={`/courses/${id}`}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs md:max-w-lg">
            {course.title}
          </h1>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-md mr-2 ${
              isChatOpen
                ? "bg-blue-100 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            aria-label="Toggle chat"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 md:hidden"
            aria-label="Toggle sidebar"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen
              ? "absolute inset-y-0 left-0 z-40 w-full h-full md:w-80"
              : "hidden"
          } md:relative md:block md:w-80 md:flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out`}
          style={{ maxHeight: "calc(100vh - 57px)" }}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 md:hidden">
            <h2 className="text-lg font-medium text-gray-900">
              Course Content
            </h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="hidden md:block p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Course Content
            </h2>
          </div>
          <div
            className="overflow-y-auto"
            style={{ height: "calc(100% - 65px)" }}
          >
            {lectures.map((lecture, index) => (
              <button
                key={lecture.id}
                onClick={() => selectLecture(lecture)}
                className={`w-full text-left p-4 border-b border-gray-200 ${
                  currentLecture && currentLecture.id === lecture.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-medium text-gray-900 truncate">
                      {lecture.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {lecture.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`flex-1 overflow-y-auto ${
            isChatOpen ? "hidden md:block md:flex-1" : "flex-1"
          }`}
          style={{ height: "calc(100vh - 57px)" }}
        >
          {currentLecture && (
            <div className="p-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLecture.title}
                </h2>
                <p className="text-gray-600">{currentLecture.description}</p>
              </div>

              <div className="bg-black rounded-lg overflow-hidden mb-6">
                {currentLecture.video_url ? (
                  <video
                    src={currentLecture.video_url}
                    controls
                    className="w-full h-96"
                    // poster="https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  />
                ) : (
                  <div className="bg-gray-800 text-white text-center p-12">
                    <p>Video content not available</p>
                  </div>
                )}
              </div>

              {currentLecture.transcript && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Transcript
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{currentLecture.transcript}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Chat panel */}
        {isChatOpen && selectedRoom && (
          <aside
            className="fixed inset-0 z-40 bg-white md:relative md:w-96 md:border-l md:border-gray-200"
            style={{
              height: "calc(100vh - 57px)",
              maxHeight: "calc(100vh - 57px)",
            }}
          >
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Course Discussion
                  </h2>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close chat"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {courseRooms.length > 1 && (
                  <div className="relative mt-3">
                    <button
                      onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                      className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-sm"
                    >
                      <span className="font-medium text-gray-700 truncate">
                        {selectedRoom.name}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>
                    {isRoomDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-md py-1 max-h-48 overflow-y-auto">
                        {courseRooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => handleRoomSelect(room)}
                            className={`w-full text-left px-3 py-2 text-sm ${
                              selectedRoom.id === room.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {room.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatRoom roomId={selectedRoom.id} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
