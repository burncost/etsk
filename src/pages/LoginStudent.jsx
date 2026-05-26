import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { A } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { MetaProvider, Title, Meta } from "@solidjs/meta";

import Header from "../components/Header";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";
import ResetPasswordForm from "../components/ResetPasswordForm";
import { createSignal, createEffect } from "solid-js";

const schema = z.object({
  username: z.string().length(5, "*Invalid"),
  password: z.string().min(8, "*Invalid"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function LoginStudent() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showResetForm, setShowResetForm] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    const now = new Date();

    try {
      //Call API here:
      const response = await fetch(VITE_API_URL + "/auth/login", {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          username: formData().username,
          password: formData().password,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setMessage(result.response);
        setIsProcessing(false);
      } else {
        var store = {
          custom_id: result.response.custom_id,
          role: result.response.role,
          surname: result.response.surname,
          token: result.response.token,
          expiry: now.getTime() + 10800000,
        };
        setData(store);
        localStorage.setItem("jetsUser", JSON.stringify(data()));

        navigate("/student/downloads");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [data, setData] = createSignal("");

  createEffect(() => {
    if (localStorage.getItem("jetsUser")) {
      if (JSON.parse(localStorage.getItem("jetsUser")).role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/student/downloads", { replace: true });
      }
    }
  });

  return (
    <MetaProvider>
      <Title>Student Access - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Login to access the Portal of ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="sm:grid sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div class="hidden sm:block bg lg:col-span-2 bg-blue-900">&nbsp;</div>
        <div class="h-screen">
          <Header />
          <Show when={showResetForm()}>
            <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
              <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
                <h2 class="text-center text-blue-900 font-semibold">
                  Reset Password
                </h2>
                <div class="my-2 border-t border-b py-4 border-black">
                  <ResetPasswordForm />
                </div>
              </div>
            </div>
          </Show>
          <div class="mt-8 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Student Access
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>Enter your Student ID and Password to continue.</p>
            </div>
            <div class="pt-4">
              <form autocomplete="off" onSubmit={submit} class="space-y-4">
                <div>
                  <TextInput
                    label="Student ID:"
                    name="username"
                    required={true}
                    type="text"
                    formHandler={formHandler}
                  />
                </div>
                <div>
                  <PasswordInput
                    label="Password:"
                    name="password"
                    required={true}
                    passId="pass1"
                    formHandler={formHandler}
                  />
                </div>

                <Show when={message() !== ""}>
                  <div class="bg-purple-200 text-purple-900 p-3 text-center animate-pulse border-l-2 border-black">
                    {message()}
                  </div>
                </Show>

                <div>
                  <Show
                    when={formHandler.isFormInvalid()}
                    fallback={
                      <>
                        <Show
                          when={isProcessing()}
                          fallback={
                            <button
                              type="submit"
                              class="red-btn w-full p-3 text-center hover:opacity-60"
                            >
                              Login
                            </button>
                          }
                        >
                          <button
                            disabled
                            class="gray2-btn cursor-none w-full p-3 text-center animate-pulse"
                          >
                            Processing.. .
                          </button>
                        </Show>
                      </>
                    }
                  >
                    <button
                      disabled
                      class="gray-btn w-full p-3 text-center cursor-not-allowed"
                    >
                      Login
                    </button>
                  </Show>
                </div>
                <div class="text-center">
                  Forgot Password?{" "}
                  <span
                    onClick={() => {
                      setShowResetForm(true);
                    }}
                    class="text-red-600 hover:opacity-60 cursor-pointer"
                  >
                    Reset it
                  </span>
                  .
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
