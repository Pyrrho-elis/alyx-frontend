"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, UserPlus, BarChart2, RefreshCcw, Shield, Brush, CreditCard, Zap } from "lucide-react"
import CustomButton from "../components/CustomButton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const features = [
  {
    title: "Smart Community Onboarding",
    description: "Automate your community's onboarding process with customizable workflows, welcome messages, and instant access management.",
    icon: UserPlus,
    details: [
      "Automated member invitations",
      "Customizable welcome sequences",
      "Smart access provisioning",
      "Seamless platform integration"
    ]
  },
  {
    title: "Community Analytics",
    description: "Make data-driven decisions with comprehensive insights into your community's engagement, growth, and revenue metrics.",
    icon: BarChart2,
    details: [
      "Member activity tracking",
      "Engagement trends and patterns",
      "Revenue analytics",
      "Retention insights"
    ]
  },
  {
    title: "Subscription Management",
    description: "Streamline your community's subscription lifecycle with automated access control, renewals, and member management.",
    icon: RefreshCcw,
    details: [
      "Automated access management",
      "Smart renewal notifications",
      "Member status tracking",
      "Seamless subscription handling"
    ]
  },
  {
    title: "Advanced Security",
    description: "Protect your community with intelligent moderation tools and automated security features.",
    icon: Shield,
    details: [
      "Content moderation",
      "Anti-spam protection",
      "Member verification",
      "Custom security rules"
    ]
  },
  {
    title: "Brand Customization",
    description: "Create a professional and cohesive community experience with comprehensive branding and customization options.",
    icon: Brush,
    details: [
      "Custom branding elements",
      "Personalized messaging",
      "Branded notifications",
      "Custom community URLs"
    ]
  },
  {
    title: "Revenue Intelligence",
    description: "Optimize your community's financial performance with detailed payment analytics and subscriber insights.",
    icon: CreditCard,
    details: [
      "Subscription analytics",
      "Payment tracking",
      "Revenue forecasting",
      "Member value analysis"
    ]
  }
]

const faqs = [
  {
    question: "What platforms does Subzz currently support?",
    answer: "We currently support Telegram communities, with plans to expand to other popular platforms in the future. We're starting with Telegram to perfect our core features and ensure an exceptional experience before expanding our platform support."
  },
  {
    question: "How does Subzz handle payments?",
    answer: "Subzz integrates with popular payment processors to handle subscriptions securely. We support multiple payment methods and automatically manage access based on payment status."
  },
  {
    question: "Can I migrate my existing community to Subzz?",
    answer: "We're currently developing our community migration tools to ensure a smooth transition process. While this feature isn't available yet, it's a top priority on our roadmap. We'll notify our users as soon as migration support becomes available."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! We offer a 14-day free trial so you can explore all of Subzz's features. Early access members get extended trial periods and special pricing."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We provide comprehensive support through our help center, email support, and priority assistance for specific plans. Our team is committed to helping you succeed."
  }
]

function FeatureCard({ feature }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = feature.icon

  return (
    <div className="relative border-2 border-gray-200 rounded-xl p-6 transition-all duration-200 hover:border-gray-300 bg-white">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-blue-50">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
          <p className="mt-2 text-gray-600">{feature.description}</p>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? "Show less" : "Learn more"}
            <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>

          {isExpanded && (
            <ul className="mt-4 space-y-2">
              {feature.details.map((detail, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Build and Grow Your Community with{" "}
            <span className="text-blue-600">Subzz</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            Subzz is your all-in-one platform for managing paid communities. Starting with Telegram support, we&apos;re building the future of community management - where automation meets engagement.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center mt-12">
          <p className="text-lg text-gray-600">
            Currently supporting Telegram communities, with more platforms coming soon! We&apos;re building Subzz to be the ultimate tool for community creators, regardless of platform.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Transform Your Community?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of creators who are building successful communities with Subzz.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/waitlist">
              <CustomButton size="lg">
                Get Early Access
              </CustomButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
