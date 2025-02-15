'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">About Chevu</h1>
            
            <div className="space-y-8">
              {/* Montreal Based */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Montreal's Next-Gen Barber Platform</h2>
                <p className="text-lg text-gray-600">
                  Founded in Montreal, Chevu is designed to bridge the gap between skilled barbers and clients 
                  seeking quality grooming services. We're hoping to add AI-powered scheduling, payment processing, and more.
                </p>
              </div>

              {/* Supporting Barbers */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Supporting Local Barbers</h2>
                <p className="text-lg text-gray-600">
                  We believe in fair business practices. Unlike traditional booking platforms that charge high commissions, 
                  Chevu maintains minimal fees. 
                </p>
                <ul className="mt-4 list-disc list-inside text-gray-600">
                  <li>Low commission rates</li>
                  <li>Transparent pricing</li>
                </ul>
              </div>

              {/* Development Status */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Coming Soon</h2>
                <p className="text-lg text-gray-600">
                  Chevu is currently in its final stages of development. We're working diligently to create the best 
                  possible platform for both barbers and clients. Stay tuned for our official launch!
                </p>
                {/* <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700">
                    Want to be notified when we launch? Follow us on social media or join our waitlist.
                  </p>
                </div> */}
              </div>

              {/* Contact Section */}
              <div className="border-t pt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Get in Touch</h2>
                <p className="text-lg text-gray-600">
                  Have questions or interested in partnering with us? We'd love to hear from you.
                </p>
                <button 
                    className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push('/contact')}
                  >
                    Contact Us
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 