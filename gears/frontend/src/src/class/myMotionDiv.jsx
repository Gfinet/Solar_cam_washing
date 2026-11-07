import { motion, AnimatePresence } from "framer-motion";


const panelVariants = {
    initial: { opacity: 0, y: 10, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -10, filter: "blur(4px)" }
};

export default function MyMotionDiv({ children, style, ...props })
{
	return (
		<motion.div 
			key="off"
			variants={panelVariants}
			initial="initial"
			animate="animate"
			exit="exit"
			style={style}
			transition={{ duration: 0.25 }}
			{...props}
		>
			{children}
		</motion.div>
	)
}