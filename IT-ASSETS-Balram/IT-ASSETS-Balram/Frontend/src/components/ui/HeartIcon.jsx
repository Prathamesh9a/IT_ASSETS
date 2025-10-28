"use client";;
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

const HeartIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
        isControlledRef.current = true;
        return {
            startAnimation: () => controls.start("animate"),
            stopAnimation: () => controls.start("normal"),
        };
    });

    const handleMouseEnter = useCallback((e) => {
        if (!isControlledRef.current) {
            controls.start("animate");
        } else {
            onMouseEnter?.(e);
        }
    }, [controls, onMouseEnter]);

    const handleMouseLeave = useCallback((e) => {
        if (!isControlledRef.current) {
            controls.start("normal");
        } else {
            onMouseLeave?.(e);
        }
    }, [controls, onMouseLeave]);

    const easeInOutArray = [0.42, 0, 0.58, 1];

    const drawVariantLeft = {
        normal: { pathLength: 1 },
        animate: {
            pathLength: [0, 1],
            transition: { duration: 0.7, ease: easeInOutArray },
        },
    };

    const drawVariantRight = {
        normal: { pathLength: 1 },
        animate: {
            pathLength: [0, 1],
            transition: { duration: 0.7, ease: easeInOutArray, delay: 0.2 },
        },
    };

    return (
        <motion.div
            className={cn(className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}>
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={controls}
                initial="normal">
                <motion.path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676" variants={drawVariantLeft} />
                <motion.path
                    d="M12.409 5.824A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
                    variants={drawVariantRight} />
            </motion.svg>
        </motion.div>
    );
});

HeartIcon.displayName = "HeartIcon";
export { HeartIcon };
