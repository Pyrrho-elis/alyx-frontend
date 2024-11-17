"use client"

import { Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Contact Us</CardTitle>
            <CardDescription className="text-center">
              We&apos;re here to help! Get in touch with our team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center space-x-2 text-lg">
              <Mail className="h-6 w-6 text-blue-600" />
              <a 
                href="mailto:subzzcontact@gmail.com" 
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                subzzcontact@gmail.com
              </a>
            </div>
            <div className="text-center text-gray-600">
              <p>Our team typically responds within 24 hours during business days.</p>
              <p className="mt-2">
                For faster responses, please include relevant details about your inquiry.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
