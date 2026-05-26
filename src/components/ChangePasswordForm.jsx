import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import PasswordInput from "./PasswordInput";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Success from "./icons/Success";

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

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function ChangePasswordForm(props) {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const [message, setMessage] = createSignal(false);
  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      const response = await fetch(VITE_API_URL + "/auth/change-password", {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          password: formData().password,
          username: props.student_id,
        }),
      });
      const result = await response.json();

      setSuccess(true);
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Show when={success()}>
        <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
          <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
            <h2 class="text-center text-blue-900 font-semibold">
              Password Changed
            </h2>
            <div class="my-2 border-t border-b py-4 border-black">
              <Success />
              <p>
                Your New Password is set! You can continue using the portal but
                you'll be required to use your New Password on your next Login
                attempt.
              </p>
            </div>
            <div class="text-right space-x-3">
              <button
                onClick={() => (window.location.href = "/student/login")}
                class="blue-btn text-white p-3 hover:opacity-60"
              >
                Ok. Continue
              </button>
            </div>
          </div>
        </div>
      </Show>

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
  );
}
