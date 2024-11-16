"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, CreditCard, Shield, BarChart3, RefreshCcw, Users, Zap } from "lucide-react"
import CustomButton from "../components/CustomButton"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const features = [
  {
    title: "Automated Payment Management",
    description: "Seamlessly handle subscriptions, one-time payments, and recurring billing. Our platform automatically processes payments, sends invoices, and manages refunds.",
    icon: CreditCard,
    details: [
      "Multiple payment methods support",
      "Automated invoice generation",
      "Flexible subscription plans",
      "Instant refund processing"
    ]
  },
  {
    title: "Smart Access Control",
    description: "Protect your content and community with advanced access management. Automatically grant and revoke access based on payment status.",
    icon: Shield,
    details: [
      "Role-based permissions",
      "Automatic access management",
      "IP-based restrictions",
      "Two-factor authentication"
    ]
  },
  {
    title: "Analytics & Insights",
    description: "Make data-driven decisions with comprehensive analytics. Track member engagement, revenue metrics, and community growth.",
    icon: BarChart3,
    details: [
      "Real-time revenue tracking",
      "Member engagement metrics",
      "Churn prediction",
      "Custom report generation"
    ]
  },
  {
    title: "Community Management",
    description: "Powerful tools to manage and grow your community. From member onboarding to engagement tracking.",
    icon: Users,
    details: [
      "Automated welcome flows",
      "Member directory management",
      "Group discussions",
      "Content moderation tools"
    ]
  }
]

const faqs = [
  {
    question: "How secure is Subzz?",
    answer: "Subzz uses bank-level security with 256-bit encryption. We're SOC 2 compliant and regularly undergo security audits. Your data and your members' information are protected by industry-leading security measures."
  },
  {
    question: "What payment methods do you support?",
    answer: "We support all major credit cards, PayPal, and bank transfers. We're also integrated with popular payment gateways like Stripe and can handle multiple currencies."
  },
  {
    question: "Can I migrate my existing community?",
    answer: "Yes! We provide migration tools and dedicated support to help you seamlessly transfer your existing community. Our team will assist you throughout the process."
  },
  {
    question: "How much does it cost?",
    answer: "We offer flexible pricing based on your community size. Our starter plan begins at $49/month and includes all core features. Custom enterprise plans are available for larger communities."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer 24/7 email support, live chat during business hours, and priority phone support for enterprise plans. Our knowledge base is also available with detailed guides and tutorials."
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
            Everything You Need to Know About{" "}
            <span className="text-blue-600">Subzz</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
            Discover how Subzz helps creators turn their communities into thriving businesses with powerful features and seamless automation.
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
