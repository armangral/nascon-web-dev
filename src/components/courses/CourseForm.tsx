import React, { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { COURSE_CATEGORIES, CourseFormData } from "../../lib/types";

const initialFormData: CourseFormData = {
  title: "",
  description: "",
  price: 0,
  image_url: "",
  category: "",
  is_published: false,
};

const CourseForm: React.FC = () => {
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CourseFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name as keyof CourseFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const togglePublished = () => {
    setFormData((prev) => ({
      ...prev,
      is_published: !prev.is_published,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description should be at least 20 characters";
    }
    if (formData.price < 0) newErrors.price = "Price cannot be negative";
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = "Please enter a valid URL";
    }
    if (!formData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a course");

      const { error } = await supabase.from("courses").insert({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        image_url: formData.image_url || null,
        category: formData.category,
        is_published: formData.is_published,
        tutor_id: user.id,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitStatus("success");
      setFormData(initialFormData);
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      console.error("Error creating course:", error);
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      {submitStatus === "success" && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2" />
          <span>Course created successfully!</span>
        </div>
      )}

      {submitStatus === "error" && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span>
            {errorMessage || "Failed to create course. Please try again."}
          </span>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Course Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className="w-full mt-1 p-2 border rounded"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Complete Web Development Bootcamp"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Course Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className="w-full mt-1 p-2 border rounded"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Provide a detailed description..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium">
            Price (USD) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            className="w-full mt-1 p-2 border rounded"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="29.99"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium">
            Category *
          </label>
          <select
            id="category"
            name="category"
            className="w-full mt-1 p-2 border rounded"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="">Select a category</option>
            {COURSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="image_url" className="block text-sm font-medium">
          Image URL
        </label>
        <input
          type="text"
          id="image_url"
          name="image_url"
          className="w-full mt-1 p-2 border rounded"
          value={formData.image_url}
          onChange={handleInputChange}
          placeholder="https://example.com/image.jpg"
        />
        {errors.image_url && (
          <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>
        )}
      </div>

      {formData.image_url && !errors.image_url && (
        <div className="mt-2 mb-4">
          <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
          <div className="border rounded-lg overflow-hidden h-40 bg-gray-100">
            <img
              src={formData.image_url}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/640x360?text=Image+Preview";
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-t pt-4">
        <input
          type="checkbox"
          id="is_published"
          checked={formData.is_published}
          onChange={togglePublished}
        />
        <label htmlFor="is_published" className="text-sm">
          Publish Course
          <span className="block text-gray-500 text-xs">
            When enabled, your course will be visible to students.
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          className="px-4 py-2 border rounded text-gray-700"
          onClick={() => setFormData(initialFormData)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Create Course"}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
