import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";

// Layout
import Layout from "./components/Layout.jsx";

// ✅ Page transition animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw", // Slide in from left
    scale: 0.8,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    x: "100vw", // Slide out to right
    scale: 1.2,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.6,
};

// Motion Wrapper for pages
const MotionWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/register " />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={
            <MotionWrapper>
              <Login />
            </MotionWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <MotionWrapper>
              <Register />
            </MotionWrapper>
          }
        />

        {/* Protected routes with Layout */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <MotionWrapper>
                <Dashboard />
              </MotionWrapper>
            }
          />
          {/* More protected pages can be added here later (Transactions, Budgets, etc.) */}
          <Route
            path="/transactions"
            element={
              <MotionWrapper>
                <Transactions />
              </MotionWrapper>
            }
          />
          <Route
            path="/budgets"
            element={
              <MotionWrapper>
                <Budgets />
              </MotionWrapper>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
