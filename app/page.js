import { Button } from "@/components/ui/button"
import Navbar from "./components/Nav"
import Link from "next/link"
import { ArrowBigRightDash, Star } from "lucide-react"
import FadeUp from "./components/FadeUp"

export default function LandingPage() {
  return (
    <div className="scroll-smooth flex flex-col justify-center min-h-screen py-4 px-4 m-auto overflow-x-hidden">
      {/* <Navbar  /> */}
      {/* Hero Section */}
      <FadeUp yPos={"-100px"}>
        <Navbar />
      </FadeUp>
      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <FadeUp delay={0.3}>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Monetize Your</span>
                <span className="block text-indigo-600">Telgram Community</span>
              </h1>
            </FadeUp>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Streamline your community monetization with hassle-free payments, automatic member management, and a single, shareable link to your content.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/apply">
                  <Button size="lg" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add more sections here */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Empower Your Community, Anywhere
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides all the tools you need to engage and monetize your audience.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  name: "Seamless Integration",
                  description: "Connect with your existing community platforms without disrupting your audience's experience.",
                },
                {
                  name: 'Flexible Monetization',
                  description: 'Choose the monetization option that suits you best.',
                },
                {
                  name: 'Automatic Member Management',
                  description: 'Out system will automatically moderate your community members.',
                },
                {
                  name: 'We Process The Payments',
                  description: 'Creators only have to worry about their content, we will handle the rest.',
                },
              ].map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <Star />
                      {/* You can add icons here if desired */}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Choose the Perfect Plan for Your Community
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 sm:mx-auto">
              Flexible pricing options to suit creators of all sizes. Start for free and scale as you grow.
            </p>
          </div>

          <div className="mt-16 justify-center space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'Perfect for creators looking to monetize their community.',
                features: [
                  'Up to 100 community members',
                  'Basic analytics',
                  'Standard support',
                  'Payment processing team',
                  '15% transaction fee',
                ],
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large communities and established brands.',
                features: [
                  'Unlimited community members',
                  'Premium analytics with API access',
                  'Negotiable transaction fee',
                  'On-premise support',
                  '24×7×365 premium enterprise support',
                ],
              },
            ].map((plan) => (
              <div key={plan.name} className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col gap-4">
                <div className="flex-1 gap-4">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  {typeof plan.price === 'string' ? (
                    <p className="mt-4 flex items-baseline text-gray-900">
                      <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                      {plan.price !== 'Custom' && <span className="ml-1 text-xl font-semibold">/month</span>}
                    </p>
                  ) : (
                    <p className="mt-4 text-5xl font-extrabold text-gray-900">{plan.price}</p>
                  )}
                  <p className="mt-6 text-gray-500">{plan.description}</p>

                  <ul className="mt-6 space-y-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex">
                        <svg className="flex-shrink-0 w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-3 text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* <Button>
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button> */}
                <div className="w-full">
                  {plan.name === 'Enterprise' ? (
                    <Link className="w-full" href="/contact">
                      <Button className="w-full">Contact Sales</Button>
                    </Link>
                  ) : (
                    <Link href="/apply">
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}