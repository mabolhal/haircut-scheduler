'use client';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with us through the following platforms:
            </p>
            <ul className="space-y-4">
              <li>
                <a href="https://github.com/mabolhal" className="text-blue-600 hover:underline">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/in/mabolhal" className="text-blue-600 hover:underline">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://mahy.dev" className="text-blue-600 hover:underline">
                  Website
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 