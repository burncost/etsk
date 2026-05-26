import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";

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
    JSON.parse(localStorage.getItem("jetsUser")).role === "faculty"
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

export default function AssignedCoursesPeriod() {
  const [periods] = createResource(fetchPeriods);

  return (
    <MetaProvider>
      <Title>Assigned Courses - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Assigned Courses on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Assigned Courses: Choose Period
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
                            <td class="p-4">
                              <A
                                href={
                                  "/faculty/assigned-courses/" +
                                  period.period_id
                                }
                                class="green-btn p-3 border border-black text-center hover:opacity-60"
                              >
                                View
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
