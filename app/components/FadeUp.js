"use client"

import { motion, useInView } from "framer-motion"
import { useEffect, useState, useRef } from "react"

export default function FadeUp({ children, delay }) {
    const [isVisble, setIsVisible] = useState(false)
    let ref = useRef(null)
    let isInView = useInView(ref)

    useEffect(() => {
        if (isInView && !isVisble) {
            setIsVisible(true)
        }
    }, [isInView])

    return (
        <motion.div
            ref={ref}
            variants={{
                hidden: {
                    opacity: 0,
                    y: 30,
                },
                visible: {
                    opacity: 1,
                    y: 0,
                }
            }}
            initial={"hidden"}
            animate={isVisble ? "visible" : "hidden"}
            transition={delay ? { delay: delay, type: "spring" } : {delay: 0.8, type: "spring"}}
        >
            {children}
        </motion.div>
    )
}