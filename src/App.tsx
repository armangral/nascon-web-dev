import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/auth-store";

// Pages
import { HomePage } from "./pages/home-page";
import { LoginPage } from "./pages/auth/login-page";
import { RegisterPage } from "./pages/auth/register-page";
import { CoursesPage } from "./pages/courses/courses-page";
import { CourseDetailPage } from "./pages/courses/course-detail-page";
import { CourseLearnPage } from "./pages/courses/course-learn-page";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import { ChatPage } from "./pages/chat/chat-page";
import CreateCoursePage from "./pages/courses/CreateCoursePage";
import { Toaster } from "react-hot-toast";
import { LandingPage } from "./pages/LandingPage";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />

          {/* Protected Routes */}
          <Route
            path="/courses/:id/learn"
            element={
              <ProtectedRoute>
                <CourseLearnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/create"
            element={
              <ProtectedRoute>
                <CreateCoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 3000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "white",
            color: "grey",
          },
        }}
      />
    </>
  );
}

export default App;
