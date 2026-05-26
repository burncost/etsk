import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";

import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import { createStore } from "solid-js/store";
import Warning from "../components/icons/Warning";
import { Select } from "../components/Select";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const schema = z.object({
  previous_stay: z.string().min(1, "*Required"),
});

export default function ApplyForHostelPeriod() {
  const [showHostels, setShowHostels] = createSignal(false);
  const [notRegistered, setNotRegistered] = createSignal(false);
  const [registered, setRegistered] = createSignal(false);
  const [hostels, setHostels] = createStore([]);
  const [periods, setPeriods] = createStore([]);
  const [accommodationWallet, setAccommodationWallet] = createSignal();
  const [season, setSeason] = createSignal();
  const [numOfBeds, setNumOfBeds] = createStore([]);
  const [chosenPeriod, setChosenPeriod] = createSignal();
  const [isProcessing, setIsProcessing] = createSignal(false);
  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const startApplicationData = async () => {
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
        const request1 = fetch(VITE_API_URL + "/api/view-periods", {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }).then((response) => response.json());

        const request2 = fetch(VITE_API_URL + "/api/view-hostels", {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("jetsUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }).then((response) => response.json());

        const request3 = fetch(
          VITE_API_URL +
            "/api/accommodation-wallet/" +
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
        ).then((response) => response.json());

        Promise.all([request1, request2, request3])
          .then(([data1, data2, data3]) => {
            setAccommodationWallet(data3.response.amount);
            setHostels(data2.response);
            getBeds(data2.response);
            setPeriods(data1.response);
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        accommodationWallet,
        hostels,
        periods,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const c = {};
  var countBeds = 0;
  const getBeds = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      try {
        const res = await fetch(
          VITE_API_URL + "/api/view-all-beds/" + arr[i].id,
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
        if (result.response.length > 0) {
          var allBeds = result.response;
          for (let i = 0; i < allBeds.length; i++) {
            if (allBeds[i].status === "opened") {
              countBeds = countBeds + 1;
            }
          }
        } else {
          countBeds = result.response.length;
        }
        c[arr[i].id] = countBeds;
      } catch (error) {
        console.error(error);
      }
    }
    setNumOfBeds(c);
  };

  const doShowHostels = async (periodId, season) => {
    var registration = await fetchRegistration(periodId);
    var application = await fetchApplication(periodId);
    setSeason(season);
    setChosenPeriod(periodId);
    if (application) {
      navigate(
        "/student/hostel-form/" +
          chosenPeriod() +
          "/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        { replace: true }
      );
    } else {
      if (registration && registration.registration_status === "completed") {
        setRegistered(true);
      } else {
        setNotRegistered(true);
      }
      setShowHostels(true);
    }
  };

  const fetchRegistration = async (periodId) => {
    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/registration/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id +
          "?period_id=" +
          periodId,
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

      return result.response;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApplication = async (periodId) => {
    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/hostel-application/" +
          periodId +
          "/" +
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

      return result.response;
    } catch (error) {
      console.error(error);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      const response = await fetch(
        VITE_API_URL + "/api/create-hostel-application",
        {
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
            custom_id: JSON.parse(localStorage.getItem("jetsUser")).custom_id,
            previous_stay: formData().previous_stay,
            period_id: chosenPeriod(),
            status: "awaiting bursar",
          }),
        }
      );

      const result = await response.json();

      setIsProcessing(false);
      navigate(
        "/student/hostel-form/" +
          chosenPeriod() +
          "/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id,
        { replace: true }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const [applicationData] = createResource(startApplicationData);
  return (
    <MetaProvider>
      <Title>Apply for Hostel - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Apply for Hostel on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={showHostels()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 h-auto sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6 overflow-y-auto">
              <Show when={notRegistered()}>
                <h2 class="text-center text-blue-900 font-semibold">
                  Not Registered
                </h2>
                <div class="my-2 border-t border-b py-4 border-black text-left">
                  <Warning />
                  <p>
                    You are not registered for the chosen semester hence are NOT
                    ELIGIBLE to apply for Hostel Accommodation. Please complete
                    your registration for the chosen semester to be eligible.
                  </p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href =
                        "/student/apply-for-hostel-period")
                    }
                    class="blue-btn text-white p-3 hover:opacity-60"
                  >
                    Close
                  </button>
                </div>
              </Show>
              <Show when={registered()}>
                <h2 class="text-center text-blue-900 font-semibold">
                  Start Hostel Application
                </h2>
                <form autocomplete="off" onSubmit={submit} class="">
                  <div class="my-2 border-t border-b py-4 border-black text-left">
                    <div>
                      <Select
                        label={
                          "Did you stay in the Hostel last SEMESTER or SUMMER?"
                        }
                        name="previous_stay"
                        placeholder="Select"
                        required={true}
                        options={[
                          {
                            value: "no",
                            label:
                              "NO. I did not stay in the hostel last semester or summer.",
                          },
                          {
                            value: "last summer",
                            label: "YES. I stayed in the hostel LAST SUMMER.",
                          },
                          {
                            value: "last semester",
                            label: "YES. I stayed in the hostel LAST SEMESTER.",
                          },
                        ]}
                        formHandler={formHandler}
                      />
                    </div>
                  </div>
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
                            <button disabled class="gray2-btn cursor-wait p-3">
                              Processing.. .
                            </button>
                          </Show>
                        </>
                      }
                    >
                      <button disabled class="gray-btn p-3 cursor-not-allowed">
                        Submit
                      </button>
                    </Show>
                    <button
                      onClick={() =>
                        (window.location.href =
                          "/student/apply-for-hostel-period")
                      }
                      class="blue-btn text-white p-3 hover:opacity-60"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </Show>
            </div>
          </div>
        </Show>
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Apply for Hostel: Choose Period
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Choose the appropriate semester(s) and session.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4 overflow-x-auto">
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
                  <td class="p-4">Start/Continue</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={applicationData.loading}
                  fallback={
                    <Show
                      when={applicationData().periods.length > 0}
                      fallback={
                        <tr>
                          <td colSpan={5} class="p-4 text-center">
                            No record found.
                          </td>
                        </tr>
                      }
                    >
                      <For each={applicationData().periods}>
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
                            <td class="p-4">
                              <Show
                                when={period.accommodation_status === "closed"}
                                fallback={
                                  <span
                                    onClick={() => {
                                      doShowHostels(
                                        period.period_id,
                                        period.season
                                      );
                                    }}
                                    class="cursor-pointer green-btn p-3 border border-black text-center hover:opacity-60"
                                  >
                                    Start/Continue
                                  </span>
                                }
                              >
                                <button
                                  disabled
                                  class="gray-btn p-3 border border-black text-center cursor-not-allowed line-through"
                                >
                                  Start/Continue
                                </button>
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                    </Show>
                  }
                >
                  <tr>
                    <td colSpan={5} class="p-1 text-center">
                      Fetching.. .
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
