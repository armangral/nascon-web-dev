import React, { useEffect } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import { HeroSection } from '../components/home/hero-section';
import { FeaturesSection } from '../components/home/features-section';
import { TestimonialsSection } from '../components/home/testimonials-section';
import { useCourseStore } from '../store/course-store';
import { CourseGrid } from '../components/courses/course-grid';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { fetchFeaturedCourses, featuredCourses, isLoading } = useCourseStore();
  
  useEffect(() => {
    fetchFeaturedCourses();
  }, []);
  
  return (
    <MainLayout>
      <HeroSection />
      
      <FeaturesSection />
      
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Featured Courses
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Discover our most popular courses across various categories
              </p>
            </div>
            <Link to="/courses" className="mt-4 md:mt-0">
              <Button variant="outline" className="flex items-center">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <CourseGrid courses={featuredCourses} isLoading={isLoading} />
        </div>
      </div>
      
      <TestimonialsSection />
      
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block">Start your learning journey today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-100">
            Join thousands of students already learning on our platform.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link to="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Get started
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex">
              <Link to="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-blue-700"
                >
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}