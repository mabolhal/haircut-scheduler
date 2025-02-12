'use client';

import { Geist } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { metadata } from './metadata';

const geist = Geist({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [barberName, setBarberName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if barber is logged in
    const barberId = localStorage.getItem('barberId');
    const storedBarberName = localStorage.getItem('barberName');
    if (barberId && storedBarberName) {
      setIsLoggedIn(true);
      setBarberName(storedBarberName);
    }
  }, []);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = localStorage.getItem('authToken'); // Assume you store a JWT token
  //     if (token) {
  //       try {
  //         const response = await fetch('/api/verify-auth', {
  //           method: 'POST',
  //           headers: { Authorization: `Bearer ${token}` },
  //         });
  //         if (response.ok) {
  //           const { barberName } = await response.json();
  //           setIsLoggedIn(true);
  //           setBarberName(barberName);
  //         } else {
  //           setIsLoggedIn(false);
  //           localStorage.removeItem('authToken');
  //         }
  //       } catch (error) {
  //         console.error('Authentication check failed:', error);
  //         setIsLoggedIn(false);
  //       }
  //     } else {
  //       setIsLoggedIn(false);
  //     }
  //   };

  //   checkAuth();
  // }, []);


  const handleLogout = () => {
    localStorage.removeItem('barberId');
    localStorage.removeItem('barberName');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <html lang="en">
      <body className={geist.className}>
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo and primary navigation */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                    Chevu
                  </Link>
                </div>
                <div className="hidden md:ml-8 md:flex md:space-x-6">
                  <Link
                    href="/barbers"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Find a Barber
                  </Link>
                  <Link
                    href="/about"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    About
                  </Link>
                </div>
              </div>

              {/* Authentication buttons or User menu */}
              <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <div className="relative group">
                      <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        <span>{barberName}</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Barber Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Become a Barber
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/barbers"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                Find a Barber
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                About
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Barber Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Become a Barber
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main>
          {children}
        </main>

        <footer className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} Chevu. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
