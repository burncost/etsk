import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource, Show } from "solid-js";
import Loading from "../components/Loading";

const schema = z.object({
  undertaking: z.string().min(1, "*Required"),
});

export default function EnrollmentStatistics() {
  const params = useParams();

  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [MAStudentsStarted, setMAStudentsStarted] = createSignal(0);
  const [MDivStudentsStarted, setMDivStudentsStarted] = createSignal(0);
  const [PGDTStudentsStarted, setPGDTStudentsStarted] = createSignal(0);
  const [BAStudentsStarted, setBAStudentsStarted] = createSignal(0);
  const [DipStudentsStarted, setDipStudentsStarted] = createSignal(0);
  const [MAStudentsAwaitingDean, setMAStudentsAwaitingDean] = createSignal(0);
  const [MDivStudentsAwaitingDean, setMDivStudentsAwaitingDean] =
    createSignal(0);
  const [PGDTStudentsAwaitingDean, setPGDTStudentsAwaitingDean] =
    createSignal(0);
  const [BAStudentsAwaitingDean, setBAStudentsAwaitingDean] = createSignal(0);
  const [DipStudentsAwaitingDean, setDipStudentsAwaitingDean] = createSignal(0);
  const [MAStudentsDisapproved, setMAStudentsDisapproved] = createSignal(0);
  const [MDivStudentsDisapproved, setMDivStudentsDisapproved] = createSignal(0);
  const [PGDTStudentsDisapproved, setPGDTStudentsDisapproved] = createSignal(0);
  const [BAStudentsDisapproved, setBAStudentsDisapproved] = createSignal(0);
  const [DipStudentsDisapproved, setDipStudentsDisapproved] = createSignal(0);
  const [MAStudentsAwaitingBursar, setMAStudentsAwaitingBursar] =
    createSignal(0);
  const [MDivStudentsAwaitingBursar, setMDivStudentsAwaitingBursar] =
    createSignal(0);
  const [PGDTStudentsAwaitingBursar, setPGDTStudentsAwaitingBursar] =
    createSignal(0);
  const [BAStudentsAwaitingBursar, setBAStudentsAwaitingBursar] =
    createSignal(0);
  const [DipStudentsAwaitingBursar, setDipStudentsAwaitingBursar] =
    createSignal(0);
  const [MAStudentsCompleted, setMAStudentsCompleted] = createSignal(0);
  const [MDivStudentsCompleted, setMDivStudentsCompleted] = createSignal(0);
  const [PGDTStudentsCompleted, setPGDTStudentsCompleted] = createSignal(0);
  const [BAStudentsCompleted, setBAStudentsCompleted] = createSignal(0);
  const [DipStudentsCompleted, setDipStudentsCompleted] = createSignal(0);
  const [MAStudentsIncomplete, setMAStudentsIncomplete] = createSignal(0);
  const [MDivStudentsIncomplete, setMDivStudentsIncomplete] = createSignal(0);
  const [PGDTStudentsIncomplete, setPGDTStudentsIncomplete] = createSignal(0);
  const [BAStudentsIncomplete, setBAStudentsIncomplete] = createSignal(0);
  const [DipStudentsIncomplete, setDipStudentsIncomplete] = createSignal(0);
  const [totalRegistrations, setTotalRegistrations] = createSignal(0);

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
        navigate("/");
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

        Promise.all([request1, request3])
          .then(([data1, data3]) => {
            var all_registrations = data1.response;
            console.log(all_registrations);
            setTotalRegistrations(all_registrations.length);
            var allStudents = data3.response;

            const MA_array_started = [];
            const MDiv_array_started = [];
            const PGDT_array_started = [];
            const BA_array_started = [];
            const Dip_array_started = [];
            const MA_array_awaiting_dean = [];
            const MDiv_array_awaiting_dean = [];
            const PGDT_array_awaiting_dean = [];
            const BA_array_awaiting_dean = [];
            const Dip_array_awaiting_dean = [];

            const MA_array_disapproved = [];
            const MDiv_array_disapproved = [];
            const PGDT_array_disapproved = [];
            const BA_array_disapproved = [];
            const Dip_array_disapproved = [];

            const MA_array_awaiting_bursar = [];
            const MDiv_array_awaiting_bursar = [];
            const PGDT_array_awaiting_bursar = [];
            const BA_array_awaiting_bursar = [];
            const Dip_array_awaiting_bursar = [];
            const MA_array_completed = [];
            const MDiv_array_completed = [];
            const PGDT_array_completed = [];
            const BA_array_completed = [];
            const Dip_array_completed = [];
            const MA_array_incomplete = [];
            const MDiv_array_incomplete = [];
            const PGDT_array_incomplete = [];
            const BA_array_incomplete = [];
            const Dip_array_incomplete = [];

            var registrations_started = all_registrations.filter(
              (registration) => registration.registration_status == "started"
            );

            var registrations_awaiting_dean = all_registrations.filter(
              (registration) =>
                registration.registration_status == "awaiting dean"
            );

            var registrations_disapproved = all_registrations.filter(
              (registration) =>
                registration.registration_status == "disapproved"
            );

            var registrations_awaiting_bursar = all_registrations.filter(
              (registration) =>
                registration.registration_status == "awaiting bursar"
            );

            var registrations_incompleted = all_registrations.filter(
              (registration) => registration.registration_status == "incomplete"
            );

            var registrations_completed = all_registrations.filter(
              (registration) => registration.registration_status == "completed"
            );

            for (let i = 0; i < registrations_started.length; i++) {
              const ma_student_started = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === registrations_started[i].custom_id &&
                  allStudent.programme_category === "Masters Programme"
              );
              const mdiv_student_started = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === registrations_started[i].custom_id &&
                  allStudent.programme_category ===
                    "Master of Divinity Programme"
              );
              const pgdt_student_started = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === registrations_started[i].custom_id &&
                  allStudent.programme_category === "PGDT Programme"
              );
              const ba_student_started = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === registrations_started[i].custom_id &&
                  allStudent.programme_category === "Bachelor of Arts Programme"
              );
              const dip_student_started = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id === registrations_started[i].custom_id &&
                  allStudent.programme_category === "Diploma Programme"
              );
              if (typeof ma_student_started !== "undefined") {
                MA_array_started.push(ma_student_started);
              }
              if (typeof mdiv_student_started !== "undefined") {
                MDiv_array_started.push(mdiv_student_started);
              }
              if (typeof pgdt_student_started !== "undefined") {
                PGDT_array_started.push(pgdt_student_started);
              }
              if (typeof ba_student_started !== "undefined") {
                BA_array_started.push(ba_student_started);
              }
              if (typeof dip_student_started !== "undefined") {
                Dip_array_started.push(dip_student_started);
              }
            }

            for (let i = 0; i < registrations_awaiting_dean.length; i++) {
              const ma_student_awaiting_dean = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_dean[i].custom_id &&
                  allStudent.programme_category === "Masters Programme"
              );
              const mdiv_student_awaiting_dean = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_dean[i].custom_id &&
                  allStudent.programme_category ===
                    "Master of Divinity Programme"
              );
              const pgdt_student_awaiting_dean = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_dean[i].custom_id &&
                  allStudent.programme_category === "PGDT Programme"
              );
              const ba_student_awaiting_dean = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_dean[i].custom_id &&
                  allStudent.programme_category === "Bachelor of Arts Programme"
              );
              const dip_student_awaiting_dean = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_dean[i].custom_id &&
                  allStudent.programme_category === "Diploma Programme"
              );
              if (typeof ma_student_awaiting_dean !== "undefined") {
                MA_array_awaiting_dean.push(ma_student_awaiting_dean);
              }
              if (typeof mdiv_student_awaiting_dean !== "undefined") {
                MDiv_array_awaiting_dean.push(mdiv_student_awaiting_dean);
              }
              if (typeof pgdt_student_awaiting_dean !== "undefined") {
                PGDT_array_awaiting_dean.push(pgdt_student_awaiting_dean);
              }
              if (typeof ba_student_awaiting_dean !== "undefined") {
                BA_array_awaiting_dean.push(ba_student_awaiting_dean);
              }
              if (typeof dip_student_awaiting_dean !== "undefined") {
                Dip_array_awaiting_dean.push(dip_student_awaiting_dean);
              }
            }

            for (let i = 0; i < registrations_disapproved.length; i++) {
              const ma_student_disapproved = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_disapproved[i].custom_id &&
                  allStudent.programme_category === "Masters Programme"
              );
              const mdiv_student_disapproved = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_disapproved[i].custom_id &&
                  allStudent.programme_category ===
                    "Master of Divinity Programme"
              );
              const pgdt_student_disapproved = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_disapproved[i].custom_id &&
                  allStudent.programme_category === "PGDT Programme"
              );
              const ba_student_disapproved = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_disapproved[i].custom_id &&
                  allStudent.programme_category === "Bachelor of Arts Programme"
              );
              const dip_student_disapproved = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_disapproved[i].custom_id &&
                  allStudent.programme_category === "Diploma Programme"
              );
              if (typeof ma_student_disapproved !== "undefined") {
                MA_array_disapproved.push(ma_student_disapproved);
              }
              if (typeof mdiv_student_disapproved !== "undefined") {
                MDiv_array_disapproved.push(mdiv_student_disapproved);
              }
              if (typeof pgdt_student_disapproved !== "undefined") {
                PGDT_array_disapproved.push(pgdt_student_disapproved);
              }
              if (typeof ba_student_disapproved !== "undefined") {
                BA_array_disapproved.push(ba_student_disapproved);
              }
              if (typeof dip_student_disapproved !== "undefined") {
                Dip_array_disapproved.push(dip_student_disapproved);
              }
            }

            for (let i = 0; i < registrations_awaiting_bursar.length; i++) {
              const ma_student_awaiting_bursar = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_bursar[i].custom_id &&
                  allStudent.programme_category === "Masters Programme"
              );
              const mdiv_student_awaiting_bursar = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_bursar[i].custom_id &&
                  allStudent.programme_category ===
                    "Master of Divinity Programme"
              );
              const pgdt_student_awaiting_bursar = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_bursar[i].custom_id &&
                  allStudent.programme_category === "PGDT Programme"
              );
              const ba_student_awaiting_bursar = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_bursar[i].custom_id &&
                  allStudent.programme_category === "Bachelor of Arts Programme"
              );
              const dip_student_awaiting_bursar = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_awaiting_bursar[i].custom_id &&
                  allStudent.programme_category === "Diploma Programme"
              );
              if (typeof ma_student_awaiting_bursar !== "undefined") {
                MA_array_awaiting_bursar.push(ma_student_awaiting_bursar);
              }
              if (typeof mdiv_student_awaiting_bursar !== "undefined") {
                MDiv_array_awaiting_bursar.push(mdiv_student_awaiting_bursar);
              }
              if (typeof pgdt_student_awaiting_bursar !== "undefined") {
                PGDT_array_awaiting_bursar.push(pgdt_student_awaiting_bursar);
              }
              if (typeof ba_student_awaiting_bursar !== "undefined") {
                BA_array_awaiting_bursar.push(ba_student_awaiting_bursar);
              }
              if (typeof dip_student_awaiting_bursar !== "undefined") {
                Dip_array_awaiting_bursar.push(dip_student_awaiting_bursar);
              }
            }

            for (let i = 0; i < registrations_completed.length; i++) {
              const ma_student_completed = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_completed[i].custom_id &&
                  allStudent.programme_category === "Masters Programme"
              );
              const mdiv_student_completed = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_completed[i].custom_id &&
                  allStudent.programme_category ===
                    "Master of Divinity Programme"
              );
              const pgdt_student_completed = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_completed[i].custom_id &&
                  allStudent.programme_category === "PGDT Programme"
              );
              const ba_student_completed = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_completed[i].custom_id &&
                  allStudent.programme_category === "Bachelor of Arts Programme"
              );
              const dip_student_completed = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_completed[i].custom_id &&
                  allStudent.programme_category === "Diploma Programme"
              );
              if (typeof ma_student_completed !== "undefined") {
                MA_array_completed.push(ma_student_completed);
              }
              if (typeof mdiv_student_completed !== "undefined") {
                MDiv_array_completed.push(mdiv_student_completed);
              }
              if (typeof pgdt_student_completed !== "undefined") {
                PGDT_array_completed.push(pgdt_student_completed);
              }
              if (typeof ba_student_completed !== "undefined") {
                BA_array_completed.push(ba_student_completed);
              }
              if (typeof dip_student_completed !== "undefined") {
                Dip_array_completed.push(dip_student_completed);
              }
            }

            for (let i = 0; i < registrations_incompleted.length; i++) {
              const ma_student_incomplete = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_incompleted[i].custom_id &&
                  allStudent.programme_category === "Masters Programme"
              );
              const mdiv_student_incomplete = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_incompleted[i].custom_id &&
                  allStudent.programme_category ===
                    "Master of Divinity Programme"
              );
              const pgdt_student_incomplete = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_incompleted[i].custom_id &&
                  allStudent.programme_category === "PGDT Programme"
              );
              const ba_student_incomplete = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_incompleted[i].custom_id &&
                  allStudent.programme_category === "Bachelor of Arts Programme"
              );
              const dip_student_incomplete = allStudents.find(
                (allStudent) =>
                  allStudent.custom_id ===
                    registrations_incompleted[i].custom_id &&
                  allStudent.programme_category === "Diploma Programme"
              );
              if (typeof ma_student_incomplete !== "undefined") {
                MA_array_incomplete.push(ma_student_incomplete);
              }
              if (typeof mdiv_student_incomplete !== "undefined") {
                MDiv_array_incomplete.push(mdiv_student_incomplete);
              }
              if (typeof pgdt_student_incomplete !== "undefined") {
                PGDT_array_incomplete.push(pgdt_student_incomplete);
              }
              if (typeof ba_student_incomplete !== "undefined") {
                BA_array_incomplete.push(ba_student_incomplete);
              }
              if (typeof dip_student_incomplete !== "undefined") {
                Dip_array_incomplete.push(dip_student_incomplete);
              }
            }

            setMAStudentsStarted(MA_array_started.length);
            setMDivStudentsStarted(MDiv_array_started.length);
            setPGDTStudentsStarted(PGDT_array_started.length);
            setBAStudentsStarted(BA_array_started.length);
            setDipStudentsStarted(Dip_array_started.length);
            setMAStudentsAwaitingDean(MA_array_awaiting_dean.length);
            setMDivStudentsAwaitingDean(MDiv_array_awaiting_dean.length);
            setPGDTStudentsAwaitingDean(PGDT_array_awaiting_dean.length);
            setBAStudentsAwaitingDean(BA_array_awaiting_dean.length);
            setDipStudentsAwaitingDean(Dip_array_awaiting_dean.length);

            setMAStudentsDisapproved(MA_array_disapproved.length);
            setMDivStudentsDisapproved(MDiv_array_disapproved.length);
            setPGDTStudentsDisapproved(PGDT_array_disapproved.length);
            setBAStudentsDisapproved(BA_array_disapproved.length);
            setDipStudentsDisapproved(Dip_array_disapproved.length);

            setMAStudentsAwaitingBursar(MA_array_awaiting_bursar.length);
            setMDivStudentsAwaitingBursar(MDiv_array_awaiting_bursar.length);
            setPGDTStudentsAwaitingBursar(PGDT_array_awaiting_bursar.length);
            setBAStudentsAwaitingBursar(BA_array_awaiting_bursar.length);
            setDipStudentsAwaitingBursar(Dip_array_awaiting_bursar.length);
            setMAStudentsCompleted(MA_array_completed.length);
            setMDivStudentsCompleted(MDiv_array_completed.length);
            setPGDTStudentsCompleted(PGDT_array_completed.length);
            setBAStudentsCompleted(BA_array_completed.length);
            setDipStudentsCompleted(Dip_array_completed.length);
            setMAStudentsIncomplete(MA_array_incomplete.length);
            setMDivStudentsIncomplete(MDiv_array_incomplete.length);
            setPGDTStudentsIncomplete(PGDT_array_incomplete.length);
            setBAStudentsIncomplete(BA_array_incomplete.length);
            setDipStudentsIncomplete(Dip_array_incomplete.length);
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        totalRegistrations,
        MAStudentsStarted,
        MDivStudentsStarted,
        PGDTStudentsStarted,
        BAStudentsStarted,
        DipStudentsStarted,
        MAStudentsAwaitingDean,
        MDivStudentsAwaitingDean,
        PGDTStudentsAwaitingDean,
        BAStudentsAwaitingDean,
        DipStudentsAwaitingDean,
        MAStudentsDisapproved,
        MDivStudentsDisapproved,
        PGDTStudentsDisapproved,
        BAStudentsDisapproved,
        DipStudentsDisapproved,
        MAStudentsAwaitingBursar,
        MDivStudentsAwaitingBursar,
        PGDTStudentsAwaitingBursar,
        BAStudentsAwaitingBursar,
        DipStudentsAwaitingBursar,
        MAStudentsCompleted,
        MDivStudentsCompleted,
        PGDTStudentsCompleted,
        BAStudentsCompleted,
        DipStudentsCompleted,
        MAStudentsIncomplete,
        MDivStudentsIncomplete,
        PGDTStudentsIncomplete,
        BAStudentsIncomplete,
        DipStudentsIncomplete,
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

  const [stats] = createResource(fetchRegistrations);

  return (
    <MetaProvider>
      <Title>
        Enrollment Statistics - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Enrollment Statistics on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Enrollment Statistics{" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Here's the students enrollment statistics for chosen semester.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4 overflow-y-scroll">
            <Show
              when={stats.loading}
              fallback={
                <div class="space-y-6">
                  <table cellPadding={0} cellSpacing={0} class="w-full my-4">
                    <thead class="bg-blue-950 text-white border-b border-black">
                      <tr class="">
                        <td class="p-4 font-semibold border-r border-black">
                          #.
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          Programme Category
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          Yet to forward for Approval
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          Awaiting Dean's Approval
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          Disapproved
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          Awaiting Bursar
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          Yet to Submit/Complete Reg.
                        </td>
                        <td class="p-4 font-semibold">
                          Completed Registration
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                        <td class="p-4 font-semibold border-r border-black">
                          1.
                        </td>
                        <td class="p-4 border-r border-black">
                          Diploma Programme
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().DipStudentsStarted()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().DipStudentsAwaitingDean()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().DipStudentsDisapproved()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().DipStudentsAwaitingBursar}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().DipStudentsIncomplete()}
                        </td>
                        <td class="p-4">{stats().DipStudentsCompleted()}</td>
                      </tr>
                      <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                        <td class="p-4 font-semibold border-r border-black">
                          2.
                        </td>
                        <td class="p-4 border-r border-black">
                          Bachelor of Arts Programme
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().BAStudentsStarted()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().BAStudentsAwaitingDean()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().BAStudentsDisapproved()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().BAStudentsAwaitingBursar}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().BAStudentsIncomplete()}
                        </td>
                        <td class="p-4">{stats().BAStudentsCompleted()}</td>
                      </tr>
                      <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                        <td class="p-4 font-semibold border-r border-black">
                          3.
                        </td>
                        <td class="p-4 border-r border-black">
                          PGDT Programme
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().PGDTStudentsStarted()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().PGDTStudentsAwaitingDean()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().PGDTStudentsDisapproved()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().PGDTStudentsAwaitingBursar}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().PGDTStudentsIncomplete()}
                        </td>
                        <td class="p-4">{stats().PGDTStudentsCompleted()}</td>
                      </tr>
                      <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                        <td class="p-4 font-semibold border-r border-black">
                          4.
                        </td>
                        <td class="p-4 border-r border-black">
                          Masters Programme
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MAStudentsStarted()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MAStudentsAwaitingDean()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MAStudentsDisapproved()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MAStudentsAwaitingBursar}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MAStudentsIncomplete()}
                        </td>
                        <td class="p-4">{stats().MAStudentsCompleted()}</td>
                      </tr>
                      <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                        <td class="p-4 font-semibold border-r border-black">
                          5.
                        </td>
                        <td class="p-4 border-r border-black">
                          Master of Divinity Programme
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MDivStudentsStarted()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MDivStudentsAwaitingDean()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MDivStudentsDisapproved()}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MDivStudentsAwaitingBursar}
                        </td>
                        <td class="p-4 border-r border-black">
                          {stats().MDivStudentsIncomplete()}
                        </td>
                        <td class="p-4">{stats().MDivStudentsCompleted()}</td>
                      </tr>
                      <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                        <td
                          class="p-4 font-semibold border-r border-black"
                          colSpan={2}
                        >
                          Total
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          {parseInt(stats().DipStudentsStarted()) +
                            parseInt(stats().BAStudentsStarted()) +
                            parseInt(stats().PGDTStudentsStarted()) +
                            parseInt(stats().MAStudentsStarted()) +
                            parseInt(stats().MDivStudentsStarted())}
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          {parseInt(stats().DipStudentsAwaitingDean()) +
                            parseInt(stats().BAStudentsAwaitingDean()) +
                            parseInt(stats().PGDTStudentsAwaitingDean()) +
                            parseInt(stats().MAStudentsAwaitingDean()) +
                            parseInt(stats().MDivStudentsAwaitingDean())}
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          {parseInt(stats().DipStudentsDisapproved()) +
                            parseInt(stats().BAStudentsDisapproved()) +
                            parseInt(stats().PGDTStudentsDisapproved()) +
                            parseInt(stats().MAStudentsDisapproved()) +
                            parseInt(stats().MDivStudentsDisapproved())}
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          {parseInt(stats().DipStudentsAwaitingBursar()) +
                            parseInt(stats().BAStudentsAwaitingBursar()) +
                            parseInt(stats().PGDTStudentsAwaitingBursar()) +
                            parseInt(stats().MAStudentsAwaitingBursar()) +
                            parseInt(stats().MDivStudentsAwaitingBursar())}
                        </td>
                        <td class="p-4 font-semibold border-r border-black">
                          {parseInt(stats().DipStudentsIncomplete()) +
                            parseInt(stats().BAStudentsIncomplete()) +
                            parseInt(stats().PGDTStudentsIncomplete()) +
                            parseInt(stats().MAStudentsIncomplete()) +
                            parseInt(stats().MDivStudentsIncomplete())}
                        </td>
                        <td class="p-4 font-semibold">
                          {parseInt(stats().DipStudentsCompleted()) +
                            parseInt(stats().BAStudentsCompleted()) +
                            parseInt(stats().PGDTStudentsCompleted()) +
                            parseInt(stats().MAStudentsCompleted()) +
                            parseInt(stats().MDivStudentsCompleted())}
                        </td>
                      </tr>
                      <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                        <td class="p-4" colSpan={7}>
                          **Total number of students who initiated registration
                          for this semester is{" "}
                          <b>
                            <u>{stats().totalRegistrations()}</u>
                          </b>{" "}
                          out of which only{" "}
                          <b>
                            <u>
                              {parseInt(stats().DipStudentsCompleted()) +
                                parseInt(stats().BAStudentsCompleted()) +
                                parseInt(stats().PGDTStudentsCompleted()) +
                                parseInt(stats().MAStudentsCompleted()) +
                                parseInt(stats().MDivStudentsCompleted())}
                            </u>
                          </b>{" "}
                          have completed their registrations.
                        </td>
                      </tr>
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
