import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-purple-700 text-white p-4 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <img src={logo} alt="MoodMirror Logo" className="w-10 h-10" />
        <span className="font-bold text-xl">MoodMirror</span>
      </div>
      <div className="hidden md:flex gap-6 text-sm">
        <Link className="hover:text-yellow-300 transition duration-300 ease-in-out" to="/">Home</Link>
        <Link className="hover:text-yellow-300 transition duration-300 ease-in-out" to="/login">Login</Link>
        <Link className="hover:text-yellow-300 transition duration-300 ease-in-out" to="/scan">Scan</Link>
        <Link className="hover:text-yellow-300 transition duration-300 ease-in-out" to="/suggestions">Suggestions</Link>
        <Link className="hover:text-yellow-300 transition duration-300 ease-in-out" to="/progress">Progress</Link>
        <Link className="hover:text-yellow-300 transition duration-300 ease-in-out" to="/account">Account</Link>
        <Link className="hover:text-yellow-300 transition duration-300 ease-in-out" to="/admin">Admin</Link>
      </div>
      <div className="md:hidden">
        <button className="focus:outline-none">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}