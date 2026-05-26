import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import { Show, createResource, createSignal } from "solid-js";
import Loading from "../components/Loading";
import { createStore } from "solid-js/store";

export default function PrintOuts() {
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [registrations, setRegistrations] = createStore([]);
  const [details, setDetails] = createSignal();

  const [studentRequests, setStudentRequests] = createStore([]);
  const [studentRequestsEmpty, setStudentRequestsEmpty] = createSignal(false);

  const fetchRequests = async () => {
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
        navigate("/");
      } else {
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

        const requests_array = [];
        for (let i = 0; i < result.response.length; i++) {
          const request1 = fetch(
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
          ).then((response) => response.json());

          const request2 = fetch(
            VITE_API_URL +
              "/api/hostel-application/" +
              result.response[i].period_id +
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
          ).then((response) => response.json());

          Promise.all([request1, request2])
            .then(([data1, data2]) => {
              var student = {
                year: result.response[i].current_level,
                semester: data1.response.semester,
                session: data1.response.session,
                registration_status: result.response[i].registration_status,
                period: result.response[i].period_id,
                add_drop_status: result.response[i].add_drop_status
                  ? result.response[i].add_drop_status
                  : "Did not participate",
                accommodation_status: data2.response
                  ? data2.response.status
                  : "Did not participate",
              };
              requests_array.push(student);

              setStudentRequests(requests_array);

              if (requests_array.length < 1) {
                setStudentRequestsEmpty(true);
              }
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
      return {
        studentRequests,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const [resources] = createResource(fetchRequests);
  return (
    <MetaProvider>
      <Title>Print Outs - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Print Outs on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Print Outs
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Ensure you print and keep a copy of each of your print-outs. You
              will need them in the nearest future during your graduation
              clearance.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4 overflow-y-scroll">
            <Show
              when={resources.loading}
              fallback={
                <div class="space-y-6">
                  <table cellPadding={0} cellSpacing={0} class="w-full my-4">
                    <thead class="bg-blue-950 text-white border-b border-black">
                      <tr>
                        <td class="p-4 border-r border-black">#.</td>
                        <td class="p-4 border-r border-black">Semester</td>
                        <td class="p-4 border-r border-black">Session</td>
                        <td class="p-4 border-r border-black">Level</td>
                        <td class="p-4 border-r border-black">Registration</td>
                        <td class="p-4 border-r border-black">Add/Drop</td>
                        <td class="p-4">Hostel Accomm.</td>
                      </tr>
                    </thead>
                    <Show
                      when={
                        resources().studentRequests.length !== "undefined" &&
                        resources().studentRequests.length > 0
                      }
                    >
                      {console.log(resources().studentRequests)}
                      <For each={resources().studentRequests}>
                        {(studentRequest, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                            <td class="p-4 font-semibold border-r border-black">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black">
                              {studentRequest.semester}
                            </td>
                            <td class="p-4 border-r border-black">
                              {studentRequest.session}
                            </td>
                            <td class="p-4 border-r border-black">
                              {studentRequest.year}
                            </td>
                            <td class="p-4 border-r border-black capitalize">
                              <div class="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
                                <div>{studentRequest.registration_status}</div>
                                <div>
                                  {studentRequest.registration_status ===
                                  "completed" ? (
                                    <A
                                      target="_blank"
                                      href={
                                        "/student/print-registration-form/" +
                                        studentRequest.period +
                                        "/" +
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).custom_id
                                      }
                                      class="block text-center blue-btn p-3 hover:opacity-60"
                                    >
                                      Print
                                    </A>
                                  ) : (
                                    <span class="block text-center gray-btn p-3 hover:opacity-60 line-through cursor-not-allowed">
                                      Print
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td class="p-4 border-r border-black capitalize">
                              <div class="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
                                <div>{studentRequest.add_drop_status}</div>
                                <div>
                                  {studentRequest.add_drop_status ===
                                  "completed" ? (
                                    <A
                                      target="_blank"
                                      href={
                                        "/student/print-add-drop-form/" +
                                        studentRequest.period +
                                        "/" +
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).custom_id
                                      }
                                      class="block text-center blue-btn p-3 hover:opacity-60"
                                    >
                                      Print
                                    </A>
                                  ) : (
                                    <span class="block text-center gray-btn p-3 hover:opacity-60 line-through cursor-not-allowed">
                                      Print
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td class="p-4 space-x-1 capitalize">
                              <div class="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
                                <div>{studentRequest.accommodation_status}</div>
                                <div>
                                  {studentRequest.accommodation_status ===
                                  "complete" ? (
                                    <A
                                      target="_blank"
                                      href={
                                        "/student/print-hostel-form/" +
                                        studentRequest.period +
                                        "/" +
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).custom_id
                                      }
                                      class="block text-center blue-btn p-3 hover:opacity-60"
                                    >
                                      Print
                                    </A>
                                  ) : (
                                    <span class="block text-center gray-btn p-3 hover:opacity-60 line-through cursor-not-allowed">
                                      Print
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </For>
                    </Show>
                  </table>
                </div>
              }
            >
              <div class="p-1 text-center">
                <Loading />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
