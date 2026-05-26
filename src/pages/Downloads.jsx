import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import { Show, createResource, createSignal } from "solid-js";
import Loading from "../components/Loading";
import { createStore } from "solid-js/store";

export default function Downloads() {
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [loading, setLoading] = createSignal(true);
  const [registrations, setRegistrations] = createStore([]);

  const periodsObj = {};
  const fetchAll = async () => {
    const navigate = useNavigate();
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
      } else if (result.response.status === "change password") {
        navigate("/student/change-default-password", { replace: true });
      } else if (result.response.status === "upload passport") {
        navigate("/student/passport", { replace: true });
      } else if (result.response.status === "complete profile") {
        navigate("/student/complete-profile", { replace: true });
      } else if (result.response.status === "complete") {
        try {
          const response = await fetch(
            VITE_API_URL +
              "/api/view-registrations-by-student/" +
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

          for (let i = 0; i < result.response.length; i++) {
            const response = await fetch(
              VITE_API_URL + "/api/period/" + result.response[i].period_id,
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
            const result2 = await response.json();
            periodsObj[result.response[i].period_id] = [
              result2.response.semester,
              result2.response.session,
            ];
          }

          setRegistrations(result.response);
          setLoading(false);
        } catch (error) {
          console.error(error);
        }
      } else {
        navigate("/student/change-default-password", { replace: true });
      }

      return {
        registrations,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const [resources] = createResource(fetchAll);
  return (
    <MetaProvider>
      <Title>Downloads - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Downloads on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={!loading()} fallback={<Loading />}>
          <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Downloads
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>
                Find useful resources and documents below. You may download and
                print any.
              </p>
            </div>
            <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
              <div class="space-y-6">
                <div class="overflow-x-auto">
                  <table
                    cellPadding={0}
                    cellSpacing={0}
                    class="w-full my-4 border border-black"
                  >
                    <thead>
                      <tr class="bg-blue-950 text-white border-b border-black">
                        <th class="p-4" colSpan={6}>
                          Resources/Docs
                        </th>
                      </tr>
                      <tr class="text-left border-b border-black">
                        <th
                          class="p-4 border-r border-black"
                          id="registration-forms"
                        >
                          #.
                        </th>
                        <th class="p-4 border-r border-black">Title</th>
                        <th class="p-4 border-r border-black">Download</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* <Show
                        when={resources.loading}
                        fallback={
                          <Show
                            when={resources().registrations.length > 0}
                            fallback={
                              <tr>
                                <td colSpan={3} class="p-3 text-center">
                                  No record found.
                                </td>
                              </tr>
                            }
                          >
                            <For each={resources().registrations}>
                              {(registration, i) => (
                                <tr class="text-left border-b border-black">
                                  <td class="p-4 border-r border-black font-semibold">
                                    {i() + 1}.
                                  </td>
                                  <td class="p-4 border-r border-black">
                                    {registration.current_level}
                                  </td>
                                  <td class="p-4 border-r border-black">
                                    <Show
                                      when={registration.status === "complete"}
                                      fallback={
                                        <span
                                          disabled
                                          class="gray-btn p-3 cursor-not-allowed line-through"
                                        >
                                          Print
                                        </span>
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/student/print-registration-form/1/" +
                                          registration.period_id +
                                          "/" +
                                          JSON.parse(
                                            localStorage.getItem("jetsUser")
                                          ).custom_id
                                        }
                                        class="green-btn p-3 hover:opacity-60"
                                      >
                                        Print
                                      </A>
                                    </Show>
                                  </td>
                                </tr>
                              )}
                            </For>
                          </Show>
                        }
                      > */}
                      <tr class="text-left border-b border-black">
                        <td class="p-4 border-r border-black font-semibold">
                          1.
                        </td>
                        <td class="p-4 border-r border-black">
                          School Calendar
                        </td>
                        <td class="p-4">
                          <a
                            class="hover:text-red-600"
                            target="_blank"
                            href="#"                           
                          >
                            COMPREHENSIVE SCHOOL CALENDAR.
                          </a>
                        </td>
                      </tr>
                      <tr class="text-left border-b border-black">
                        <td class="p-4 border-r border-black font-semibold">
                          2.
                        </td>
                        <td class="p-4 border-r border-black">
                          Course Listings
                        </td>
                        <td class="p-4">
                          <a
                            class="hover:text-red-600"
                            target="_blank"
                            href="#"
                          >
                            View/Download the Course Listings
                            (PDF)
                          </a>
                        </td>
                      </tr>
                      <tr class="text-left border-b border-black">
                        <td class="p-4 border-r border-black font-semibold">
                          3.
                        </td>
                        <td class="p-4 border-r border-black">Timetable</td>
                        <td class="p-4">
                          <a
                            class="hover:text-red-600"
                            target="_blank"
                            href="#"
                          >
                            ETSK,  SECOND SEMESTER (JAN. – MAY.) 2025 TIMETABLE (PDF)
                          </a>
                        </td>
                      </tr>
                      <tr class="text-left border-b border-black">
                        <td class="p-4 border-r border-black font-semibold">
                          4.
                        </td>
                        <td class="p-4 border-r border-black">Quick Survey</td>
                        <td class="p-4">
                          <a
                            class="hover:text-red-600"
                            target="_blank"
                            href="#"
                          >
                            ETSK ICT Dept. - Survey on Students' Online Registration
                          </a>
                        </td>
                      </tr>
                      {/* </Show> */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
