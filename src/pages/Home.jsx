import { createSignal, Show, createEffect } from "solid-js";
import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { useNavigate } from "@solidjs/router";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";
import { Select } from "../components/Select";
import logo from "../assets/logo.png"

const VITE_API_URL = import.meta.env["VITE_API_URL"];
const tabs = ["Student", "Faculty", "Admin", "Create Profile"];

export default function UnifiedPortal() {
  const [activeTab, setActiveTab] = createSignal("Student");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showSuccess, setShowSuccess] = createSignal(false);
  const navigate = useNavigate();

  // Form handler with a permissive schema (strict validation handled on submit for dynamic tabs)
  const formHandler = useFormHandler(zodSchema(z.object({}).passthrough()));
  const { formData, reset } = formHandler;

  // Reset form & messages when switching tabs
  createEffect(() => {
    // const tab = activeTab();
    reset();
    setMessage("");
    setShowSuccess(false);
  });

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setMessage("");
    const data = formData();
    const tab = activeTab();

    try {
      if (tab === "Create Profile") {
        // Registration Validation
        if (!data.surname || !data.first_name || !data.username || !data.phone_number || !data.gender || !data.mode_of_study) {
          setMessage("*All required fields must be filled.");
          setIsProcessing(false); return;
        }
        // if (data.username.length !== 20) { setMessage("*Student ID must not be empty."); setIsProcessing(false); return; }
        if (data.phone_number.length !== 11) { setMessage("*Phone number must be exactly 11 digits."); setIsProcessing(false); return; }

        const response = await fetch(`${VITE_API_URL}/auth/register`, {
          mode: "cors",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          method: "POST",
          body: JSON.stringify({
            surname: data.surname.toUpperCase(),
            first_name: data.first_name,
            other_names: data.other_names || "",
            gender: data.gender,
            username: data.username.toUpperCase(),
            phone_number: data.phone_number,
            user_role: "student",
            status: "change password",
            mode_of_study: data.mode_of_study,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          setMessage(result.response || "Registration failed. Please try again.");
        } else {
          setShowSuccess(true);
        }
      } else {
        // Login Validation
        if (!data.username || !data.password) {
          setMessage("*Username and Password are required.");
          setIsProcessing(false); return;
        }
        if (tab === "Student" && data.username.length !== 5) {
          setMessage("*Student ID must be exactly 5 characters.");
          setIsProcessing(false); return;
        }
        if (tab !== "Student" && !data.username.includes("@")) {
          setMessage("*Please enter a valid email address.");
          setIsProcessing(false); return;
        }
        const minPass = tab === "Faculty" ? 4 : 8;
        if (data.password.length < minPass) {
          setMessage(`*Password must be at least ${minPass} characters.`);
          setIsProcessing(false); return;
        }

        const response = await fetch(`${VITE_API_URL}/auth/login`, {
          mode: "cors",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          method: "POST",
          body: JSON.stringify({
            username: tab === "Student" ? data.username : data.username.toLowerCase(),
            password: data.password,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          setMessage(result.response || "Invalid credentials. Please try again.");
        } else {
          const now = new Date();
          const store = {
            custom_id: result.response.custom_id,
            role: result.response.role.toLowerCase(),
            surname: result.response.surname,
            token: result.response.token,
            expiry: now.getTime() + 10800000,
          };
          localStorage.setItem("jetsUser", JSON.stringify(store));

          const userRole = result.response.role.toLowerCase();
          navigate(userRole === "admin" ? "/admin/dashboard" : userRole === "faculty" ? "/faculty/profile" : "/student/downloads", { replace: true });
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessage("Network error. Please check your connection and try again.");
    }
    setIsProcessing(false);
  };

  return (
    <MetaProvider>
      <Title>Portal - ECWA Theological Seminary, Kagoro (ETSK)</Title>
      <Meta name="description" content="Login or Register on ECWA Theological Seminary, Kagoro (ETSK) Portal" />
      
      {/* Centered Layout */}
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-yellow-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border-t-4 border-yellow-400">
          
          {/* Logo Placeholder */}
          <div class="flex justify-center pt-6 pb-2">
            <div class="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-yellow-300 flex items-center justify-center text-gray-400 shadow-inner">
              <img src={logo} alt="logo" class="w-10 h-10 object-contain mx-auto"/>
            </div>
          </div>

          <h1 class="text-2xl font-bold text-center text-purple-800">ETSK Portal</h1>
          <p class="text-center text-gray-500 text-xs mt-1 mb-3">Access your academic dashboard</p>

          {/* Role Tabs */}
          <div class="flex flex-wrap justify-center gap-2 px-6">
            {tabs.map((tab) => (
              <button
                type="button"
                onClick={() => setActiveTab(tab)}
                class={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 border ${
                  activeTab() === tab
                    ? "bg-purple-100 text-purple-800 border-purple-400 shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Show when={showSuccess()}>
            {/* Success View (Matches your requested structure) */}
            <div class="p-6 space-y-4">
              <h2 class="text-lg font-semibold text-center border-b-2 border-yellow-400 pb-2 text-purple-800">
                Student Profile Created
              </h2>
              <div class="bg-yellow-50 rounded-md border border-yellow-200 p-2 space-y-0.5 text-sm text-yellow-800">
                <b class="block">Instruction:</b>
                <p>Please copy the default password below & go to 'Login'.</p>
              </div>
              <div class="pt-4 space-y-2 text-center">
                {/* Replace with your <Success /> component if available */}
                <div class="text-green-600 text-3xl mx-auto">✓</div>
                
                <p class="text-gray-700 text-sm px-2">
                  Your online profile was created successfully. Use your Student ID and the default password below to Log in:
                </p>
                <p class="text-center bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <b class="text-purple-800">Default Password:</b><br />
                  <u class="text-lg text-purple-900 font-mono tracking-wider">123456789</u>
                </p>
                <div class="pt-2">
                  <button
                    onClick={() => { setActiveTab("Student"); setShowSuccess(false); }}
                    class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-900 transition shadow-md"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          </Show>

          <Show when={!showSuccess()}>
            <form onSubmit={submit} class="p-6 space-y-4">
              {/* Registration Fields */}
              {activeTab() === "Create Profile" ? (
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextInput label="Surname:" name="surname" required type="text" formHandler={formHandler} />
                  <TextInput label="First Name:" name="first_name" required type="text" formHandler={formHandler} />
                  <TextInput label="Other Names:" name="other_names" required={false} type="text" formHandler={formHandler} />
                  <Select label="Gender:" name="gender" placeholder="Select" required options={[{ value: "Female", label: "Female" }, { value: "Male", label: "Male" }]} formHandler={formHandler} />
                  <TextInput label="Phone Number:" name="phone_number" required type="text" formHandler={formHandler} />
                  <TextInput label="Student ID:" name="username" required type="text" formHandler={formHandler} />
                  <Select label="Mode of Study:" name="mode_of_study" placeholder="Select" required options={[
                    { value: "in_person", label: "In Person" }, 
                    // { value: "virtual", label: "Virtual" }, 
                    // { value: "weekend", label: "Weekend" }
                  ]} 
                    formHandler={formHandler} />
                </div>
              ) : (
                /* Login Fields */
                <>
                  <TextInput label={activeTab() === "Student" ? "Student ID:" : "Email Address:"} name="username" required type="text" formHandler={formHandler} />
                  <PasswordInput label="Password:" name="password" required passId="pass1" formHandler={formHandler} />
                </>
              )}

              <Show when={message() !== ""}>
                <div class="bg-purple-100 text-purple-800 p-3 text-sm text-center rounded-md border-l-4 border-purple-600 animate-pulse">
                  {message()}
                </div>
              </Show>

              <button
                type="submit"
                disabled={isProcessing()}
                class={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isProcessing()
                    ? "bg-gray-400 cursor-wait"
                    : "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 shadow-md hover:shadow-lg active:scale-[0.98]"
                }`}
              >
                {isProcessing() ? "Processing..." : activeTab() === "Create Profile" ? "Create Profile" : `Login as ${activeTab()}`}
              </button>

              {activeTab() === "Student" && (
                <div class="text-center text-sm text-gray-600 mt-1">
                  Forgot Password?{" "}
                  <span class="text-purple-600 hover:underline cursor-pointer font-medium">Reset it</span>.
                </div>
              )}
              {(activeTab() === "Faculty" || activeTab() === "Admin") && (
                <div class="text-center text-sm text-gray-600 mt-1">
                  Forgot Password? Please contact the <span class="font-medium text-purple-700">ICT Dept.</span>
                </div>
              )}
            </form>
          </Show>

          <div class="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t border-gray-100">
            &copy; {new Date().getFullYear()} ECWA Theological Seminary, Kagoro (ETSK)
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}