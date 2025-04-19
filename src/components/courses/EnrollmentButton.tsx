import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  price: number;
}

export function EnrollButton({
  courseId,
  isEnrolled,
  price,
}: EnrollButtonProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);

    try {
      // Get the session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth/login");
        return;
      }

      // Call Supabase Edge Function to create a checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bright-function`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ courseId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast.error("Could not process your enrollment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueLearning = () => {
    navigate(`/courses/${courseId}/learn`);
  };

  if (isEnrolled) {
    return (
      <Button onClick={handleContinueLearning} className="w-full">
        Continue Learning
      </Button>
    );
  }

  return (
    <Button onClick={handleEnroll} className="w-full" disabled={isLoading}>
      {isLoading ? "Processing..." : `Enroll Now • $${price.toFixed(2)}`}
    </Button>
  );
}
