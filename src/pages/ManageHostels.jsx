import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";
import TextInput from "../components/TextInput";
import Success from "../components/icons/Success";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const schema = z.object({
  hostel_name: z.string().min(1, "*Required"),
  amount_per_semester: z.string().min(1, "*Required"),
  amount_per_summer: z.string().min(1, "*Required"),
});

export default function ManageHostels() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [showModal, setShowModal] = createSignal(false);
  const [message, setMessage] = createSignal("");

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const fetchHostels = async () => {
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
      try {
        const res = await fetch(VITE_API_URL + "/api/view-hostels", {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        });
        const result = await res.json();
        return result.response;
      } catch (error) {
        console.error(error);
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  const updateHostel = async (id, status) => {
    setIsProcessing(true);
    try {
      const response = await fetch(VITE_API_URL + "/api/edit-hostel/" + id, {
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
          status: status === "closed" ? "opened" : "closed",
        }),
      });

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

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch(VITE_API_URL + "/api/create-hostel", {
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
          hostel_name: formData().hostel_name,
          amount_per_semester: formData().amount_per_semester,
          amount_per_summer: formData().amount_per_summer,
          status: "closed",
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

  const [hostels] = createResource(fetchHostels);
  return (
    <MetaProvider>
      <Title>Manage Hostels - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Manage Hostels on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showSuccess2()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Status Changed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>
                  The status of the particular hostel was changed successfully!
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href = "/admin/manage-hostels")
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Show when={showModal()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Add Another Hostel
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
                        <TextInput
                          label="Name of Hostel:"
                          name="hostel_name"
                          required={true}
                          type="text"
                          formHandler={formHandler}
                        />
                        <div class="text-xs text-blue-900">
                          <b>Example:</b> Bingham Hostel Flat
                        </div>
                      </div>
                      <div>
                        <TextInput
                          label="Amount Per Semester:"
                          name="amount_per_semester"
                          required={true}
                          type="number"
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <TextInput
                          label="Amount Per Summer:"
                          name="amount_per_summer"
                          required={true}
                          type="number"
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
                  <p>The Hostel was added successfully!</p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href = "/admin/manage-hostels")
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
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Manage Hostels
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Create and manage Hostel Blocks here.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4 overflow-x-scroll">
            <div>
              +
              <span
                onClick={() => setShowModal(true)}
                class="border-b border-red-600 font-semibold hover:opacity-60 cursor-pointer"
              >
                Add Another Hostel
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
                  <td class="p-4 border-r border-black">Hostel Name</td>
                  <td class="p-4 border-r border-black">Amount Per Semester</td>
                  <td class="p-4 border-r border-black">Amount Per Summer</td>
                  <td class="p-4 border-r border-black">Manage Rooms</td>
                  <td class="p-4">Status</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={hostels.loading}
                  fallback={
                    <Show
                      when={hostels().length > 0}
                      fallback={
                        <tr>
                          <td colSpan={6} class="p-4 text-center">
                            No record found.
                          </td>
                        </tr>
                      }
                    >
                      <For each={hostels()}>
                        {(hostel, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black uppercase">
                              {hostel.hostel_name}
                            </td>
                            <td class="p-4 border-r border-black">
                              {formatter.format(+hostel.amount_per_semester)}
                            </td>
                            <td class="p-4 border-r border-black">
                              {formatter.format(+hostel.amount_per_summer)}
                            </td>
                            <td class="p-4 border-r border-black">
                              <A
                                href={
                                  "/admin/manage-rooms/" +
                                  hostel.id +
                                  "/" +
                                  hostel.hostel_name +
                                  "/" +
                                  hostel.status
                                }
                                class="green-btn p-3 border border-black text-center hover:opacity-60"
                              >
                                Rooms
                              </A>
                            </td>
                            <td class="p-4">
                              <b class="uppercase">{hostel.status}</b>{" "}
                              <i class="inline-block">
                                [
                                <span
                                  onClick={() =>
                                    updateHostel(hostel.id, hostel.status)
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
                  }
                >
                  <tr>
                    <td colSpan={6} class="p-1 text-center">
                      <Loading />
                    </td>
                  </tr>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
