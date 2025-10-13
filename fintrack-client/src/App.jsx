import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import HomePage from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budgets from "./pages/Budgets.jsx";

// Layout
import Layout from "./components/Layout.jsx";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Page transition animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

// Motion Wrapper for pages
const MotionWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <MotionWrapper>
              <HomePage />
              {/* <Login /> */}
            </MotionWrapper>
          }
        />
        
        <Route
          path="/login"
          element={
            <PublicRoute>
              <MotionWrapper>
                <Login />
              </MotionWrapper>
            </PublicRoute>
          }
        />
        
        <Route
          path="/register"
          element={
            <PublicRoute>
              <MotionWrapper>
                <Register />
              </MotionWrapper>
            </PublicRoute>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <MotionWrapper>
                <Dashboard />
              </MotionWrapper>
            }
          />
          
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

          {/* Additional Protected Routes */}
          <Route
            path="/goals"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Goals</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/reports"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Reports</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/analytics"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Analytics</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/accounts"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Accounts</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/investments"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Investments</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/bills"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Bills & Subscriptions</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/recurring"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Recurring Transactions</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/calculator"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Financial Calculator</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/tax"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Tax Tools</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/export"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Export Data</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/notifications"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Notifications</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/settings"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Settings</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />

          <Route
            path="/help"
            element={
              <MotionWrapper>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">Help & Support</h1>
                  <p className="text-gray-600 mt-2">Coming Soon...</p>
                </div>
              </MotionWrapper>
            }
          />
        </Route>

        {/* 404 Not Found Route */}
        <Route
          path="*"
          element={
            <MotionWrapper>
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                  <h1 className="text-9xl font-bold text-gray-300">404</h1>
                  <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
                  <p className="text-gray-600 mt-2 mb-8">The page you're looking for doesn't exist.</p>
                  <a
                    href="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                  >
                    Go Back Home
                  </a>
                </div>
              </div>
            </MotionWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;