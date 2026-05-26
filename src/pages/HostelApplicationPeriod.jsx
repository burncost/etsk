import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";
import Success from "../components/icons/Success";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

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
    try {
      const res = await fetch(VITE_API_URL + "/api/view-periods", {
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

export default function HostelApplicationPeriod() {
  const [periods] = createResource(fetchPeriods);
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);

  const updateHostelApplication = async (period_id, status) => {
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
            accommodation_status: status === "closed" ? "opened" : "closed",
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

  return (
    <MetaProvider>
      <Title>Hostel Requests - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Hostel Requests on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showSuccess2()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Status Changed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black">
                <Success />
                <p class="text-center">
                  The status of the particular period was changed successfully!
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href = "/admin/hostel-applications-period")
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
            Hostel Requests: Choose Period
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Choose the appropriate semester(s) and session.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <table
              cellPadding={0}
              cellSpacing={0}
              class="w-full my-4 border border-black"
            >
              <thead class="bg-blue-950 text-white border-b border-black">
                <tr>
                  <td class="p-4 border-r border-black">#.</td>
                  <td class="p-4 border-r border-black">Sem.</td>
                  <td class="p-4 border-r border-black">Session</td>
                  <td class="p-4 border-r border-black">Status</td>
                  <td class="p-4">View</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={periods.loading}
                  fallback={
                    <Show
                      when={periods().length > 0}
                      fallback={
                        <tr>
                          <td colSpan={5} class="p-4 text-center">
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
                            <td class="p-4 border-r border-black uppercase">
                              {period.semester}
                            </td>
                            <td class="p-4 border-r border-black">
                              {period.session}
                            </td>
                            <td class="p-4 border-r border-black font-semibold">
                              <b class="uppercase">
                                {period.accommodation_status}
                              </b>{" "}
                              <Show
                                when={
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .surname === "porter" ||
                                  JSON.parse(localStorage.getItem("jetsUser"))
                                    .surname === "ict"
                                }
                              >
                                <i class="inline-block">
                                  [
                                  <span
                                    onClick={() =>
                                      updateHostelApplication(
                                        period.period_id,
                                        period.accommodation_status
                                      )
                                    }
                                    class="text-red-600 hover:opacity-60 cursor-pointer"
                                  >
                                    Change Status
                                  </span>
                                  ]
                                </i>
                              </Show>
                            </td>
                            <td class="p-4">
                              <A
                                href={
                                  "/admin/hostel-applications/" +
                                  period.period_id
                                }
                                class="green-btn p-3 border border-black text-center hover:opacity-60"
                              >
                                Proceed
                              </A>
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
