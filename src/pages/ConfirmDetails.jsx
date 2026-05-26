import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { Show, createSignal, createEffect } from "solid-js";

import Header from "../components/Header";
import TextInput from "../components/TextInput";
import Success from "../components/icons/Success";
import { Select } from "../components/Select";

const schema = z.object({
  phone_number: z.string().length(11, { message: "*Invalid" }),
  gender: z.string().min(1, "*Required"),
  department: z.string().min(1, "*Required"),
  faculty: z.string().min(1, "*Required"),
});

export default function ConfirmDetails() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showSuccess, setShowSuccess] = createSignal(false);
  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    const request1 = fetch(
      VITE_API_URL +
        "/api/edit-student/" +
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
          faculty: formData().faculty,
          department: formData().department,
        }),
      }
    ).then((response) => response.json());

    const request2 = fetch(
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
          phone_number: formData().phone_number,
          gender: formData().gender,
        }),
      }
    ).then((response) => response.json());

    Promise.all([request1, request2])
      .then(([data1, data2]) => {
        setShowSuccess(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <MetaProvider>
      <Title>
        Confirm User Details - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Confirm User Details on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showSuccess()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Details Saved
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>Provided details were saved successfully.</p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/student/semester-registration-period")
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Header />
        <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Confirm User Details
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Quickly confirm the following details to continue.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
            <form autocomplete="off" onSubmit={submit} class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
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
                  <Select
                    label="Faculty:"
                    name="faculty"
                    placeholder="Select"
                    required={true}
                    options={[
                      {
                        value: "Faculty of Biblical Studies",
                        label: "Faculty of Biblical Studies",
                      },
                      {
                        value: "Faculty of Theological Studies",
                        label: "Faculty of Theological Studies",
                      },
                      {
                        value: "Faculty of Practical Theology",
                        label: "Faculty of Practical Theology",
                      },
                      {
                        value: "Faculty of Education",
                        label: "Faculty of Education",
                      },
                    ]}
                    formHandler={formHandler}
                  />
                </div>
                <div>
                  <Switch>
                    <Match when={formData().faculty === ""}>
                      <Select
                        label="Department:"
                        name="department"
                        placeholder="Select"
                        required={true}
                        options={[]}
                        formHandler={formHandler}
                      />
                    </Match>
                    <Match
                      when={
                        formData().faculty === "Faculty of Biblical Studies"
                      }
                    >
                      <Select
                        label="Department:"
                        name="department"
                        placeholder="Select"
                        required={true}
                        options={[
                          {
                            value: "Old Testament",
                            label: "Department of Old Testament",
                          },
                          {
                            value: "New Testament",
                            label: "Department of New Testament",
                          },
                        ]}
                        formHandler={formHandler}
                      />
                    </Match>
                    <Match
                      when={
                        formData().faculty === "Faculty of Theological Studies"
                      }
                    >
                      <Select
                        label="Department:"
                        name="department"
                        placeholder="Select"
                        required={true}
                        options={[
                          {
                            value: "Systematic Theology",
                            label: "Department of Systematic Theology",
                          },
                          {
                            value: "Church History and Historical Theology",
                            label:
                              "Department of Church History and Historical Theology",
                          },
                          {
                            value: "Christian Ethics and Public Theology",
                            label:
                              "Department of Christian Ethics and Public Theology",
                          },
                          {
                            value: "Christian Apologetics",
                            label: "Department of Christian Apologetics",
                          },
                          {
                            value: "Theological Studies",
                            label: "Department of Theological Studies",
                          },
                        ]}
                        formHandler={formHandler}
                      />
                    </Match>
                    <Match
                      when={
                        formData().faculty === "Faculty of Practical Theology"
                      }
                    >
                      <Select
                        label="Department:"
                        name="department"
                        placeholder="Select"
                        required={true}
                        options={[
                          {
                            value: "Pastoral Studies",
                            label: "Department of Pastoral Studies",
                          },
                          {
                            value: "Missions and Intercultural Studies",
                            label:
                              "Department of Missions and Intercultural Studies",
                          },
                          {
                            value: "Youth Ministry",
                            label: "Department of Youth Ministry",
                          },
                          {
                            value: "Leadership and Administration",
                            label:
                              "Department of Leadership and Administration",
                          },
                          {
                            value: "Peace and Conflict Studies",
                            label: "Department of Peace and Conflict Studies",
                          },
                          {
                            value: "Community Development",
                            label: "Department of Community Development",
                          },
                        ]}
                        formHandler={formHandler}
                      />
                    </Match>
                    <Match when={formData().faculty === "Faculty of Education"}>
                      <Select
                        label="Department:"
                        name="department"
                        placeholder="Select"
                        required={true}
                        options={[
                          {
                            value: "Christian Education",
                            label: "Department of Christian Education",
                          },
                          {
                            value: "Biblical Counselling and Psychology",
                            label:
                              "Department of Biblical Counselling and Psychology",
                          },
                        ]}
                        formHandler={formHandler}
                      />
                    </Match>
                  </Switch>
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
