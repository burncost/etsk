import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Match, Show, Switch, createResource, createSignal } from "solid-js";

import Header from "../components/Header";
import { Select } from "../components/Select";
import Loading from "../components/Loading";
import Failure from "../components/icons/Failure";

const schema = z.object({
  fresh_returning: z.string().min(1, "*Required"),
  affiliation_fee: z.string().optional(),
  current_level: z.string().min(1, "*Required"),
});

export default function AddDropPeriod() {
  const navigate = useNavigate();
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [showModal, setShowModal] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [periodId, setPeriodId] = createSignal("");
  const [programme, setProgramme] = createSignal("");
  const [affiliation_status, setAffiliationStatus] = createSignal("");
  const [programmeCategory, setProgrammeCategory] = createSignal("");
  const [underPost, setUnderPost] = createSignal("");
  const [department, setDepartment] = createSignal("");
  const [notRegistered, setNotRegistered] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const fetchPeriods = async () => {
    const navigate = useNavigate();

    if (
      localStorage.getItem("jetsUser") &&
      JSON.parse(localStorage.getItem("jetsUser")).role === "student"
    ) {
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
      } else if (result.response.status === "change password") {
        navigate("/student/change-default-password", { replace: true });
      } else if (result.response.status === "upload passport") {
        navigate("/student/passport", { replace: true });
      } else if (result.response.status === "complete profile") {
        navigate("/student/complete-profile", { replace: true });
      } else {
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
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  const startAddDrop = async () => {
    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/edit-registration/" +
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
            add_drop_status: "started",
            period_id: periodId(),
          }),
        }
      );
      const result = await response.json();
      navigate(
        "/student/add-drop-form/" +
          periodId() +
          "/" +
          JSON.parse(localStorage.getItem("jetsUser")).custom_id
      );
    } catch (error) {
      console.error(error);
    }
  };

  const startContinueAddDrop = async (period_id) => {
    const custom_id = JSON.parse(localStorage.getItem("jetsUser")).custom_id;
    setIsProcessing(true);
    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/registration/" +
          custom_id +
          "?period_id=" +
          period_id,
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

      if (result.response) {
        setIsProcessing(false);
        if (result.response.registration_status === "completed") {
          if (!result.response.add_drop_status) {
            setShowModal(true);
            setPeriodId(period_id);
          } else {
            navigate("/student/add-drop-form/" + period_id + "/" + custom_id);
          }
        } else {
          setIsProcessing(false);
          setNotRegistered(true);
        }
      } else {
        setIsProcessing(false);
        setNotRegistered(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [periods] = createResource(fetchPeriods);

  return (
    <MetaProvider>
      <Title>Add/Drop - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Add/Drop on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showModal()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Start Add/Drop
              </h2>

              <div class="my-2 border-t border-b py-4 border-black">
                <div class="space-y-2">
                  <p>
                    Courses may be added or dropped within the first two weeks
                    of semester without any charge to the student's account. Any
                    changes made between the third week and mid-semester will be
                    charged accordingly and the letter "W" (withdraw) will enter
                    the student's record as the case may be. No refunds after
                    mid-semester. No course can be added 2 weeks after official
                    registration. (see calendar on last day to register). "WF"
                    (withdraw fail) will enter the student's record for courses
                    dropped after mid-semester. No courses from previous
                    semester(s) can be dropped or added in the current semester.
                    To add or drop a course fill out the appropriate section(s)
                    on this form.
                  </p>
                  <p>
                    <b>Note:</b>
                    <br />
                    You have not done Add/Drop until you have a print out to
                    that effect. This is important.
                  </p>
                </div>
                <div class="mt-4 text-center">
                  <button
                    onClick={startAddDrop}
                    class="red-btn p-3 hover:opacity-60"
                  >
                    Proceed with Add/Drop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Show>
        <Show when={notRegistered()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Not Registered!
              </h2>

              <div class="my-2 border-t border-b py-4 border-black text-center space-y-6">
                <Failure />
                <p>
                  You are not registered for the chosen semester therefore you
                  cannot Add/Drop courses.
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() => {
                    setNotRegistered(false);
                  }}
                  class="red-btn text-white p-3 hover:opacity-60"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Header />
        <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Add/Drop: Choose Period
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Choose the appropriate semester(s) and session you wish to do
              Add/Drop.
            </p>
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
                  <td class="p-4 border-r border-black">Season</td>
                  <td class="p-4 border-r border-black">Status</td>
                  <td class="p-4">Register</td>
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
                          <td colSpan={6} class="p-3 text-center">
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
                            <td class="p-4 border-r border-black capitalize">
                              {period.semester}
                            </td>
                            <td class="p-4 border-r border-black">
                              {period.session}
                            </td>
                            <td class="p-4 border-r border-black capitalize">
                              {period.season}
                            </td>
                            <td class="p-4 border-r border-black capitalize font-semibold ">
                              {period.add_drop_status}
                            </td>
                            <td class="p-4">
                              <Show
                                when={period.add_drop_status === "closed"}
                                fallback={
                                  <Show
                                    when={isProcessing()}
                                    fallback={
                                      <button
                                        onClick={() =>
                                          startContinueAddDrop(period.period_id)
                                        }
                                        class="red-btn p-3 border border-black text-center hover:opacity-60"
                                      >
                                        Start/Continue
                                      </button>
                                    }
                                  >
                                    <button
                                      disabled
                                      class="gray2-btn p-3 border border-black text-center cursor-not-allowed animate-pulse"
                                    >
                                      Processing.. .
                                    </button>
                                  </Show>
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
                    <td colSpan={6} class="p-3 text-center">
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
