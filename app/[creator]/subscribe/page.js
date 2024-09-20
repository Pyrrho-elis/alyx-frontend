'use client'
import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'

export default function Subscribe() {
  const { creator } = useParams()
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier')
  const handleConfirmSubscription = () => {
    window.location.href = `https://t.me/alyxSupportBot?start=sub_${creator}`
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen gap-4'>
      <h1 className='text-2xl font-bold'>Subscribe to {creator}!</h1>
      <p className='text-lg'>Send <strong>ETB {tier}</strong> to <strong>1000640374032</strong></p>
      <p className='text-sm text-gray-500'>after the payment is made, click the button below to confirm your subscription</p>
      <button onClick={handleConfirmSubscription} className='bg-blue-500 text-white px-4 py-2 rounded-md'>Confirm Subscription</button>
    </div>
  )
}
