import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import Loading from "../components/Loading";
import Success from "../components/icons/Success";

import { Select } from "../components/Select";

const schema = z.object({
  undertaking: z.string().min(1, "*Required"),
});

export default function AddDropLog() {
  const params = useParams();

  const [undertakingPop, setUndertakingPop] = createSignal(false);
  const [scustomID, setSCustomId] = createSignal("");
  const [speriodId, setSPeriodId] = createSignal("");
  const [sLNo, setSLNo] = createSignal("");
  const [sId, setSId] = createSignal("");
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [MAStudents, setMAStudents] = createStore([]);
  const [MDivStudents, setMDivStudents] = createStore([]);
  const [PGDTStudents, setPGDTStudents] = createStore([]);
  const [BAStudents, setBAStudents] = createStore([]);
  const [DipStudents, setDipStudents] = createStore([]);
  const [MAStudentsEmpty, setMAStudentsEmpty] = createSignal(false);
  const [MDivStudentsEmpty, setMDivStudentsEmpty] = createSignal(false);
  const [PGDTStudentsEmpty, setPGDTStudentsEmpty] = createSignal(false);
  const [BAStudentsEmpty, setBAStudentsEmpty] = createSignal(false);
  const [DipStudentsEmpty, setDipStudentsEmpty] = createSignal(false);

  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

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
            var registrations = data1.response;
            var allUsers = data2.response;
            var allStudents = data3.response;

            const MA_array = [];
            const MDiv_array = [];
            const PGDT_array = [];
            const BA_array = [];
            const Dip_array = [];

            for (let i = 0; i < registrations.length; i++) {
              var allAddDrops = registrations.filter(
                (registrations) =>
                  registrations.add_drop_status != "" &&
                  registrations.add_drop_status != null
              );
            }

            for (let i = 0; i < allAddDrops.length; i++) {
              const ma_student = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === allAddDrops[i].custom_id &&
                  allStudent.programme_category === "Masters Programme"
              );
              const mdiv_student = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === allAddDrops[i].custom_id &&
                  allStudent.programme_category ===
                    "Master of Divinity Programme"
              );
              const pgdt_student = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === allAddDrops[i].custom_id &&
                  allStudent.programme_category === "PGDT Programme"
              );
              const ba_student = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === allAddDrops[i].custom_id &&
                  allStudent.programme_category === "Bachelor of Arts Programme"
              );
              const dip_student = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === allAddDrops[i].custom_id &&
                  allStudent.programme_category === "Diploma Programme"
              );
              if (typeof ma_student !== "undefined") {
                const user = allUsers.find(
                  (allUser) => allUser.custom_id === ma_student.custom_id
                );
                var student = {
                  ledger_number: ma_student.ledger_number,
                  programme: ma_student.programme,
                  surname: user.surname,
                  first_name: user.first_name,
                  other_names: user.other_names,
                  student_id: user.username,
                  custom_id: ma_student.custom_id,
                  status: allAddDrops[i].add_drop_status,
                  undertaking: allAddDrops[i].undertaking,
                  fresh_returning: allAddDrops[i].fresh_returning,
                  current_level: allAddDrops[i].current_level,
                  bursar_printed: allAddDrops[i].add_drop_print_bursar,
                  registrar_printed: allAddDrops[i].add_drop_print_registrar,
                  dean_printed: allAddDrops[i].add_drop_print_dean,
                };
                MA_array.push(student);
              }
              if (typeof mdiv_student !== "undefined") {
                const user = allUsers.find(
                  (allUser) => allUser.custom_id === mdiv_student.custom_id
                );
                var student = {
                  ledger_number: mdiv_student.ledger_number,
                  programme: mdiv_student.programme,
                  surname: user.surname,
                  first_name: user.first_name,
                  other_names: user.other_names,
                  student_id: user.username,
                  custom_id: mdiv_student.custom_id,
                  status: allAddDrops[i].add_drop_status,
                  undertaking: allAddDrops[i].undertaking,
                  fresh_returning: allAddDrops[i].fresh_returning,
                  current_level: allAddDrops[i].current_level,
                  bursar_printed: allAddDrops[i].add_drop_print_bursar,
                  registrar_printed: allAddDrops[i].add_drop_print_registrar,
                  dean_printed: allAddDrops[i].add_drop_print_dean,
                };
                MDiv_array.push(student);
              }
              if (typeof pgdt_student !== "undefined") {
                const user = allUsers.find(
                  (allUser) => allUser.custom_id === pgdt_student.custom_id
                );
                var student = {
                  ledger_number: pgdt_student.ledger_number,
                  programme: pgdt_student.programme,
                  surname: user.surname,
                  first_name: user.first_name,
                  other_names: user.other_names,
                  student_id: user.username,
                  custom_id: pgdt_student.custom_id,
                  status: allAddDrops[i].add_drop_status,
                  undertaking: allAddDrops[i].undertaking,
                  fresh_returning: allAddDrops[i].fresh_returning,
                  current_level: allAddDrops[i].current_level,
                  bursar_printed: allAddDrops[i].add_drop_print_bursar,
                  registrar_printed: allAddDrops[i].add_drop_print_registrar,
                  dean_printed: allAddDrops[i].add_drop_print_dean,
                };
                PGDT_array.push(student);
              }
              if (typeof ba_student !== "undefined") {
                const user = allUsers.find(
                  (allUser) => allUser.custom_id === ba_student.custom_id
                );
                var student = {
                  ledger_number: ba_student.ledger_number,
                  programme: ba_student.programme,
                  surname: user.surname,
                  first_name: user.first_name,
                  other_names: user.other_names,
                  student_id: user.username,
                  custom_id: ba_student.custom_id,
                  status: allAddDrops[i].add_drop_status,
                  undertaking: allAddDrops[i].undertaking,
                  fresh_returning: allAddDrops[i].fresh_returning,
                  current_level: allAddDrops[i].current_level,
                  bursar_printed: allAddDrops[i].add_drop_print_bursar,
                  registrar_printed: allAddDrops[i].add_drop_print_registrar,
                  dean_printed: allAddDrops[i].add_drop_print_dean,
                };
                BA_array.push(student);
              }
              if (typeof dip_student !== "undefined") {
                const user = allUsers.find(
                  (allUser) => allUser.custom_id === dip_student.custom_id
                );
                var student = {
                  ledger_number: dip_student.ledger_number,
                  programme: dip_student.programme,
                  surname: user.surname,
                  first_name: user.first_name,
                  other_names: user.other_names,
                  student_id: user.username,
                  custom_id: dip_student.custom_id,
                  status: allAddDrops[i].add_drop_status,
                  undertaking: allAddDrops[i].undertaking,
                  fresh_returning: allAddDrops[i].fresh_returning,
                  current_level: allAddDrops[i].current_level,
                  bursar_printed: allAddDrops[i].add_drop_print_bursar,
                  registrar_printed: allAddDrops[i].add_drop_print_registrar,
                  dean_printed: allAddDrops[i].add_drop_print_dean,
                };
                Dip_array.push(student);
              }
            }

            setMAStudents(MA_array);
            setMDivStudents(MDiv_array);
            setPGDTStudents(PGDT_array);
            setBAStudents(BA_array);
            setDipStudents(Dip_array);

            if (MA_array.length < 1) {
              setMAStudentsEmpty(true);
            }
            if (MDiv_array.length < 1) {
              setMDivStudentsEmpty(true);
            }
            if (PGDT_array.length < 1) {
              setPGDTStudentsEmpty(true);
            }
            if (BA_array.length < 1) {
              setBAStudentsEmpty(true);
            }
            if (Dip_array.length < 1) {
              setDipStudentsEmpty(true);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        MAStudents,
        MDivStudents,
        PGDTStudents,
        BAStudents,
        DipStudents,
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

  const showApproveUndertakingForm = async (c, p, sId, sLNo) => {
    setUndertakingPop(true);
    setSCustomId(c);
    setSPeriodId(p);
    setSId(sId);
    setSLNo(sLNo);
  };

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
            undertaking: formData().undertaking,
          }),
        }
      );

      const result = await response.json();

      setIsProcessing(false);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };

  const [resources] = createResource(fetchRegistrations);

  return (
    <MetaProvider>
      <Title>Add/Drop Log - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Add/Drop Log on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={undertakingPop()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
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
                          onClick={() => {
                            approveUndertaking();
                          }}
                          class="blue-btn text-white p-3 hover:opacity-60"
                        >
                          YES. Approve Undertaking
                        </button>
                        <button
                          onClick={() => {
                            setUndertakingPop(false);
                          }}
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
                    Action was carried out successfully.{" "}
                    <span
                      onClick={() =>
                        (window.location.href =
                          "/admin/registration-log/" + params.periodId)
                      }
                      class="text-red-600 font-semibold cursor-pointer hover:opacity-60 underline text-decoration-black"
                    >
                      <br></br>
                      Click here
                    </span>{" "}
                    to return to log.
                  </p>
                </Show>
              </div>
            </div>
          </div>
        </Show>
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Add/Drop Log{" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Here's a list of all students that have participated in add/drop
              for the chosen semester.
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
                        <td class="p-4 text-center border-b" colSpan={8}>
                          MASTER OF DIVINITY STUDENTS
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
                        when={
                          resources().MDivStudents.length !== "undefined" &&
                          resources().MDivStudents.length > 0
                        }
                        fallback={
                          <Show
                            when={MDivStudentsEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={8} class="p-4 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={8} class="p-4 text-center">
                                No record(s) found.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().MDivStudents}>
                          {(registration, i) => (
                            <tr
                              class="even:bg-gray-200 odd:bg-white border-b border-black"
                              style={{}}
                            >
                              <td class="p-4 font-semibold border-r border-black">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black space-x-1">
                                <b class="uppercase">{registration.surname}</b>
                                <span class="capitalize">
                                  {registration.first_name}
                                </span>
                                <span class="capitalize">
                                  {registration.other_names}
                                </span>
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.programme}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.student_id}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.ledger_number}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.current_level} (
                                <span class="uppercase">
                                  {registration.fresh_returning}
                                </span>{" "}
                                Student )
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
                                          "/admin/add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="gray2-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        View
                                      </A>
                                    </>
                                  }
                                >
                                  <Switch
                                    fallback={
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="green-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Print
                                      </A>
                                    }
                                  >
                                    <Match
                                      when={
                                        registration.bursar_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "bursar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.registrar_printed ===
                                          "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "registrar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.dean_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "dean"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                  </Switch>
                                </Show>
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    </tbody>
                  </table>
                  <table cellPadding={0} cellSpacing={0} class="w-full my-4">
                    <thead class="bg-blue-950 text-white border-b border-black">
                      <tr>
                        <td class="p-4 text-center border-b" colSpan={8}>
                          MASTERS STUDENTS
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
                        when={
                          resources().MAStudents.length !== "undefined" &&
                          resources().MAStudents.length > 0
                        }
                        fallback={
                          <Show
                            when={MAStudentsEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={8} class="p-4 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={8} class="p-4 text-center">
                                No record(s) found.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().MAStudents}>
                          {(registration, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                              <td class="p-4 font-semibold border-r border-black">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black space-x-1">
                                <b class="uppercase">{registration.surname}</b>
                                <span class="capitalize">
                                  {registration.first_name}
                                </span>
                                <span class="capitalize">
                                  {registration.other_names}
                                </span>
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.programme}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.student_id}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.ledger_number}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.current_level} (
                                <span class="uppercase">
                                  {registration.fresh_returning}
                                </span>{" "}
                                Student )
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
                                          "/admin/add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="gray2-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        View
                                      </A>
                                    </>
                                  }
                                >
                                  <Switch
                                    fallback={
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="green-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Print
                                      </A>
                                    }
                                  >
                                    <Match
                                      when={
                                        registration.bursar_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "bursar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.registrar_printed ===
                                          "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "registrar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.dean_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "dean"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                  </Switch>
                                </Show>
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    </tbody>
                  </table>
                  <table cellPadding={0} cellSpacing={0} class="w-full my-4">
                    <thead class="bg-blue-950 text-white border-b border-black">
                      <tr>
                        <td class="p-4 text-center border-b" colSpan={8}>
                          PGDT STUDENTS
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
                        when={
                          resources().PGDTStudents.length !== "undefined" &&
                          resources().PGDTStudents.length > 0
                        }
                        fallback={
                          <Show
                            when={PGDTStudentsEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={8} class="p-4 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={8} class="p-4 text-center">
                                No record(s) found.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().PGDTStudents}>
                          {(registration, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                              <td class="p-4 font-semibold border-r border-black">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black space-x-1">
                                <b class="uppercase">{registration.surname}</b>
                                <span class="capitalize">
                                  {registration.first_name}
                                </span>
                                <span class="capitalize">
                                  {registration.other_names}
                                </span>
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.programme}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.student_id}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.ledger_number}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.current_level} (
                                <span class="uppercase">
                                  {registration.fresh_returning}
                                </span>{" "}
                                Student )
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
                                          "/admin/add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="gray2-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        View
                                      </A>
                                    </>
                                  }
                                >
                                  <Switch
                                    fallback={
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="green-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Print
                                      </A>
                                    }
                                  >
                                    <Match
                                      when={
                                        registration.bursar_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "bursar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.registrar_printed ===
                                          "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "registrar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.dean_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "dean"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                  </Switch>
                                </Show>
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    </tbody>
                  </table>
                  <table cellPadding={0} cellSpacing={0} class="w-full my-4">
                    <thead class="bg-blue-950 text-white border-b border-black">
                      <tr>
                        <td class="p-4 text-center border-b" colSpan={8}>
                          BA STUDENTS
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
                        when={
                          resources().BAStudents.length !== "undefined" &&
                          resources().BAStudents.length > 0
                        }
                        fallback={
                          <Show
                            when={BAStudentsEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={8} class="p-4 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={8} class="p-4 text-center">
                                No record(s) found.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().BAStudents}>
                          {(registration, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                              <td class="p-4 font-semibold border-r border-black">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black space-x-1">
                                <b class="uppercase">{registration.surname}</b>
                                <span class="capitalize">
                                  {registration.first_name}
                                </span>
                                <span class="capitalize">
                                  {registration.other_names}
                                </span>
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.programme}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.student_id}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.ledger_number}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.current_level} (
                                <span class="uppercase">
                                  {registration.fresh_returning}
                                </span>{" "}
                                Student )
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
                                          "/admin/add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="gray2-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        View
                                      </A>
                                    </>
                                  }
                                >
                                  <Switch
                                    fallback={
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="green-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Print
                                      </A>
                                    }
                                  >
                                    <Match
                                      when={
                                        registration.bursar_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "bursar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.registrar_printed ===
                                          "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "registrar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.dean_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "dean"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                  </Switch>
                                </Show>
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    </tbody>
                  </table>
                  <table cellPadding={0} cellSpacing={0} class="w-full my-4">
                    <thead class="bg-blue-950 text-white border-b border-black">
                      <tr>
                        <td class="p-4 text-center border-b" colSpan={8}>
                          DIPLOMA STUDENTS
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
                        when={
                          resources().DipStudents.length !== "undefined" &&
                          resources().DipStudents.length > 0
                        }
                        fallback={
                          <Show
                            when={DipStudentsEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={8} class="p-4 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={8} class="p-4 text-center">
                                No record(s) found.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().DipStudents}>
                          {(registration, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                              <td class="p-4 font-semibold border-r border-black">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black space-x-1">
                                <b class="uppercase">{registration.surname}</b>
                                <span class="capitalize">
                                  {registration.first_name}
                                </span>
                                <span class="capitalize">
                                  {registration.other_names}
                                </span>
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.programme}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.student_id}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.ledger_number}
                              </td>
                              <td class="p-4 border-r border-black">
                                {registration.current_level} (
                                <span class="uppercase">
                                  {registration.fresh_returning}
                                </span>{" "}
                                Student )
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
                                          "/admin/add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="gray2-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        View
                                      </A>
                                    </>
                                  }
                                >
                                  <Switch
                                    fallback={
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="green-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Print
                                      </A>
                                    }
                                  >
                                    <Match
                                      when={
                                        registration.bursar_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "bursar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.registrar_printed ===
                                          "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "registrar"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                    <Match
                                      when={
                                        registration.dean_printed === "yes" &&
                                        JSON.parse(
                                          localStorage.getItem("jetsUser")
                                        ).role === "dean"
                                      }
                                    >
                                      <A
                                        target="_blank"
                                        href={
                                          "/admin/print-add-drop-form/" +
                                          params.periodId +
                                          "/" +
                                          registration.custom_id
                                        }
                                        class="blue-btn p-3 hover:opacity-60 inline-block"
                                      >
                                        Re-Print
                                      </A>
                                    </Match>
                                  </Switch>
                                </Show>
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
