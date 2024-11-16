"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
import { Star, CreditCard, Shield, BarChart3, RefreshCcw } from "lucide-react"
import { RoughNotation } from "react-rough-notation"
import CustomButton from "./components/CustomButton"
import { useIsVisible } from "./hooks/useIsVisible.js"
import logo from "@/app/public/LOGO.png"

export default function LandingPage() {
  const sectionRef1 = useRef(null);
  const isVisible = useIsVisible(sectionRef1);

  return (
    <div className="scroll-smooth flex flex-col justify-center min-h-screen p-4 mx-auto overflow-x-hidden">
      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative border-gray-400 dark:border-gray-700 border-2 rounded-2xl bg-white p-8 md:p-12 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
            
            <div className="relative text-center">
              <div className="flex justify-center items-center mb-6">
                <Image src={logo} alt="Logo" width={96} height={96} priority className="transform hover:scale-105 transition-transform duration-200" />
              </div>
              
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  Early Access Now Available
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl md:max-w-4xl mx-auto">
                <span className="block mb-2">Turn Your Community Into a</span>
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight py-1">
                  Thriving Business
                </span>
              </h1>
              
              <p className="mt-6 mx-auto text-lg text-gray-600 md:text-xl max-w-2xl">
                The all-in-one platform that automates payments, access control, and member management.
                <span className="block mt-1 text-gray-500">No code required. Launch in minutes.</span>
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
                <Link href="/waitlist" className="w-full sm:w-auto">
                  <CustomButton size="lg" className="w-full">
                    Start For Free
                  </CustomButton>
                </Link>
                <Link href="/learn-more" className="w-full sm:w-auto">
                  <CustomButton variant="outline" size="lg" className="w-full bg-white">
                    See How It Works
                  </CustomButton>
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Trusted by community builders worldwide</p>
                <div className="flex justify-center gap-2 items-center text-gray-600">
                  <div className="flex -space-x-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium">+1,000 creators</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionRef1} id="features" className={`px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run your community
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Focus on creating value for your members while we handle the technical details
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            {[
              {
                name: "Automated Payment Management",
                description: "Say goodbye to manual checks! Automatically verify payments and manage subscriptions hassle-free.",
                icon: CreditCard,
                gradient: "from-blue-400 to-blue-600"
              },
              {
                name: "Subscription Tracking & Renewal",
                description: "Ensure no one gets left out. Notify members about expiring subscriptions and make renewals seamless.",
                icon: RefreshCcw,
                gradient: "from-purple-400 to-purple-600"
              },
              {
                name: "Access Control & Abuse Prevention",
                description: "Keep your community safe. Only paying members gain access, and expired accounts are removed automatically.",
                icon: Shield,
                gradient: "from-red-400 to-red-600"
              },
              {
                name: "Insights & Retention Tools",
                description: "Boost retention rates with analytics and strategies to keep members engaged and subscribed.",
                icon: BarChart3,
                gradient: "from-green-400 to-green-600"
              }
            ].map((feature) => (
              <div
                key={feature.name}
                className="relative border-gray-400 dark:border-gray-700 border-2 group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className={`rounded-xl bg-gradient-to-r ${feature.gradient} p-3 text-white`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors duration-200">
                    {feature.name}
                  </h3>
                </div>
                <p className="mt-4 text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center mt-16">
            <Link href="/learn-more">
              <CustomButton variant="outline" size="lg" className="bg-white hover:bg-gray-50 transition-colors duration-200">
                Discover More Features
              </CustomButton>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="relative border-gray-400 dark:border-gray-700 border-2 rounded-2xl bg-white p-8 md:p-12 shadow-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>

            <div className="relative">
              <div className="sm:text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Ready to transform your community?
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                  Get started in minutes and revolutionize how you manage your paid community. No technical knowledge required.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/waitlist">
                  <CustomButton size="lg" className="w-full sm:w-auto">
                    Request Early Access
                  </CustomButton>
                </Link>
                <Link href="/learn-more">
                  <CustomButton variant="outline" size="lg" className="w-full sm:w-auto bg-white">
                    Learn More
                  </CustomButton>
                </Link>
              </div>

              <div className="mt-8 text-center">
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}