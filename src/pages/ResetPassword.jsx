import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { Show, createSignal } from "solid-js";

import Header from "../components/Header";
import TextInput from "../components/TextInput";

const schema = z.object({
  student_id: z.string().min(1, "*Required"),
  phone_number: z.string().length(11, "*Invalid"),
});

export default function ResetPassword() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
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
      if (!result.success) {
        setMessage(result.response);
        setIsProcessing(false);
      } else {
        setQuestion(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MetaProvider>
      <Title>Reset Password - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Reset Password on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />

        <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Reset Password
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>To Reset Password fill the following form correctly.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
            <form autocomplete="off" onSubmit={submit} class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                <div>
                  <TextInput
                    label="Student ID.:"
                    name="student_id"
                    required={true}
                    formHandler={formHandler}
                  />
                </div>
                <div>
                  <TextInput
                    label="Phone Number:"
                    name="phone_number"
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
      </div>
    </MetaProvider>
  );
}
