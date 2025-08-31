import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Import your page components
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Define animation variants for the page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw", // Start off-screen to the left
    scale: 0.8,
  },
  in: {
    opacity: 1,
    x: 0, // Animate to the center
    scale: 1,
  },
  out: {
    opacity: 0,
    x: "100vw", // Animate off-screen to the right
    scale: 1.2,
  },
};

// Define the transition properties
const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

// Main App component
function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* The `key` prop is crucial. It tells AnimatePresence when the page has changed.
        The `location` prop ensures the Routes component updates on navigation. 
      */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Login />
            </motion.div>
          }
        />
        <Route
          path="/register"
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Register />
            </motion.div>
          }
        />
        <Route
          path="/dashboard"
          element={
            // You can apply the same animation to the dashboard or a different one!
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Dashboard />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;