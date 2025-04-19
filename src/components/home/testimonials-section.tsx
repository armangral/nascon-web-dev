import React from 'react';

const testimonials = [
  {
    content: "The EdTech platform has completely transformed how I teach my courses. The interactive tools and real-time chat feature have made it so much easier to connect with my students.",
    author: "Dr. Samantha Lee",
    role: "Professor of Computer Science",
    image: "https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    content: "I've tried many online learning platforms, but this one stands out because of its intuitive interface and high-quality content. The AI-generated transcripts are a game-changer for my study habits.",
    author: "Michael Johnson",
    role: "Engineering Student",
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    content: "The ability to interact with tutors in real-time has significantly improved my learning experience. I feel more engaged and supported throughout my courses.",
    author: "Emily Rodriguez",
    role: "Business Major",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
];

export function TestimonialsSection() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Hear from our users
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Discover how our platform is transforming education for students and tutors around the world.
          </p>
        </div>
        
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-8">
                  <div className="relative mb-6">
                    <svg
                      className="absolute top-0 left-0 transform -translate-x-4 -translate-y-4 h-8 w-8 text-gray-200"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="relative text-lg font-medium text-gray-700">
                      {testimonial.content}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={testimonial.image}
                      alt={testimonial.author}
                    />
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}