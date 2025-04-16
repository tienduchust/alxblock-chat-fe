import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "@/pages/public/login-page";
import ChatPage from "@/pages/private/chat-room";

// Public Route wrapper
const PublicRoute = ({ isJoinedRoom }) => {
  return isJoinedRoom ? <Navigate to="/chat" /> : <Outlet />;
};

// Private Route wrapper
const PrivateRoute = ({ isJoinedRoom }) => {
  return isJoinedRoom ? <Outlet /> : <Navigate to="/login" />;
};

function Router() {
  const { isJoinedRoom } = useSelector((state) => state.auth);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isJoinedRoom ? "/chat" : "/login"} />}
        />
        {/* Public Routes */}
        <Route element={<PublicRoute isJoinedRoom={isJoinedRoom} />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        {/* Private Routes */}
        <Route element={<PrivateRoute isJoinedRoom={isJoinedRoom} />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
