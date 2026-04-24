import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth, getDefaultRouteForUser } from "./AuthContext";
import { can } from "./permissions";

/**
 * AuthGuard — bảo vệ toàn bộ app.
 *  1. Nếu chưa đăng nhập → /login.
 *  2. Nếu path "/" → redirect về dashboard mặc định theo role.
 *  3. Nếu user truy cập path không có quyền → redirect về dashboard mặc định.
 */
export function AuthGuard() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const path = location.pathname;
  const defaultRoute = getDefaultRouteForUser(user);

  // Root redirect
  if (path === "/" || path === "") {
    return <Navigate to={defaultRoute} replace />;
  }

  // RBAC check — bỏ qua shared & các đường tĩnh Player đã tồn tại
  const exempt = ["/shared", "/login", "/logout"];
  const isExempt = exempt.some((p) => path.startsWith(p));

  if (!isExempt && !can(user, path)) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}
