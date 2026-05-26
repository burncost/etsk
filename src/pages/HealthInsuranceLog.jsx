import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource, Show, For } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "../components/Loading";

const schema = z.object({
  undertaking: z.string().min(1, "*Required"),
});

export default function HealthInsuranceLog() {
  const params = useParams();

  const [undertakingPop, setUndertakingPop] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [HealthInsurance, setHealthInsurance] = createStore([]);
  const [HealthInsuranceEmpty, setHealthInsuranceEmpty] = createSignal(false);

  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const fetchRegistrations = async () => {
    const navigate = useNavigate();
    if (
      localStorage.getItem("jetsUser") &&
      JSON.parse(localStorage.getItem("jetsUser")).role === "admin"
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
      } else {
        await fetchPeriod();
        const request1 = fetch(
          VITE_API_URL + "/api/view-registrations/" + params.periodId,
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

        const request2 = fetch(VITE_API_URL + "/api/view-users", {
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

        const request3 = fetch(VITE_API_URL + "/api/view-students", {
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

        Promise.all([request1, request2, request3])
          .then(([data1, data2, data3]) => {
            var registrations = data1?.response ?? [];
            var allUsers = data2?.response ?? [];
            var allStudents = data3?.response ?? [];

            const HealthInsurance_array = [];

            for (let i = 0; i < registrations.length; i++) {
              let parsedCharges;
              try {
                parsedCharges = JSON.parse(registrations[i].seminary_charges);
              } catch {
                continue; // skip invalid JSON
              }

              let keys = Object.keys(parsedCharges);
              let values = Object.values(parsedCharges);

              if (
                registrations[i].registration_status === "completed" &&
                keys[1] === "Health Insurance" &&
                parseInt(values[1][0]) === 7000
              ) {
                const new_student = allStudents.find(
                  (allStudent) =>
                    allStudent.custom_id === registrations[i].custom_id
                );
                const user = allUsers.find(
                  (allUser) => allUser.custom_id === registrations[i].custom_id
                );

                if (new_student && user) {
                  const student = {
                    ledger_number: new_student?.ledger_number || "",
                    programme: new_student?.programme || "",
                    surname: user?.surname || "",
                    first_name: user?.first_name || "",
                    other_names: user?.other_names || "",
                    student_id: user?.username || "",
                    custom_id: new_student?.custom_id || "",
                    status: registrations[i]?.registration_status || "",
                    undertaking: registrations[i]?.undertaking || "",
                    fresh_returning: registrations[i]?.fresh_returning || "",
                    current_level: registrations[i]?.current_level || "",
                  };
                  HealthInsurance_array.push(student);
                }
              }
            }

            setHealthInsurance(HealthInsurance_array);

            if (HealthInsurance_array.length < 1) {
              setHealthInsuranceEmpty(true);
            }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
            setHealthInsuranceEmpty(true);
          });
      }
      return {
        HealthInsurance,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const fetchPeriod = async () => {
    try {
      const res = await fetch(VITE_API_URL + "/api/period/" + params.periodId, {
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
      setSemester(result?.response?.semester ?? "");
      setSession(result?.response?.session ?? "");
    } catch (error) {
      console.error("Period fetch error:", error);
    }
  };

  const [resources] = createResource(fetchRegistrations);

  return (
    <MetaProvider>
      <Title>
        Health Insurance Log - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Health Insurance Log on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Health Insurance Log{" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Here's a list of all Health Insurance that have completed
              registration for the chosen semester.
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
                        <td class="p-4 border-r border-black">Fullname</td>
                        <td class="p-4 border-r border-black">Prog.</td>
                        <td class="p-4 border-r border-black">Stud. ID</td>
                        <td class="p-4 border-r border-black">Ledg. No.</td>
                        <td class="p-4 border-r border-black">Year</td>
                        <td class="p-4">View</td>
                      </tr>
                    </thead>
                    <tbody>
                      <Show
                        when={resources()?.HealthInsurance?.length > 0}
                        fallback={
                          <Show
                            when={HealthInsuranceEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={7} class="p-4 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={7} class="p-4 text-center">
                                No record(s) found.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources()?.HealthInsurance ?? []}>
                          {(registration, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                              <td class="p-4 font-semibold border-r border-black">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black space-x-1">
                                <b class="uppercase">
                                  {registration?.surname || "N/A"}
                                </b>
                                <span class="capitalize">
                                  {registration?.first_name || ""}
                                </span>
                                <span class="capitalize">
                                  {registration?.other_names || ""}
                                </span>
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration?.programme || "—"}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration?.student_id || "—"}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration?.ledger_number || "—"}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration?.current_level || "—"} (
                                <span class="uppercase">
                                  {registration?.fresh_returning || ""}
                                </span>{" "}
                                Student)
                              </td>
                              <td class="p-4">
                                <A
                                  target="_blank"
                                  href={
                                    registration?.custom_id
                                      ? `/admin/print-registration-form/${params.periodId}/${registration.custom_id}`
                                      : "#"
                                  }
                                  class="red-btn p-3 hover:opacity-60 inline-block"
                                >
                                  Form
                                </A>
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    </tbody>
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
