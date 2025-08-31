import { motion } from "framer-motion";

// Animation variants for the illustration panel
const illustrationVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

function AuthLayout({ children, title, description, gradient }) {
  return (
    <div className="flex min-h-screen font-sans">
      {/* Left side - Illustration & Welcome Text */}
      <div className={`hidden lg:flex w-1/2 items-center justify-center text-white p-12 ${gradient}`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={illustrationVariants}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-4 drop-shadow-md">{title}</h1>
          <p className="text-xl opacity-90 max-w-md mx-auto">{description}</p>
          {/* You could add an SVG illustration here for more visual appeal */}
          {/*  */}
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-100 p-4">
        {/* We pass the form as 'children' */}
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;