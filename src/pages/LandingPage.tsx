import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Book,
  Video,
  MessageCircle,
  Users,
  Globe,
  Award,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import ThreeScene from "../components/ThreeScene";
import { LandingHeader } from "../components/LandingHeader";

export const LandingPage: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const features = [
    {
      icon: <Video className="h-6 w-6" />,
      title: "Enhanced Video Learning",
      description:
        "Upload course videos with automatic AI-generated transcripts for improved accessibility.",
      bgColor: "bg-purple-500",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Real-Time Communication",
      description:
        "Chat directly with instructors and peers in dedicated course rooms.",
      bgColor: "bg-violet-500",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Learn Anywhere, Anytime",
      description:
        "Access courses from any device with seamless progress tracking.",
      bgColor: "bg-fuchsia-500",
    },
    {
      icon: <Book className="h-6 w-6" />,
      title: "Course Catalog",
      description:
        "Browse and enroll in courses taught by experts across subjects.",
      bgColor: "bg-purple-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Learning",
      description: "Connect with fellow learners and collaborate on projects.",
      bgColor: "bg-violet-600",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Teach and Earn",
      description: "Share your expertise and monetize your knowledge.",
      bgColor: "bg-fuchsia-600",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      {/* Hero Section with 3D Elements */}
      <section className="bg-gradient-to-br from-purple-50 to-violet-100 pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Transforming Education Through Interactive Learning
              </motion.h1>
              <motion.p
                className="mt-6 text-xl text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Connect with expert educators in a seamless learning
                environment. Experience AI-enhanced video content and real-time
                collaboration.
              </motion.p>
              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-purple-600 border-purple-600 hover:bg-purple-50"
                  >
                    Browse Courses
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <ThreeScene />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Learning Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Interactive Learning Experience
            </h2>
            <p className="text-xl text-gray-600">
              Engage with our interactive learning tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Live Workshops",
                count: "250+",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Active Students",
                count: "10,000+",
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Course Completion",
                count: "95%",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4 mx-auto">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  {item.count}
                </h3>
                <p className="text-center text-gray-600">{item.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose EduVerse?
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with education
              expertise to deliver a superior learning experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`flex items-center justify-center h-12 w-12 rounded-md ${feature.bgColor} text-white mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-violet-700 text-white">
        <motion.div
          className="max-w-7xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold">
            Ready to transform your learning experience?
          </h2>
          <p className="mt-4 text-xl max-w-3xl mx-auto text-purple-100">
            Join thousands of students and teachers who are already part of our
            growing community.
          </p>
          <motion.div
            className="mt-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-purple-50"
              >
                Join EduVerse Today
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};
