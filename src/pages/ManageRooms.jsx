import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";
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
  room_number: z.string().min(1, "*Required"),
});

export default function ManageRooms() {
  const params = useParams();
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [showModal, setShowModal] = createSignal(false);
  const [message, setMessage] = createSignal("");

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const fetchRooms = async () => {
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
        const res = await fetch(
          VITE_API_URL + "/api/view-rooms/" + params.hostelId,
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
        const result = await res.json();
        return result.response;
      } catch (error) {
        console.error(error);
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  const updateRoom = async (id, hostel_id, status) => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-room/" + id + "/" + hostel_id,
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
            status: status === "closed" ? "opened" : "closed",
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

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch(VITE_API_URL + "/api/create-room", {
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
          room_number: formData().room_number,
          hostel_id: params.hostelId,
          status: "opened",
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

  const [rooms] = createResource(fetchRooms);
  return (
    <MetaProvider>
      <Title>Manage Rooms - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Manage Rooms on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showModal()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Add Another Room
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
                          label="Room Number/Name:"
                          name="room_number"
                          required={true}
                          type="text"
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
                  <p>Room was added successfully!</p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href = "/admin/manage-rooms")
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
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>
                  The status of the particular room was changed successfully!
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/admin/manage-rooms/" +
                      params.hostelId +
                      "/" +
                      params.hostelName +
                      "/" +
                      params.hostelStatus)
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
            Rooms / {decodeURI(params.hostelName)}
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Create and manage Hostel Rooms here.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4 overflow-x-scroll">
            <div>
              +
              <span
                onClick={() => setShowModal(true)}
                class="border-b border-red-600 font-semibold hover:opacity-60 cursor-pointer"
              >
                Add Another Room
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
                  <td class="p-4 border-r border-black">Room Number</td>
                  <td class="p-4 border-r border-black">
                    Number of Bedspace(s)
                  </td>
                  <td class="p-4 border-r border-black">View Bedspace(s)</td>
                  <td class="p-4">Status</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={rooms.loading}
                  fallback={
                    <Show
                      when={rooms().length > 0}
                      fallback={
                        <tr>
                          <td colSpan={5} class="p-4 text-center">
                            No record found.
                          </td>
                        </tr>
                      }
                    >
                      <For each={rooms()}>
                        {(room, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black">
                              Room <b>{room.room_number}</b>
                            </td>
                            <td class="p-4 border-r border-black">-</td>
                            <td class="p-4 border-r border-black">
                              <A
                                href={
                                  "/admin/manage-beds/" +
                                  room.id +
                                  "/" +
                                  room.room_number +
                                  "/" +
                                  params.hostelId +
                                  "/" +
                                  params.hostelName +
                                  "/" +
                                  room.status
                                }
                                class="green-btn p-3 border border-black text-center hover:opacity-60"
                              >
                                Bedspace(s)
                              </A>
                            </td>
                            <td class="p-4">
                              <b class="uppercase">{room.status}</b>{" "}
                              <i class="inline-block">
                                [
                                <span
                                  onClick={() =>
                                    updateRoom(
                                      room.id,
                                      room.hostel_id,
                                      room.status
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
                  }
                >
                  <tr>
                    <td colSpan={5} class="p-1 text-center">
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
