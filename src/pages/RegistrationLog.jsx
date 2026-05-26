import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource, Show, For } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "../components/Loading";
import Success from "../components/icons/Success";

const schema = z.object({
  undertaking: z.string().min(1, "*Required"),
});

export default function RegistrationLog() {
  const params = useParams();
  const navigate = useNavigate();

  // State for managing the undertaking approval popup
  const [undertakingPop, setUndertakingPop] = createSignal(false);
  const [scustomID, setSCustomId] = createSignal("");
  const [speriodId, setSPeriodId] = createSignal("");
  const [sLNo, setSLNo] = createSignal("");
  const [sId, setSId] = createSignal("");
  const [showSuccess, setShowSuccess] = createSignal(false);

  // State for semester and session
  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");

  // State for storing student data
  const [MAStudents, setMAStudents] = createStore([]);
  const [MDivStudents, setMDivStudents] = createStore([]);
  const [PGDTStudents, setPGDTStudents] = createStore([]);
  const [BAStudents, setBAStudents] = createStore([]);
  const [DipStudents, setDipStudents] = createStore([]);

  // State for checking if student lists are empty
  const [MAStudentsEmpty, setMAStudentsEmpty] = createSignal(false);
  const [MDivStudentsEmpty, setMDivStudentsEmpty] = createSignal(false);
  const [PGDTStudentsEmpty, setPGDTStudentsEmpty] = createSignal(false);
  const [BAStudentsEmpty, setBAStudentsEmpty] = createSignal(false);
  const [DipStudentsEmpty, setDipStudentsEmpty] = createSignal(false);

  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  // Helper function to check if the user is a bursar
  const isBursar = () =>
    JSON.parse(localStorage.getItem("jetsUser")).surname === "bursar";

  // Helper function to check if the user is a registrar
  const isRegistrar = () =>
    JSON.parse(localStorage.getItem("jetsUser")).surname === "registrar";

  // Fetch registrations and update state
  const fetchRegistrations = async () => {
    if (
      localStorage.getItem("jetsUser") &&
      JSON.parse(localStorage.getItem("jetsUser")).role === "admin"
    ) {
      try {
        // Fetch user data to validate token
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
          return;
        }

        // Fetch semester and session data
        await fetchPeriod();

        // Fetch registrations, users, and students data in parallel
        const [registrations, allUsers, allStudents] = await Promise.all([
          fetch(
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
          ).then((res) => res.json()),
          fetch(VITE_API_URL + "/api/view-users", {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }).then((res) => res.json()),
          fetch(VITE_API_URL + "/api/view-students", {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }).then((res) => res.json()),
        ]);

        // Organize students into categories
        const MA_array = [];
        const MDiv_array = [];
        const PGDT_array = [];
        const BA_array = [];
        const Dip_array = [];

        registrations.response.forEach((registration) => {
          const student = allStudents.response.find(
            (s) => s.custom_id === registration.custom_id
          );
          const user = allUsers.response.find(
            (u) => u.custom_id === registration.custom_id
          );

          if (student && user) {
            const studentData = {
              ledger_number: student.ledger_number,
              programme: student.programme,
              surname: user.surname,
              first_name: user.first_name,
              other_names: user.other_names,
              student_id: user.username,
              custom_id: student.custom_id,
              status: registration.registration_status,
              undertaking: registration.undertaking,
              fresh_returning: registration.fresh_returning,
              current_level: registration.current_level,
              registration_print_bursar: registration.registration_print_bursar,
              registration_print_registry: registration.registration_print_registry,
            };

            // Categorize students based on their programme
            switch (student.programme_category) {
              case "Masters Programme":
                MA_array.push(studentData);
                break;
              case "Master of Divinity Programme":
                MDiv_array.push(studentData);
                break;
              case "PGDT Programme":
                PGDT_array.push(studentData);
                break;
              case "Bachelor of Arts Programme":
                BA_array.push(studentData);
                break;
              case "Diploma Programme":
                Dip_array.push(studentData);
                break;
              default:
                break;
            }
          }
        });

        // Update state with categorized students
        setMAStudents(MA_array);
        setMDivStudents(MDiv_array);
        setPGDTStudents(PGDT_array);
        setBAStudents(BA_array);
        setDipStudents(Dip_array);

        // Check if any category is empty
        setMAStudentsEmpty(MA_array.length === 0);
        setMDivStudentsEmpty(MDiv_array.length === 0);
        setPGDTStudentsEmpty(PGDT_array.length === 0);
        setBAStudentsEmpty(BA_array.length === 0);
        setDipStudentsEmpty(Dip_array.length === 0);
      } catch (error) {
        console.error(error);
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  // Fetch semester and session data
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

  // Show the undertaking approval popup
  const showApproveUndertakingForm = (c, p, sId, sLNo) => {
    setUndertakingPop(true);
    setSCustomId(c);
    setSPeriodId(p);
    setSId(sId);
    setSLNo(sLNo);
  };

  // Approve undertaking and refetch data
  const approveUndertaking = async () => {
    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-registration/" + scustomID(),
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
            period_id: speriodId(),
            undertaking: "yes",
          }),
        }
      );

      const result = await response.json();
      setShowSuccess(true);
      // Refetch data to update the UI
      await fetchRegistrations();
    } catch (error) {
      console.error(error);
    }
  };

  // Update print status after print action
  const handlePrint = async (customId) => {
    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-registration/" + customId,
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
            period_id: params.periodId,
            registration_print_bursar: isBursar() ? "yes" : "no",
            registration_print_registry: isRegistrar() ? "yes" : "no",
          }),
        }
      );

      const result = await response.json();
      // Refetch data to update the UI
      await fetchRegistrations();
    } catch (error) {
      console.error(error);
    }
  };

  const [resources] = createResource(fetchRegistrations);

  // Reusable StudentTable component
  const StudentTable = ({ students, category }) => {
    return (
      <table cellPadding={0} cellSpacing={0} class="w-full my-4">
        <thead class="bg-blue-950 text-white border-b border-black">
          <tr>
            <td class="p-4 text-center border-b" colSpan={8}>
              {category} STUDENTS
            </td>
          </tr>
          <tr>
            <td class="p-4 border-r border-black">#.</td>
            <td class="p-4 border-r border-black">Fullname</td>
            <td class="p-4 border-r border-black">Prog.</td>
            <td class="p-4 border-r border-black">Stud. ID</td>
            <td class="p-4 border-r border-black">Ledger No.</td>
            <td class="p-4 border-r border-black">Year</td>
            <td class="p-4 border-r border-black">Status</td>
            <td class="p-4">?</td>
          </tr>
        </thead>
        <tbody>
          <Show
            when={students.length > 0}
            fallback={
              <tr class="border-b border-black">
                <td colSpan={8} class="p-4 text-center">
                  No record(s) found.
                </td>
              </tr>
            }
          >
            <For each={students}>
              {(registration, i) => (
                <tr
                  class={`${
                    registration.registration_print_bursar === "yes" && isBursar()
                      ? "text-green-600 border-b border-black"
                      : ""
                  } ${
                    registration.registration_print_registry === "yes" && isRegistrar()
                      ? "text-purple-300 border-b border-black"
                      : ""
                  } ${
                    !registration.registration_print_bursar ||
                    !registration.registration_print_registry
                      ? "bg-white border-b border-black"
                      : ""
                  }`}
                >
                  <td class="p-4 font-semibold border-r border-black">{i() + 1}.</td>
                  <td class="p-4 border-r border-black space-x-1">
                    <b class="uppercase">{registration.surname}</b>
                    <span class="capitalize">{registration.first_name}</span>
                    <span class="capitalize">{registration.other_names}</span>
                  </td>
                  <td class="p-4 border-r border-black">{registration.programme}</td>
                  <td class="p-4 border-r border-black">{registration.student_id}</td>
                  <td class="p-4 border-r border-black">{registration.ledger_number}</td>
                  <td class="p-4 border-r border-black">
                    {registration.current_level} (
                    <span class="uppercase">{registration.fresh_returning}</span> Student )
                  </td>
                  <td class="p-4 border-r border-black uppercase font-semibold">
                    {registration.status}
                  </td>
                  <td class="p-4 flex space-y-2 sm:space-x-2 sm:space-y-0">
                    <Show
                      when={registration.status === "completed"}
                      fallback={
                        <>
                          <A
                            target="_blank"
                            href={
                              "/admin/registration-form/" +
                              params.periodId +
                              "/" +
                              registration.custom_id
                            }
                            class="gray2-btn p-3 hover:opacity-60 inline-block"
                          >
                            View
                          </A>
                          <Show when={isBursar() || isRegistrar()}>
                            <Show when={registration.undertaking !== "yes"}>
                              <span
                                onClick={() =>
                                  showApproveUndertakingForm(
                                    registration.custom_id,
                                    params.periodId,
                                    registration.student_id,
                                    registration.ledger_number
                                  )
                                }
                                class="cursor-pointer red-btn p-3 hover:opacity-60 inline-block"
                              >
                                UT
                              </span>
                            </Show>
                          </Show>
                        </>
                      }
                    >
                      <A
                        target="_blank"
                        href={
                          "/admin/print-registration-form/" +
                          params.periodId +
                          "/" +
                          registration.custom_id
                        }
                        class="green-btn p-3 hover:opacity-60 inline-block"
                        onClick={() => handlePrint(registration.custom_id)} // Call handlePrint on click
                      >
                        Print
                      </A>
                      <Show when={registration.undertaking === "yes"}>
                        <span class="gray-btn p-3 inline-block">T</span>
                      </Show>
                    </Show>
                  </td>
                </tr>
              )}
            </For>
          </Show>
        </tbody>
      </table>
    );
  };

  return (
    <MetaProvider>
      <Title>Registration Log - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Registration Log on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={undertakingPop()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Approve Undertaking
              </h2>
              <div class="my-2 border-t border-b py-4 border-black">
                <Show
                  when={showSuccess()}
                  fallback={
                    <div class="space-y-6">
                      <p>
                        Approve undertaking for the student with Ledger Number:{" "}
                        <b>{sLNo()}</b> and ID number: <b>{sId()}</b>
                      </p>
                      <div class="grid grid-cols-2 gap-4">
                        <button
                          onClick={approveUndertaking}
                          class="blue-btn text-white p-3 hover:opacity-60"
                        >
                          YES. Approve Undertaking
                        </button>
                        <button
                          onClick={() => setUndertakingPop(false)}
                          class="gray-btn text-white p-3 hover:opacity-60"
                        >
                          No. Cancel
                        </button>
                      </div>
                    </div>
                  }
                >
                  <Success />
                  <p class="text-center mt-4">
                    Action was carried out successfully.
                  </p>
                </Show>
              </div>
              <div class="text-right">
                <span
                  onClick={() =>
                    (window.location.href =
                      "/admin/registration-log/" + params.periodId)
                  }
                  class="blue-btn p-3 text-red-600 font-semibold cursor-pointer hover:opacity-60"
                >
                  Return to Log
                </span>
              </div>
            </div>
          </div>
        </Show>
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Registration Log{" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Here's a list of all students that have participated in
              registration for the chosen semester.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4 overflow-y-scroll">
            <Show
              when={resources.loading}
              fallback={
                <div class="space-y-6">
                  <StudentTable students={MAStudents} category="MASTERS" />
                  <StudentTable students={MDivStudents} category="MASTER OF DIVINITY" />
                  <StudentTable students={PGDTStudents} category="PGDT" />
                  <StudentTable students={BAStudents} category="BA" />
                  <StudentTable students={DipStudents} category="DIPLOMA" />
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
