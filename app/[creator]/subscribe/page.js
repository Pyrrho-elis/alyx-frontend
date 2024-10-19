'use client'
import React, { useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

export default function Subscribe() {
  const { creator } = useParams()
  const searchParams = useSearchParams()
  const tier = searchParams.get('tier')
  const accNo = creator.accNo
  console.log(accNo);
  useEffect(() => {
    window.location.href = `https://t.me/subzzSupportBot?start=sub_${creator}`
  }, [])
  return
}
