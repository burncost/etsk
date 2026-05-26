import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import Loading from "../components/Loading";

import {
  createSignal,
  createResource,
  Show,
  For,
} from "solid-js";

const schema = z.object({
  undertaking: z.string().min(1, "*Required"),
});

const PROGRAMME_BUCKETS = {
  "Masters Programme": "MA",
  "Master of Divinity Programme": "MDiv",
  "PGDT Programme": "PGDT",
  "Bachelor of Arts Programme": "BA",
  "Diploma Programme": "Dip",
};

const emptyData = () => ({
  MA: [],
  MDiv: [],
  PGDT: [],
  BA: [],
  Dip: [],
});

export default function AwaitingApproval() {
  const params = useParams();
  const navigate = useNavigate();

  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");

  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  useFormHandler(zodSchema(schema));

  /* ------------------------------------------------------------------ */
  /* RESOURCE FETCHER (SAFE, GUARANTEED RETURN VALUE)                    */
  /* ------------------------------------------------------------------ */
  const fetchRegistrations = async () => {
    const userRaw = localStorage.getItem("jetsUser");
    if (!userRaw) {
      navigate("/", { replace: true });
      return emptyData();
    }

    const user = JSON.parse(userRaw);
    if (!user?.token) {
      navigate("/", { replace: true });
      return emptyData();
    }

    const headers = {
      Authorization: `Bearer ${user.token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    try {
      const [
        registrationsRes,
        usersRes,
        studentsRes,
        periodRes,
      ] = await Promise.all([
        fetch(`${VITE_API_URL}/api/view-registrations/${params.periodId}`, { headers }),
        fetch(`${VITE_API_URL}/api/view-users`, { headers }),
        fetch(`${VITE_API_URL}/api/view-students`, { headers }),
        fetch(`${VITE_API_URL}/api/period/${params.periodId}`, { headers }),
      ]);

      const [
        registrationsData,
        usersData,
        studentsData,
        periodData,
      ] = await Promise.all([
        registrationsRes.json(),
        usersRes.json(),
        studentsRes.json(),
        periodRes.json(),
      ]);

      if (registrationsData?.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
        return emptyData();
      }

      setSemester(periodData?.response?.semester ?? "");
      setSession(periodData?.response?.session ?? "");

      const registrations = registrationsData?.response ?? [];
      const users = usersData?.response ?? [];
      const students = studentsData?.response ?? [];

      /* -------------------------------------------------------------- */
      /* INDEX USERS & STUDENTS (PREVENTS undefined ACCESS)             */
      /* -------------------------------------------------------------- */
      const usersById = {};
      for (const u of users) {
        usersById[u.custom_id] = u;
      }

      const studentsByKey = {};
      for (const s of students) {
        studentsByKey[`${s.custom_id}_${s.programme_category}`] = s;
      }

      const result = emptyData();

      const awaitingStatus =
        user.surname === "bursar"
          ? "awaiting bursar"
          : "awaiting dean";

      for (const reg of registrations) {
        if (reg.registration_status !== awaitingStatus) continue;

        for (const [programmeCategory, bucket] of Object.entries(PROGRAMME_BUCKETS)) {
          const student =
            studentsByKey[`${reg.custom_id}_${programmeCategory}`];

          if (!student) continue;

          const u = usersById[student.custom_id] ?? {};

          result[bucket].push({
            ledger_number: student.ledger_number ?? "",
            programme: student.programme ?? "",
            surname: u.surname ?? "",
            first_name: u.first_name ?? "",
            other_names: u.other_names ?? "",
            student_id: u.username ?? "",
            custom_id: student.custom_id ?? "",
            status: reg.registration_status ?? "",
            undertaking: reg.undertaking ?? "",
            fresh_returning: reg.fresh_returning ?? "",
            current_level: reg.current_level ?? "",
          });
        }
      }

      return result;
    } catch (err) {
      console.error("Failed to load awaiting approvals:", err);
      return emptyData();
    }
  };

  const [resources] = createResource(fetchRegistrations);

  /* ------------------------------------------------------------------ */
  /* RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <MetaProvider>
      <Title>Awaiting Approval - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Awaiting Approval on ECWA Theological Seminary, KAGORO (ETSK)"
      />

      <div class="text-sm">
        <Header />

        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Awaiting Approval
            <Show when={semester() && session()}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>

          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4 overflow-y-scroll">
            <Show when={!resources.loading} fallback={<Loading />}>
              <ApprovalTable
                title="MASTER OF DIVINITY STUDENTS"
                students={resources().MDiv}
                params={params}
              />
              <ApprovalTable
                title="MASTERS STUDENTS"
                students={resources().MA}
                params={params}
              />
              <ApprovalTable
                title="PGDT STUDENTS"
                students={resources().PGDT}
                params={params}
              />
              <ApprovalTable
                title="BA STUDENTS"
                students={resources().BA}
                params={params}
              />
              <ApprovalTable
                title="DIPLOMA STUDENTS"
                students={resources().Dip}
                params={params}
              />
            </Show>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}

/* -------------------------------------------------------------------- */
/* REUSABLE TABLE (NO undefined ACCESS POSSIBLE)                         */
/* -------------------------------------------------------------------- */
function ApprovalTable(props) {
  return (
    <table cellPadding={0} cellSpacing={0} class="w-full my-4">
      <thead class="bg-blue-950 text-white border-b border-black">
        <tr>
          <td class="p-4 text-center border-b" colSpan={7}>
            {props.title}
          </td>
        </tr>
        <tr>
          <td class="p-4 border-r border-black">#.</td>
          <td class="p-4 border-r border-black">Fullname</td>
          <td class="p-4 border-r border-black">Prog.</td>
          <td class="p-4 border-r border-black">Stud. ID</td>
          <td class="p-4 border-r border-black">Ledger No.</td>
          <td class="p-4 border-r border-black">Year</td>
          <td class="p-4">?</td>
        </tr>
      </thead>

      <tbody>
        <Show
          when={props.students.length > 0}
          fallback={
            <tr class="border-b border-black">
              <td colSpan={7} class="p-4 text-center">
                No record(s) found.
              </td>
            </tr>
          }
        >
          <For each={props.students}>
            {(registration, i) => (
              <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                <td class="p-4 font-semibold border-r border-black">
                  {i() + 1}.
                </td>
                <td class="p-4 border-r border-black space-x-1">
                  <b class="uppercase">{registration.surname}</b>
                  <span class="capitalize"> {registration.first_name}</span>
                  <span class="capitalize"> {registration.other_names}</span>
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
                  Student)
                </td>
                <td class="p-4">
                  <A
                    href={`/admin/registration-form/${props.params.periodId}/${registration.custom_id}`}
                    class="green-btn p-3 hover:opacity-60 inline-block"
                    target="_blank"
                  >
                    View Form
                  </A>
                </td>
              </tr>
            )}
          </For>
        </Show>
      </tbody>
    </table>
  );
}
