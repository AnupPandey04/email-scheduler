import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/dashboard"
          className="text-xl font-bold text-gray-900"
        >
          Email Scheduler
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            Dashboard
          </Link>

          <Link
            to="/compose"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Compose
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-xs text-gray-400">
              Signed in as
            </p>

            <p className="text-sm font-medium text-gray-700">
              {user?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;