import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource, Show } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "../components/Loading";
import Success from "../components/icons/Success";

const schema = z.object({
  undertaking: z.string().min(1, "*Required"),
});

export default function HostelApplications() {
  const params = useParams();

  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [hostelRequests, setHostelRequests] = createStore([]);
  const [hostelRequestsEmpty, setHostelRequestsEmpty] = createSignal(false);

  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const fetchRequests = async () => {
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
        navigate("/");
      } else {
        // await fetchPeriod();
        const request1 = fetch(
          VITE_API_URL + "/api/view-hostel-applications/" + params.periodId,
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
            var all_requests = data1.response;
            var allUsers = data2.response;
            var allStudents = data3.response;

            const requests_array = [];

            if (
              JSON.parse(localStorage.getItem("jetsUser")).surname ===
                "bursar" ||
              JSON.parse(localStorage.getItem("jetsUser")).surname === "ict"
            ) {
              var requests_bursar = all_requests.filter(
                (aRequest) => aRequest.status == "awaiting bursar"
              );

              for (let i = 0; i < requests_bursar.length; i++) {
                const user = allUsers.find(
                  (allUser) =>
                    allUser.custom_id === requests_bursar[i].custom_id
                );
                const aStudent = allStudents.find(
                  (allStudent) =>
                    allStudent.custom_id === requests_bursar[i].custom_id
                );

                var student = {
                  ledger_number: aStudent.ledger_number,
                  programme: aStudent.programme,
                  surname: user.surname,
                  first_name: user.first_name,
                  other_names: user.other_names,
                  student_id: user.username,
                  custom_id: aStudent.custom_id,
                  hostel_name: requests_bursar[i].hostel_name,
                };
                requests_array.push(student);
              }

              setHostelRequests(requests_array);

              if (requests_array.length < 1) {
                setHostelRequestsEmpty(true);
              }
            }
            if (
              JSON.parse(localStorage.getItem("jetsUser")).surname ===
                "porter" ||
              JSON.parse(localStorage.getItem("jetsUser")).surname === "ict"
            ) {
              var requests_bursar = all_requests.filter(
                (aRequest) => aRequest.status == "awaiting porter"
              );

              for (let i = 0; i < requests_bursar.length; i++) {
                const user = allUsers.find(
                  (allUser) =>
                    allUser.custom_id === requests_bursar[i].custom_id
                );
                const aStudent = allStudents.find(
                  (allStudent) =>
                    allStudent.custom_id === requests_bursar[i].custom_id
                );

                var student = {
                  ledger_number: aStudent.ledger_number,
                  programme: aStudent.programme,
                  surname: user.surname,
                  first_name: user.first_name,
                  other_names: user.other_names,
                  student_id: user.username,
                  custom_id: aStudent.custom_id,
                  hostel_name: requests_bursar[i].hostel_name,
                };
                requests_array.push(student);
              }

              setHostelRequests(requests_array);

              if (requests_array.length < 1) {
                setHostelRequestsEmpty(true);
              }
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        hostelRequests,
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
      setSemester(result.response.semester);
      setSession(result.response.session);
    } catch (error) {
      console.error(error);
    }
  };

  const [resources] = createResource(fetchRequests);

  return (
    <MetaProvider>
      <Title>Hostel Requests - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Hostel Requests on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Hostel Requests{" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Here's a list of all students Hostel Requests.</p>
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
                        <td class="p-4 border-r border-black">Ledger No.</td>
                        <td class="p-4 border-r border-black">
                          Hostel Requested For
                        </td>
                        <td class="p-4">?</td>
                      </tr>
                    </thead>
                    <tbody>
                      <Show
                        when={
                          resources().hostelRequests.length !== "undefined" &&
                          resources().hostelRequests.length > 0
                        }
                        fallback={
                          <Show
                            when={hostelRequestsEmpty()}
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
                        <For each={resources().hostelRequests}>
                          {(hostelRequest, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                              <td class="p-4 font-semibold border-r border-black">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black space-x-1">
                                <b class="uppercase">{hostelRequest.surname}</b>
                                <span class="capitalize">
                                  {hostelRequest.first_name}
                                </span>
                                <span class="capitalize">
                                  {hostelRequest.other_names}
                                </span>
                              </td>
                              <td class="p-4 border-r border-black">
                                {hostelRequest.programme}
                              </td>
                              <td class="p-4 border-r border-black">
                                {hostelRequest.student_id}
                              </td>
                              <td class="p-4 border-r border-black">
                                {hostelRequest.ledger_number}
                              </td>
                              <td class="p-4 border-r border-black">
                                {hostelRequest.hostel_name
                                  ? hostelRequest.hostel_name
                                  : "Pending"}
                              </td>
                              <td class="p-4">
                                <A
                                  href={
                                    "/admin/hostel-form/" +
                                    params.periodId +
                                    "/" +
                                    hostelRequest.custom_id
                                  }
                                  class="green-btn p-3 hover:opacity-60 inline-block"
                                >
                                  View
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
