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

export default function RegistrationLog() {
  const params = useParams();
  const navigate = useNavigate();

  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [NewStudents, setNewStudents] = createStore([]);
  const [NewStudentsEmpty, setNewStudentsEmpty] = createSignal(false);

  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  // Get user data from localStorage
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("jetsUser")) || null;
    } catch (e) {
      return null;
    }
  };

  // Fetch period details
  const fetchPeriod = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/api/period/${params.periodId}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${getUser()?.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      });

      const result = await response.json();
      if (result.response) {
        setSemester(result.response.semester);
        setSession(result.response.session);
      }
    } catch (error) {
      console.error("Error fetching period:", error);
    }
  };

  // Fetch registrations and users
  const fetchRegistrations = async () => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    try {
      // Fetch all required data concurrently
      const [registrationsRes, usersRes, studentsRes] = await Promise.all([
        fetch(`${VITE_API_URL}/api/view-registrations/${params.periodId}`, {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }).then((res) => res.json()),

        fetch(`${VITE_API_URL}/api/view-users`, {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }).then((res) => res.json()),

        fetch(`${VITE_API_URL}/api/view-students`, {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "GET",
        }).then((res) => res.json()),
      ]);

      if (registrationsRes.response === "Expired token") {
        localStorage.removeItem("jetsUser");
        navigate("/", { replace: true });
        return;
      }

      const registrations = registrationsRes.response || [];
      const allUsers = usersRes.response || [];
      const allStudents = studentsRes.response || [];

      // Process new students
      const NewStudentsArray = registrations
        .filter((reg) => reg.registration_status === "completed" && reg.fresh_returning === "new")
        .map((reg) => {
          const student = allStudents.find((s) => s.custom_id === reg.custom_id);
          const user = allUsers.find((u) => u.custom_id === reg.custom_id);

          // Ensure student and user exist before accessing properties
          if (student && user) {
            return {
              ledger_number: student.ledger_number,
              programme: student.programme,
              surname: user.surname,
              first_name: user.first_name,
              other_names: user.other_names,
              student_id: user.username,
              custom_id: student.custom_id,
              status: reg.registration_status,
              undertaking: reg.undertaking,
              fresh_returning: reg.fresh_returning,
              current_level: reg.current_level,
            };
          }
          return null;
        })
        .filter(Boolean); // Remove null entries

      setNewStudents(NewStudentsArray);
      setNewStudentsEmpty(NewStudentsArray.length === 0);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const [resources] = createResource(fetchRegistrations);

  return (
    <MetaProvider>
      <Title>New Students Log - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta name="description" content="New Students Log on ECWA Theological Seminary, KAGORO (ETSK)" />

      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            New Students Log{" "}
            <Show when={session() && semester()}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>

          <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Here's a list of all new students that have completed registration for the chosen semester.</p>
          </div>

          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4 overflow-y-scroll">
            <Show when={resources.loading} fallback={
              <table cellPadding={0} cellSpacing={0} class="w-full my-4">
                <thead class="bg-blue-950 text-white border-b border-black">
                  <tr>
                    <td class="p-4 border-r border-black">#</td>
                    <td class="p-4 border-r border-black">Fullname</td>
                    <td class="p-4 border-r border-black">Prog.</td>
                    <td class="p-4 border-r border-black">Stud. ID</td>
                    <td class="p-4 border-r border-black">Ledger No.</td>
                    <td class="p-4">Year</td>
                  </tr>
                </thead>
                <tbody>
                  <Show when={NewStudents.length > 0} fallback={
                    <tr class="border-b border-black">
                      <td colSpan={6} class="p-4 text-center">
                        {NewStudentsEmpty() ? "No record(s) found." : <Loading />}
                      </td>
                    </tr>
                  }>
                    <For each={NewStudents}>
                      {(student, i) => (
                        <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                          <td class="p-4 font-semibold border-r border-black">{i() + 1}.</td>
                          <td class="p-4 border-r border-black">
                            <b class="uppercase">{student.surname}</b> {student.first_name} {student.other_names}
                          </td>
                          <td class="p-4 border-r border-black">{student.programme}</td>
                          <td class="p-4 border-r border-black">{student.student_id}</td>
                          <td class="p-4 border-r border-black">{student.ledger_number}</td>
                          <td class="p-4">{student.current_level} ({student.fresh_returning} Student)</td>
                        </tr>
                      )}
                    </For>
                  </Show>
                </tbody>
              </table>
            }>
              <Loading />
            </Show>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
