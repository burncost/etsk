import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import ChangePasswordForm from "./ChangePasswordForm";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import TextInput from "./TextInput";

const schema = z.object({
  student_id: z.string().length(5, "*Required"),
  phone_number: z.string().length(10, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function ResetPasswordForm(props) {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showChangePasswordForm, setShowChangePasswordForm] = createSignal(false);

  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      console.log(formData());
      const response = await fetch(VITE_API_URL + "/auth/reset-details", {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          student_id: formData().student_id,
          phone_number: formData().phone_number,
        }),
      });
      const result = await response.json();
      if (result.response.message === "allow") {
        setShowChangePasswordForm(true);
      } else {
        setMessage(result.response);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Show
        when={showChangePasswordForm()}
        fallback={
          <form autocomplete="off" onSubmit={submit} class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
              <div>
                <TextInput
                  label="Student Id:"
                  name="student_id"
                  required={true}
                  formHandler={formHandler}
                />
              </div>
              <div>
                <TextInput
                  label="Phone Number (Without leading 0):"
                  name="phone_number"
                  placeholder="e.g.: 7036935036"
                  required={true}
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
              <div class="w-full sm:w-60 flex space-x-4">
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

                <button
                  onClick={() => (window.location.href = "/student/login")}
                  class="gray-btn text-white p-3 hover:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        }
      >
        <ChangePasswordForm student_id={formData().student_id} />
      </Show>
    </div>
  );
}
