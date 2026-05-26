import { A } from "@solidjs/router";
import { Show, createSignal, createEffect, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import logo from "../assets/logo.png";

import NotLoggedIn from "./menu-items/NotLoggedIn";
import Student from "./menu-items/Student";
import Admin from "./menu-items/Admin";
import Faculty from "./menu-items/Faculty";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(window.innerWidth < 768);
  const navigate = useNavigate();

  // Handle responsive behavior
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  onCleanup(() => window.removeEventListener("resize", handleResize));

  // Auto-close on desktop when mouse leaves the menu area
  const handleMouseLeave = () => {
    if (!isMobile()) setIsMenuOpen(false);
  };

  // Close menu when clicking outside (mobile)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) setIsMenuOpen(false);
  };

  // Close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === "Escape") setIsMenuOpen(false);
  };
  document.addEventListener("keydown", handleKeyDown);
  onCleanup(() => document.removeEventListener("keydown", handleKeyDown));

  const logOut = () => {
    localStorage.removeItem("jetsUser");
    navigate("/", { replace: true });
  };

  const now = new Date();
  createEffect(() => {
    if (
      localStorage.getItem("jetsUser") &&
      (!JSON.parse(localStorage.getItem("jetsUser")).expiry ||
        now.getTime() > JSON.parse(localStorage.getItem("jetsUser")).expiry)
    ) {
      localStorage.removeItem("jetsUser");
      navigate("/");
    }
  });

  return (
    <>
      {/* Sliding Menu Drawer */}
      <div
        class={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMenuOpen() ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div class="absolute inset-0 bg-black/60 transition-opacity duration-300" />

        {/* Drawer Panel - slides from right */}
        <div
          class={`absolute top-0 right-0 h-full w-80 sm:w-2/3 lg:w-1/3 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isMenuOpen() ? "translate-x-0" : "translate-x-full"
          }`}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div class="flex justify-end p-4 border-b">
            <button
              onClick={() => setIsMenuOpen(false)}
              class="p-2 rounded-full hover:bg-gray-100 transition"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                class="w-6 h-6 text-gray-600"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div class="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
            <Show when={!localStorage.getItem("jetsUser")}>
              <NotLoggedIn />
            </Show>
            <Show when={localStorage.getItem("jetsUser") && JSON.parse(localStorage.getItem("jetsUser")).role === "student"}>
              <Student />
            </Show>
            <Show when={localStorage.getItem("jetsUser") && JSON.parse(localStorage.getItem("jetsUser")).role === "admin"}>
              <Admin />
            </Show>
            <Show when={localStorage.getItem("jetsUser") && JSON.parse(localStorage.getItem("jetsUser")).role === "faculty"}>
              <Faculty />
            </Show>
          </div>

          {/* Footer */}
          <div class="absolute bottom-0 w-full p-4 border-t bg-gray-50 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ETSK ICT Dept. All rights reserved.
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <header class="shadow-md py-3 bg-white sticky top-0 z-40">
        <div class="w-11/12 mx-auto flex justify-between items-center">
          {/* Logo */}
          <div class="w-16">
            <A href="/">
              <img src={logo} alt="ETSK Logo" class="max-h-16 object-contain" />
            </A>
          </div>

          {/* User Greeting & Logout */}
          <div class="hidden sm:block text-center text-xs text-gray-700">
            <Show when={localStorage.getItem("jetsUser")}>
              Hello, <b class="uppercase text-purple-800">{JSON.parse(localStorage.getItem("jetsUser")).surname}</b>
              <br />
              <button
                onClick={logOut}
                class="text-red-600 hover:text-red-800 transition font-medium"
              >
                [ Log out ]
              </button>
            </Show>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            class="p-2 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Open menu"
            aria-expanded={isMenuOpen()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              class="w-8 h-8 text-gray-700"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}