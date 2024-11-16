"use client"

import { useState } from "react"
import { CheckCircle2, Sparkles, BadgePercent, Zap, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const benefits = [
    {
        icon: BadgePercent,
        title: "Founder's Circle Access",
        description: "Join our exclusive Founder's Circle with direct access to our team and influence on product roadmap"
    },
    {
        icon: Clock,
        title: "Extended Free Trial",
        description: "Get 6 months free instead of the standard 14-day trial, plus lifetime 25% discount"
    },
    {
        icon: Sparkles,
        title: "Premium Features Unlocked",
        description: "Advanced analytics, retention tools, and fraud prevention modules included free forever"
    },
    {
        icon: Zap,
        title: "Priority Support",
        description: "24/7 dedicated support channel with 1-hour response time guarantee for the first year"
    }
]

export default function Waitlist() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/get-early-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })
            if (response.ok) {
                setSubmitted(true)
            }
        } catch (error) {
            console.error('Error submitting email:', error)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 w-full">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl text-green-600 flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-6 w-6" />
                            You're on the list!
                        </CardTitle>
                        <CardDescription className="flex flex-col text-center">
                            We'll notify you when early access becomes available. Keep an eye on your inbox!
                            <Button variant="link" onClick={() => window.location.href = '/'} className="mt-4">Go back to homepage</Button>
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Join the Waitlist for{" "}
                        <span className="text-blue-600">Early Access</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                        Be one of the first creators to transform your community with Subzz.
                        Enjoy exclusive benefits and help shape the future of community management.
                    </p>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl mx-auto">
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">Get Early Access</CardTitle>
                            <CardDescription className="text-center">
                                Limited spots available. Join the waitlist today.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full"
                                    />
                                </div>
                                <Button type="submit" className="w-full" size="lg">
                                    Join Waitlist
                                </Button>
                                <p className="text-sm text-gray-500 text-center">
                                    By joining, you agree to receive updates about Subzz.
                                    We respect your privacy and won't spam you.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon
                            return (
                                <Card key={index} className="border-2">
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-blue-50">
                                                <Icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <CardTitle className="text-lg">{benefit.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">{benefit.description}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    )
}