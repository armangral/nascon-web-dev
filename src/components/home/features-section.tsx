import React from 'react';
import { BookOpen, Video, MessageCircle, CreditCard } from 'lucide-react';

const features = [
  {
    name: 'Extensive Course Library',
    description: 'Access hundreds of courses across various subjects and disciplines, taught by expert tutors.',
    icon: BookOpen,
  },
  {
    name: 'HD Video Lectures',
    description: 'Watch high-quality video content with AI-generated transcripts for better comprehension.',
    icon: Video,
  },
  {
    name: 'Real-time Chat',
    description: 'Connect with tutors and fellow students through our integrated chat system for collaborative learning.',
    icon: MessageCircle,
  },
  {
    name: 'Secure Payments',
    description: 'Enroll in courses with confidence using our secure payment system powered by Stripe.',
    icon: CreditCard,
  },
];

export function FeaturesSection() {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to learn
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform is designed to provide the best online learning experience with cutting-edge features.
          </p>
        </div>
        
        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}