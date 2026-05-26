import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { Show, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import PasswordInput from "../components/PasswordInput";
import Success from "../components/icons/Success";
import Loading from "../components/Loading";

const schema = z
  .object({
    password: z.string().min(8, "*Invalid"),
    confirm_password: z.string().min(8, "*Invalid"),
  })
  .refine(
    (values) => {
      return values.password === values.confirm_password;
    },
    {
      message: "*Mismatch",
      path: ["confirm_password"],
    }
  );

export default function ChangePassword() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/edit-user/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            password: formData().password,
            status: "complete profile",
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        setMessage(result.response);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  createEffect(async () => {
    const navigate = useNavigate();
    if (localStorage.getItem("jetsUser")) {
      const response = await fetch(
        VITE_API_URL +
          "/api/user/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }
      );
      const result = await response.json();
      if (result.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
      } else {
        setLoading(false);
      }
    } else {
      navigate("/", { replace: true });
    }
  });

  return (
    <MetaProvider>
      <Title>Change Password - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Change Password on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showSuccess()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Password Changed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black">
                <Success />
                <p>
                  Your New Password is set! You can continue using the portal
                  but you'll be required to use your New Password on your next
                  Login attempt.
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() => (window.location.href = "/admin/dashboard")}
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Header />
        <Show when={!loading()} fallback={<Loading />}>
          <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Change Password
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>
                Change your current Password to something else. Ensure it's a
                personalized and memorable but secured one.
              </p>
            </div>
            <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
              <form autocomplete="off" onSubmit={submit} class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                  <div>
                    <PasswordInput
                      label="New Password:"
                      name="password"
                      required={true}
                      passId="pass1"
                      formHandler={formHandler}
                    />
                  </div>
                  <div>
                    <PasswordInput
                      label="Confirm Password:"
                      name="confirm_password"
                      required={true}
                      passId="pass2"
                      formHandler={formHandler}
                    />
                  </div>
                </div>

                <Show when={message() !== ""}>
                  <div class="bg-purple-200 text-purple-900 p-3 text-center animate-pulse border-l-2 border-black">
                    {message()}
                  </div>
                </Show>

                <div class="sm:flex">
                  <div class="hidden sm:block sm:grow">&nbsp;</div>
                  <div class="w-full sm:w-60">
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
                                Proceed
                              </button>
                            }
                          >
                            <button
                              disabled
                              class="gray2-btn cursor-wait w-full p-3 text-center hover:opacity-60"
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
                        Proceed
                      </button>
                    </Show>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
