import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { useNavigate } from "@solidjs/router";
import { MetaProvider, Title, Meta } from "@solidjs/meta";

import Header from "../components/Header";
import TextInput from "../components/TextInput";
import { Select } from "../components/Select";
import { createSignal } from "solid-js";

const schema = z.object({
  surname: z.string().min(1, "*Required"),
  first_name: z.string().min(1, "*Required"),
  other_names: z.string().optional(),
  gender: z.string().min(1, { message: "*Required" }),
  username: z.string().length(20, "*Invalid").toUpperCase(),
  phone_number: z.string().length(11, { message: "*Invalid" }),
  mode_of_study: z.string().min(1, { message: "*Required"}),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function CreateStudentProfile() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");

  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    // console.log("Form Data: ",formData())
    // console.log("Mode of Study: ", formData().mode_of_study);

    try {
      //Call API here:
      const response = await fetch(VITE_API_URL + "/auth/register", {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          surname: formData().surname.toUpperCase(),
          first_name: formData().first_name,
          other_names: formData().other_names,
          gender: formData().gender,
          username: formData().username.toUpperCase(),
          phone_number: formData().phone_number,
          user_role: "student",
          status: "change password",
          mode_of_study: formData().mode_of_study,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setMessage(result.response);
        setIsProcessing(false);
      } else {
        navigate("/student/profile-created", { replace: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MetaProvider>
      <Title>
        Create Student Profile - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Create student profile on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="sm:grid sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div class="hidden sm:block bg lg:col-span-2 bg-blue-900">&nbsp;</div>
        <div class="sm:h-screen">
          <Header />
          <div class="mt-8 mb-20 lg:mb-0 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Create Student Profile
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>Enter the required details correctly.</p>
            </div>
            <div class="pt-4">
              <form
                autocomplete="off"
                onSubmit={submit}
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-2"
              >
                <div>
                  <TextInput
                    label="Surname:"
                    name="surname"
                    required={true}
                    type="text"
                    formHandler={formHandler}
                  />
                </div>
                <div>
                  <TextInput
                    label="First Name:"
                    name="first_name"
                    required={true}
                    type="text"
                    formHandler={formHandler}
                  />
                </div>
                <div>
                  <TextInput
                    label="Other Names:"
                    name="other_names"
                    required={false}
                    type="text"
                    formHandler={formHandler}
                  />
                </div>
                <div>
                  <Select
                    label="Gender:"
                    name="gender"
                    placeholder="Select"
                    required={true}
                    options={[
                      { value: "Female", label: "Female" },
                      { value: "Male", label: "Male" },
                    ]}
                    formHandler={formHandler}
                  />
                </div>
                <div>
                  <TextInput
                    label="Phone Number:"
                    name="phone_number"
                    required={true}
                    type="text"
                    formHandler={formHandler}
                  />
                </div>
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
                  <Select
                    label="Mode of Study:"
                    name="mode_of_study"
                    placeholder="Select"
                    required={true}
                    options={[
                      { value: "in_person", label: "In Person" }
                    ]}
                    formHandler={formHandler}
                  />
                </div>
                <div class="sm:col-span-2 pt-2 space-y-3">
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
      </div>
    </MetaProvider>
  );
}
