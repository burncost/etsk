import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";

import Loading from "../components/Loading";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function AdminDashboard() {
  const [countActiveStudents, setCountActiveStudents] = createSignal("");
  const [countFemaleStudents, setCountFemaleStudents] = createSignal("");
  const [countMaleStudents, setCountMaleStudents] = createSignal("");
  const [countFaculty, setCountFaculty] = createSignal("");
  const [countIntStudents, setCountIntStudents] = createSignal("");
  const [countECWAStudents, setCountECWAStudents] = createSignal("");
  const [countNonECWAStudents, setCountNonECWAStudents] = createSignal("");
  const [countMDivStudents, setCountMDivStudents] = createSignal("");
  const [countMAStudents, setCountMAStudents] = createSignal("");
  const [countPGDTStudents, setCountPGDTStudents] = createSignal("");
  const [countBAStudents, setCountBAStudents] = createSignal("");
  const [countDipStudents, setCountDipStudents] = createSignal("");

  const fetchStats = async () => {
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
        const request1 = fetch(VITE_API_URL + "/api/view-users", {
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
        const request2 = fetch(VITE_API_URL + "/api/view-students", {
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
        Promise.all([request1, request2])
          .then(([data1, data2]) => {
            var allUsers = data1.response;
            var allStudents = data2.response;

            var active_students = allUsers.filter(
              (user) => user.user_role == "student" && user.gender != null
            );
            var faculty = allUsers.filter(
              (user) => user.user_role == "faculty" && user.status == "active"
            );
            var female_students = active_students.filter(
              (female) => female.gender == "Female"
            );
            var male_students = active_students.filter(
              (male) => male.gender == "Male"
            );
            var int_students = allStudents.filter(
              (student) =>
                student.country_of_origin != "Nigeria" &&
                student.department != null
            );
            var ecwa_students = allStudents.filter(
              (student) =>
                student.denomination == "ECWA" && student.department != null
            );
            var non_ecwa_students = allStudents.filter(
              (student) =>
                student.denomination == "Non-ECWA" && student.department != null
            );
            var mdiv_students = allStudents.filter(
              (student) =>
                student.programme_category == "Master of Divinity Programme" &&
                student.department != null
            );
            var ma_students = allStudents.filter(
              (student) =>
                student.programme_category == "Masters Programme" &&
                student.department != null
            );
            var pgdt_students = allStudents.filter(
              (student) =>
                student.programme_category == "PGDT Programme" &&
                student.department != null
            );
            var ba_students = allStudents.filter(
              (student) =>
                student.programme_category == "Bachelor of Arts Programme" &&
                student.department != null
            );
            var dip_students = allStudents.filter(
              (student) =>
                student.programme_category == "Diploma Programme" &&
                student.department != null
            );
            setCountActiveStudents(active_students.length);
            setCountFemaleStudents(female_students.length);
            setCountMaleStudents(male_students.length);
            setCountFaculty(faculty.length);
            setCountIntStudents(int_students.length);
            setCountECWAStudents(ecwa_students.length);
            setCountNonECWAStudents(non_ecwa_students.length);
            setCountMDivStudents(mdiv_students.length);
            setCountMAStudents(ma_students.length);
            setCountPGDTStudents(pgdt_students.length);
            setCountBAStudents(ba_students.length);
            setCountDipStudents(dip_students.length);
          })
          .catch((error) => {
            console.error(error);
          });
      }

      return {
        countActiveStudents,
        countFemaleStudents,
        countMaleStudents,
        countFaculty,
        countIntStudents,
        countECWAStudents,
        countNonECWAStudents,
        countMDivStudents,
        countMAStudents,
        countPGDTStudents,
        countBAStudents,
        countDipStudents,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const [stats] = createResource(fetchStats);

  return (
    <MetaProvider>
      <Title>Admin Dashboard - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Admin dashboard on ECWA Theological  Seminary, Jos (JETS)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Admin Dashboard
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Data presented on this page are a representation of what's
              available on this portal only.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4 text-slate-800">
            <Show
              when={stats.loading}
              fallback={
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4 lg:gap-4">
                  <div class="border border-l-8 border-green-900 bg-green-100 rounded-md p-2 flex sm:text-center">
                    <div class="w-20 items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                        />
                      </svg>
                    </div>
                    <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                      <h1 class="text-xl">
                        {stats().countActiveStudents() === ""
                          ? "Fetching.. ."
                          : stats().countActiveStudents()}
                      </h1>
                      <h2 class="pt-1.5 sm:p-0">
                        <A
                          href="/admin/active-students"
                          class="text-xs hover:text-red-600"
                        >
                          Active Students
                        </A>
                      </h2>
                    </div>
                  </div>
                  <div class="border border-l-8 border-orange-900 bg-orange-100 rounded-md p-2 sm:flex sm:justify-between sm:text-center sm:col-span-2">
                    <div class="flex">
                      <div class="w-20 items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                          />
                        </svg>
                      </div>
                      <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countFemaleStudents() === ""
                            ? "Fetching.. ."
                            : stats().countFemaleStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            Female Students
                          </A>
                        </h2>
                      </div>
                    </div>
                    <div class="bg-orange-900 w-full h-0.5 mx-auto my-2 sm:my-0 sm:w-0.5 sm:h-full"></div>
                    <div class="flex flex-row-reverse sm:flex-row justify-between">
                      <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countMaleStudents() === ""
                            ? "Fetching.. ."
                            : stats().countMaleStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            Male Students
                          </A>
                        </h2>
                      </div>
                      <div class="w-20 items-center sm:text-right">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12 inline"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="border border-l-8 border-blue-900 bg-blue-100 rounded-md p-2 flex sm:text-center">
                    <div class="w-20 items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                        />
                      </svg>
                    </div>
                    <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                      <h1 class="text-xl">
                        {stats().countFaculty() === ""
                          ? "Fetching.. ."
                          : stats().countFaculty()}
                      </h1>
                      <h2 class="pt-1.5 sm:p-0">
                        <A href="#" class="text-xs hover:text-red-600">
                          Active Faculty
                        </A>
                      </h2>
                    </div>
                  </div>
                  <div class="border border-l-8 border-purple-900 bg-purple-100 rounded-md p-2 flex sm:text-center">
                    <div class="w-20 items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                        />
                      </svg>
                    </div>
                    <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                      <h1 class="text-xl">
                        {stats().countIntStudents() === ""
                          ? "Fetching.. ."
                          : stats().countIntStudents()}
                      </h1>
                      <h2 class="pt-1.5 sm:p-0">
                        <A href="#" class="text-xs hover:text-red-600">
                          Int<span class="hidden sm:inline">.</span>
                          <span class="sm:hidden">ernational</span> Students
                        </A>
                      </h2>
                    </div>
                  </div>
                  <div class="border border-l-8 border-slate-900 bg-slate-100 rounded-md p-2">
                    <ol class="flex justify-between sm:justify-none sm:block sm:space-y-2">
                      <li class="border-b">
                        <A href="#" class="text-xs hover:text-red-600">
                          Send Email to Students
                        </A>
                      </li>
                      <li class="border-b">
                        <A href="#" class="text-xs hover:text-red-600">
                          Send Email to Faculty
                        </A>
                      </li>
                    </ol>
                  </div>
                  <div>
                    <div class="border border-l-8 border-indigo-600 bg-indigo-100 rounded-md p-2 flex sm:text-center">
                      <div class="grow flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countECWAStudents() === ""
                            ? "Fetching.. ."
                            : stats().countECWAStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            ECWA
                          </A>
                        </h2>
                      </div>
                      <div class="w-0.5 bg-indigo-600 mx-2"></div>
                      <div class="grow flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countNonECWAStudents() === ""
                            ? "Fetching.. ."
                            : stats().countNonECWAStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            Non-ECWA
                          </A>
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div class="border border-l-8 border-cyan-600 bg-cyan-100 rounded-md p-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:text-center sm:col-span-3 lg:col-span-5">
                    <div class="flex border-b lg:border-b-0 lg:border-r border-cyan-600">
                      <div class="w-20 items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                          />
                        </svg>
                      </div>
                      <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countMDivStudents() === ""
                            ? "Fetching.. ."
                            : stats().countMDivStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            MDiv Students
                          </A>
                        </h2>
                      </div>
                    </div>
                    <div class="flex border-b lg:border-b-0 lg:border-r border-cyan-600">
                      <div class="w-20 items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                          />
                        </svg>
                      </div>
                      <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countMAStudents() === ""
                            ? "Fetching.. ."
                            : stats().countMAStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            MA Students
                          </A>
                        </h2>
                      </div>
                    </div>
                    <div class="flex border-b lg:border-b-0 lg:border-r border-cyan-600">
                      <div class="w-20 items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                          />
                        </svg>
                      </div>
                      <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countPGDTStudents() === ""
                            ? "Fetching.. ."
                            : stats().countPGDTStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            PGDT Students
                          </A>
                        </h2>
                      </div>
                    </div>
                    <div class="flex border-b lg:border-b-0 lg:border-r border-cyan-600">
                      <div class="w-20 items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                          />
                        </svg>
                      </div>
                      <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countBAStudents() === ""
                            ? "Fetching.. ."
                            : stats().countBAStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            BA Students
                          </A>
                        </h2>
                      </div>
                    </div>
                    <div class="flex">
                      <div class="w-20 items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                          />
                        </svg>
                      </div>
                      <div class="grow pt-2 sm:pt-0 flex space-x-1 sm:space-x-0 sm:block">
                        <h1 class="text-xl">
                          {stats().countDipStudents() === ""
                            ? "Fetching.. ."
                            : stats().countDipStudents()}
                        </h1>
                        <h2 class="pt-1.5 sm:p-0">
                          <A href="#" class="text-xs hover:text-red-600">
                            Diploma Students
                          </A>
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              <Loading />
            </Show>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
