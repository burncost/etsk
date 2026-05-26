import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { A } from "@solidjs/router";
import { useNavigate } from "@solidjs/router";
import { MetaProvider, Title, Meta } from "@solidjs/meta";

import Header from "../components/Header";
import TextInput from "../components/TextInput";
import PasswordInput from "../components/PasswordInput";
import { createSignal, createEffect } from "solid-js";

const schema = z.object({
  username: z.string().email("*Invalid"),
  password: z.string().min(4, "*Invalid"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function LoginFaculty() {
  const [isProcessing, setIsProcessing] = createSignal(false);
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
        navigate("/faculty/profile", { replace: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [data, setData] = createSignal("");

  createEffect(() => {
    if (localStorage.getItem("jetsUser")) {
      if (JSON.parse(localStorage.getItem("jetsUser")).role === "faculty") {
        // navigate("/faculty/profile", { replace: true });
      } else {
        // navigate("/student/downloads", { replace: true });
      }
    }
  });

  return (
    <MetaProvider>
      <Title>Faculty Access - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Login to access the Portal of ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="sm:grid sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div class="hidden sm:block bg lg:col-span-2 bg-blue-900">&nbsp;</div>
        <div class="h-screen">
          <Header />
          <div class="mt-8 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Faculty Access
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>Enter your Email Address and Password to continue.</p>
            </div>
            <div class="pt-4">
              <form autocomplete="off" onSubmit={submit} class="space-y-4">
                <div>
                  <TextInput
                    label="Email Address:"
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
                  Forgot Password? Please contact the ICT Dept.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
