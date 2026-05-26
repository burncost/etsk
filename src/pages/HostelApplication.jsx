import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Show, createSignal, createResource } from "solid-js";
import { createStore } from "solid-js/store";

import Header from "../components/Header";
import { Select } from "../components/Select";
import TextInput from "../components/TextInput";
import Success from "../components/icons/Success";

const schema = z.object({
  semester: z.string().min(1, "*Required"),
  session: z.string().min(1, "*Required"),
  season: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const [initialPeriod, setInitialPeriod] = createStore([]);
const fetchPeriods = async () => {
  const navigate = useNavigate();
  const now = new Date();
  if (
    localStorage.getItem("jetsUser") &&
    now.getTime() > JSON.parse(localStorage.getItem("jetsUser")).expiry
  ) {
    localStorage.removeItem("jetsUser");
    navigate("/");
  }
  if (
    localStorage.getItem("jetsUser") &&
    JSON.parse(localStorage.getItem("jetsUser")).role === "admin"
  ) {
    fetch(VITE_API_URL + "/api/view-periods", {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${
          JSON.parse(localStorage.getItem("jetsUser")).token
        }`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "GET",
    })
      .then((res1) => {
        return res1.json();
      })
      .then((data1) => {
        setInitialPeriod(data1.response);
      })
      .catch((error) => {
        console.error(error);
      });

    return initialPeriod;
  } else {
    navigate("/", { replace: true });
  }
};

export default function HostelApplication() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showModal, setShowModal] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    if (formData().semester === "1st") {
      var x = 1;
    }
    if (formData().semester === "2nd") {
      var x = 2;
    }
    if (formData().semester === "Pre-Summer") {
      var x = 3;
    }
    if (formData().semester === "Summer") {
      var x = 0;
    }

    const genId = x + formData().session.replace("/", "");

    try {
      const response = await fetch(VITE_API_URL + "/api/create-period", {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("jetsUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          semester: formData().semester,
          session: formData().session,
          season: formData().season,
          registration_status: "closed",
          add_drop_status: "closed",
          accommodation_status: "closed",
          period_id: genId,
        }),
      });

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

  const updateRegistration = async (period_id, status) => {
    setIsProcessing(true);
    console.log(status);
    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-period/" + period_id,
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
            registration_status: status === "closed" ? "opened" : "closed",
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.log(result);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        setShowSuccess2(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateAddDrop = async (period_id, status) => {
    setIsProcessing(true);

    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-period/" + period_id,
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
            add_drop_status: status === "closed" ? "opened" : "closed",
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        setShowSuccess2(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [periods] = createResource(fetchPeriods);

  return (
    <MetaProvider>
      <Title>
        Manage Registration Period - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Manage Registration Period on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showModal()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Create New Registration Period
              </h2>
              <Show
                when={showSuccess()}
                fallback={
                  <div class="my-2 border-t border-b py-4 border-black">
                    <form
                      autocomplete="off"
                      onSubmit={submit}
                      class="space-y-4"
                    >
                      <div>
                        <Select
                          label="Semester:"
                          name="semester"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "1st",
                              label: "1st Semester",
                            },
                            {
                              value: "2nd",
                              label: "2nd Semester",
                            },
                            {
                              value: "Pre-Summer",
                              label: "Pre-Summer",
                            },
                            {
                              value: "Summer",
                              label: "Summer",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <TextInput
                          label="Session:"
                          name="session"
                          required={true}
                          type="text"
                          formHandler={formHandler}
                        />
                        <div class="text-xs text-blue-900">
                          <b>Example:</b> 2023/2024
                        </div>
                      </div>
                      <div>
                        <Select
                          label="Season:"
                          name="season"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "regular",
                              label: "Regular",
                            },
                            {
                              value: "summer",
                              label: "Summer",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </div>
                      <Show when={message() !== ""}>
                        <div class="bg-purple-200 text-purple-900 p-3 text-center animate-pulse border-l-2 border-black">
                          {message()}
                        </div>
                      </Show>
                      <div class="text-right space-x-3">
                        <Show
                          when={formHandler.isFormInvalid()}
                          fallback={
                            <>
                              <Show
                                when={isProcessing()}
                                fallback={
                                  <button
                                    type="submit"
                                    class="red-btn p-3 hover:opacity-60"
                                  >
                                    Submit
                                  </button>
                                }
                              >
                                <button
                                  disabled
                                  class="gray2-btn cursor-wait p-3"
                                >
                                  Processing.. .
                                </button>
                              </Show>
                            </>
                          }
                        >
                          <button
                            disabled
                            class="gray-btn p-3 cursor-not-allowed"
                          >
                            Submit
                          </button>
                        </Show>
                        <button
                          onClick={() => setShowModal(false)}
                          class="gray-btn text-white p-3 hover:opacity-60"
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                }
              >
                <div class="my-2 border-t border-b py-4 border-black text-center">
                  <Success />
                  <p>
                    The Portal Wallet Balance for the particular student was
                    changed successfully!
                  </p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href =
                        "/admin/manage-semester-registration")
                    }
                    class="blue-btn text-white p-3 hover:opacity-60"
                  >
                    Ok. Continue
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </Show>
        <Show when={showSuccess2()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Status Changed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black">
                <Success />
                <p>
                  The status of the particular period was changed successfully!
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/admin/manage-semester-registration")
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
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Manage Registration Period
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Create and manage semester registrations here.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <div>
              +
              <span
                onClick={() => setShowModal(true)}
                class="border-b border-red-600 font-semibold hover:opacity-60 cursor-pointer"
              >
                Create New Registration Period
              </span>
            </div>
            <table
              cellPadding={0}
              cellSpacing={0}
              class="w-full my-4 border border-black"
            >
              <thead class="bg-blue-950 text-white border-b border-black">
                <tr>
                  <td class="p-4 border-r border-black">#.</td>
                  <td class="p-4 border-r border-black">Semester</td>
                  <td class="p-4 border-r border-black">Session</td>
                  <td class="p-4 border-r border-black">Season</td>
                  <td class="p-4 border-r border-black">Registration Status</td>
                  <td class="p-4">Add/Drop Status</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={periods()}
                  fallback={
                    <tr>
                      <td colSpan={6} class="p-4 text-center">
                        Fetching.. .
                      </td>
                    </tr>
                  }
                >
                  <Show
                    when={periods().length > 0}
                    fallback={
                      <tr>
                        <td colSpan={6} class="p-4 text-center">
                          No record found.
                        </td>
                      </tr>
                    }
                  >
                    <For each={periods()}>
                      {(period, i) => (
                        <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                          <td class="p-4 border-r border-black font-semibold">
                            {i() + 1}.
                          </td>
                          <td class="p-4 border-r border-black">
                            {period.semester}
                          </td>
                          <td class="p-4 border-r border-black">
                            {period.session}
                          </td>
                          <td class="p-4 border-r border-black font-semibold">
                            <span class="uppercase">{period.season}</span>
                          </td>
                          <td class="p-4 border-r border-black font-semibold">
                            <span class="uppercase">
                              {period.registration_status}
                            </span>{" "}
                            <i class="inline-block">
                              [
                              <span
                                onClick={() =>
                                  updateRegistration(
                                    period.period_id,
                                    period.registration_status
                                  )
                                }
                                class="text-red-600 hover:opacity-60 cursor-pointer"
                              >
                                Change Status
                              </span>
                              ]
                            </i>
                          </td>
                          <td class="p-4 font-semibold">
                            <span class="uppercase">
                              {period.add_drop_status}
                            </span>{" "}
                            <i class="inline-block">
                              [
                              <span
                                onClick={() =>
                                  updateAddDrop(
                                    period.period_id,
                                    period.add_drop_status
                                  )
                                }
                                class="text-red-600 hover:opacity-60 cursor-pointer"
                              >
                                Change Status
                              </span>
                              ]
                            </i>
                          </td>
                        </tr>
                      )}
                    </For>
                  </Show>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
