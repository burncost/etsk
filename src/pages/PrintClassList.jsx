import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams, useSearchParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";
import { createStore } from "solid-js/store";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function PrintClassList() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [viewName, setViewName] = createSignal("");
  const [viewPassport, setViewPassport] = createSignal("");
  const [registeredList, setRegisteredList] = createStore([]);
  const [addedList, setAddedList] = createStore([]);
  const [droppedList, setDroppedList] = createStore([]);
  const [registeredListEmpty, setRegisteredListEmpty] = createSignal(false);
  const [addedListEmpty, setAddedListEmpty] = createSignal(false);
  const [droppedListEmpty, setDroppedListEmpty] = createSignal(false);
  const [showModal, setShowModal] = createSignal(false);

  const registeredListArray = [];
  const addedListArray = [];
  const droppedListArray = [];
  const fetchResources = async () => {
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
            var completed_registration = data1.response.filter(
              (registration) => registration.registration_status == "completed"
            );

            for (let i = 0; i < completed_registration.length; i++) {
              var picked_courses = JSON.parse(
                completed_registration[i].picked_courses
              );
              if (picked_courses) {
                var the_course = picked_courses.filter(
                  (course) => course == searchParams.code
                );
                if (the_course.length > 0) {
                  const users = data2.response.find(
                    (user) =>
                      user.custom_id === completed_registration[i].custom_id
                  );
                  const students = data3.response.find(
                    (student) =>
                      student.custom_id === completed_registration[i].custom_id
                  );
                  var registered_list = {
                    code: the_course[0],
                    custom_id: completed_registration[i].custom_id,
                    surname: users.surname,
                    first_name: users.first_name,
                    other_names: users.other_names,
                    phone_number: users.phone_number,
                    gender: users.gender,
                    passport_url: users.passport_url,
                    matriculation_number: students.matriculation_number,
                    email: students.email,
                  };
                  registeredListArray.push(registered_list);
                }
              }
            }

            var completed_add_drop = data1.response.filter(
              (registration) => registration.add_drop_status == "completed"
            );

            for (let i = 0; i < completed_add_drop.length; i++) {
              var added_courses = JSON.parse(
                completed_add_drop[i].added_courses
              );
              if (added_courses) {
                var the_course = added_courses.filter(
                  (course) => course == searchParams.code
                );
                if (the_course.length > 0) {
                  const users = data2.response.find(
                    (user) => user.custom_id === completed_add_drop[i].custom_id
                  );
                  const students = data3.response.find(
                    (student) =>
                      student.custom_id === completed_add_drop[i].custom_id
                  );
                  var added_list = {
                    code: the_course[0],
                    custom_id: completed_add_drop[i].custom_id,
                    surname: users.surname,
                    first_name: users.first_name,
                    other_names: users.other_names,
                    phone_number: users.phone_number,
                    gender: users.gender,
                    passport_url: users.passport_url,
                    matriculation_number: students.matriculation_number,
                    email: students.email,
                  };
                  addedListArray.push(added_list);
                }
              }
            }

            for (let i = 0; i < completed_add_drop.length; i++) {
              var dropped_courses = JSON.parse(
                completed_add_drop[i].dropped_courses
              );
              if (dropped_courses) {
                var the_course = dropped_courses.filter(
                  (course) => course == searchParams.code
                );
                if (the_course.length > 0) {
                  const users = data2.response.find(
                    (user) => user.custom_id === completed_add_drop[i].custom_id
                  );
                  const students = data3.response.find(
                    (student) =>
                      student.custom_id === completed_add_drop[i].custom_id
                  );
                  var dropped_list = {
                    code: the_course[0],
                    custom_id: completed_add_drop[i].custom_id,
                    surname: users.surname,
                    first_name: users.first_name,
                    other_names: users.other_names,
                    phone_number: users.phone_number,
                    gender: users.gender,
                    passport_url: users.passport_url,
                    matriculation_number: students.matriculation_number,
                    email: students.email,
                  };
                  droppedListArray.push(dropped_list);
                }
              }
            }

            setRegisteredList(registeredListArray);
            setAddedList(addedListArray);
            setDroppedList(droppedListArray);

            if (registeredListArray.length < 1) {
              setRegisteredListEmpty(true);
            }
            if (addedListArray.length < 1) {
              setAddedListEmpty(true);
            }
            if (droppedListArray.length < 1) {
              setDroppedListEmpty(true);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        registeredList,
        addedList,
        droppedList,
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

  const passportPop = (url, surname, first_name, other_names) => {
    var name = surname.toUpperCase() + " " + first_name + " " + other_names;

    var pass1 = url.substring(0, 49);
    var pass2 = url.substring(48);
    var passport = pass1 + "c_scale,w_500/f_auto" + pass2;

    setShowModal(true);
    setViewName(name);

    setViewPassport(passport);
  };

  const printNow = async () => {
    window.print();
  };

  const [resources] = createResource(fetchResources);

  return (
    <MetaProvider>
      <Title>
        {searchParams.cat === "list" ? "Class List" : "Grade Sheet"} - ECWA
        Theological Seminary, Kagoro (ETSK)
      </Title>
      <Meta
        name="description"
        content={
          searchParams.cat === "list"
            ? "Class List"
            : "Grade Sheet" + " on ECWA Theological Seminary, KAGORO (ETSK)"
        }
      />
      <div
        onClick={() => printNow()}
        class="no-print text-lg text-center bg-orange-800 text-white p-4 cursor-pointer"
      >
        Click here to Print
      </div>
      <div class="text-sm">
        <Show when={searchParams.cat === "list"}>
          <div class="mt-8 w-full px-4 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Class List - {searchParams.code} ({searchParams.title}){" "}
              <Show when={session() !== "" && semester() !== ""}>
                <span class="block font-normal capitalize">
                  {semester()} Semester - {session()} Session
                </span>
              </Show>
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
              <p>
                Find below list of students registered during registration
                period, students who later added, and those who have dropped
                this course.
              </p>
            </div>
            <div class="space-y-4">
              <table
                cellPadding={0}
                cellSpacing={0}
                class="w-full my-4 border border-black"
              >
                <thead class="bg-white text-black border-b border-black">
                  <tr>
                    <td class="p-1 border-r border-black">#.</td>
                    <td class="p-1 border-r border-black">Name</td>
                    <td class="p-1 border-r border-black">Gender</td>
                    <td class="p-1 border-r border-black">Mat. Number</td>
                    <td class="p-1 border-r border-black">Email</td>
                    <td class="p-1">Phone</td>
                  </tr>
                </thead>
                <thead>
                  <tr class="bg-gray-400 border-b border-black text-blue-900">
                    <th class="p-1 text-left" colSpan={6}>
                      :: REGISTERED during registration period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={resources.loading}
                    fallback={
                      <Show
                        when={resources().registeredList.length > 0}
                        fallback={
                          <Show
                            when={registeredListEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={6} class="p-1 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={6} class="p-1 text-center">
                                No student has REGISTERED this course.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().registeredList}>
                          {(list, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-1 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-1 border-r border-black space-x-1">
                                <span class="uppercase font-semibold">
                                  {list.surname}
                                </span>
                                <span class="capitalize">
                                  {list.first_name}
                                </span>
                                <span class="capitalize">
                                  {list.other_names}
                                </span>
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.gender}
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.matriculation_number}
                              </td>
                              <td class="p-1 border-r border-black">
                                <Show
                                  when={list.email}
                                  fallback={
                                    <span class="text-red-600 text-xs">
                                      *Contact ICT department
                                    </span>
                                  }
                                >
                                  {list.email.toLowerCase()}
                                </Show>
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.phone_number}
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    }
                  >
                    <tr>
                      <td colSpan={6} class="p-1 text-center">
                        <Loading />
                      </td>
                    </tr>
                  </Show>
                </tbody>
                <thead>
                  <tr class="bg-gray-400 border-b border-black text-blue-900">
                    <th class="p-1 text-left" colSpan={6}>
                      :: ADDED during Add/Drop Period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={resources.loading}
                    fallback={
                      <Show
                        when={resources().addedList.length > 0}
                        fallback={
                          <Show
                            when={addedListEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={6} class="p-1 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={6} class="p-1 text-center">
                                No student has ADDED this course.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().addedList}>
                          {(list, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-1 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-1 border-r border-black space-x-1">
                                <span class="uppercase font-semibold">
                                  {list.surname}
                                </span>
                                <span class="capitalize">
                                  {list.first_name}
                                </span>
                                <span class="capitalize">
                                  {list.other_names}
                                </span>
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.gender}
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.matriculation_number}
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.email}
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.phone_number}
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    }
                  >
                    <tr>
                      <td colSpan={6} class="p-1 text-center">
                        <Loading />
                      </td>
                    </tr>
                  </Show>
                </tbody>
                <thead>
                  <tr class="bg-gray-400 border-b border-black text-blue-900">
                    <th class="p-1 text-left" colSpan={6}>
                      :: DROPPED during Add/Drop Period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={resources.loading}
                    fallback={
                      <Show
                        when={resources().droppedList.length > 0}
                        fallback={
                          <Show
                            when={droppedListEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={6} class="p-1 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={6} class="p-1 text-center">
                                No student has DROPPED this course.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().droppedList}>
                          {(list, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-1 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-1 border-r border-black space-x-1">
                                <span class="uppercase font-semibold">
                                  {list.surname}
                                </span>
                                <span class="capitalize">
                                  {list.first_name}
                                </span>
                                <span class="capitalize">
                                  {list.other_names}
                                </span>
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.gender}
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.matriculation_number}
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.email}
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.phone_number}
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    }
                  >
                    <tr>
                      <td colSpan={6} class="p-1 text-center">
                        <Loading />
                      </td>
                    </tr>
                  </Show>
                </tbody>
              </table>
            </div>
          </div>
        </Show>
        <Show when={searchParams.cat === "sheet"}>
          <div class="mt-8 w-full px-4 mx-auto space-y-4">
            <h2 class="font-bold text-center text-lg underline">
              ECWA Theological Seminary, KAGORO (ETSK)
              <br />
              Grade Sheet
            </h2>
            <div class="flex justify-between">
              <div>
                <b class="uppercase">Please Tick:</b>
              </div>
              <div>
                UNDERGRADUATE <b>[&nbsp;&nbsp;]</b>
              </div>
              <div>
                GRADUATE <b>[&nbsp;&nbsp;]</b>
              </div>
              <div>
                POST GRADUATE DIPLOMA <b>[&nbsp;&nbsp;]</b>
              </div>
            </div>
            <div>
              <b>Faculty, please take note:</b> Submit 2 copies to the Academic
              Dean and retain one copy for yourself. Submit your result to the
              Office of the Academic Dean latest two weeks after exams. Only
              term grade to be subnitted.
            </div>
            <div class="-space-y-1">
              <div>
                <div class="flex justify-between">
                  <div class="space-x-3">
                    <b>SESSION:</b>
                    <span>{session()}</span>
                  </div>
                  <div class="space-x-3">
                    <b>SEMESTER:</b>
                    <span>{semester()}</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="flex justify-between">
                  <div class="space-x-3">
                    <b>COURSE CODE AND TITLE:</b>
                    <span>
                      {searchParams.code} - {searchParams.title}
                    </span>
                  </div>
                  <div class="space-x-3">
                    <b>CREDIT HOURS:</b>
                    <span>{searchParams.hours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <table
                cellPadding={0}
                cellSpacing={0}
                class="w-full my-4 border border-black table-auto"
              >
                <thead class="bg-white text-black border-b border-black text-center">
                  <tr>
                    <td class="p-1 border-r border-black">#.</td>
                    <td class="p-1 border-r border-black">ID. No</td>
                    <td class="p-1 border-r border-black">
                      <span class="flex justify-between">
                        <b class="uppercase">Surname</b>
                        <span>Other Names</span>
                      </span>
                    </td>
                    <td class="p-1 border-r border-black">
                      Assignments/Mid Term Exam
                    </td>
                    <td class="p-1 border-r border-black">Final Exam</td>
                    <td class="p-1 border-r border-black">Total Score</td>
                    <td class="p-1">Term Grade</td>
                  </tr>
                  <tr>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-t border-black"></td>
                    <td class="border-r border-t border-black">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1">(Letter)</td>
                  </tr>
                </thead>
                <thead>
                  <tr class="bg-gray-400 border-b border-black text-blue-900">
                    <th class="p-1 text-left" colSpan={7}>
                      :: REGISTERED during registration period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={resources.loading}
                    fallback={
                      <Show
                        when={resources().registeredList.length > 0}
                        fallback={
                          <Show
                            when={registeredListEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={7} class="p-1 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={7} class="p-1 text-center">
                                No student has REGISTERED this course.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().registeredList}>
                          {(list, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-1 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.matriculation_number}
                              </td>
                              <td class="p-1 border-r border-black space-x-1">
                                <span class="uppercase font-semibold">
                                  {list.surname}
                                </span>
                                <span class="capitalize">
                                  {list.first_name}
                                </span>
                                <span class="capitalize">
                                  {list.other_names}
                                </span>
                              </td>
                              <td class="border-r border-black flex text-transparent">
                                <table
                                  cellPadding={0}
                                  cellSpacing={0}
                                  class="w-full text-center"
                                >
                                  <tbody>
                                    <tr>
                                      <td class="p-1 border-r border-black">
                                        1
                                      </td>
                                      <td class="p-1 border-r border-black">
                                        2
                                      </td>
                                      <td class="p-1 border-r border-black">
                                        3
                                      </td>
                                      <td class="p-1 border-r border-black">
                                        4
                                      </td>
                                      <td class="p-1">5</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td class="p-1 border-r border-black"></td>
                              <td class="p-1 border-r border-black"></td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    }
                  >
                    <tr>
                      <td colSpan={7} class="p-1 text-center">
                        <Loading />
                      </td>
                    </tr>
                  </Show>
                </tbody>
                <thead>
                  <tr class="bg-gray-400 border-b border-black text-blue-900">
                    <th class="p-1 text-left" colSpan={7}>
                      :: ADDED during Add/Drop Period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={resources.loading}
                    fallback={
                      <Show
                        when={resources().addedList.length > 0}
                        fallback={
                          <Show
                            when={addedListEmpty()}
                            fallback={
                              <tr class="border-b border-black">
                                <td colSpan={7} class="p-1 text-center">
                                  <Loading />
                                </td>
                              </tr>
                            }
                          >
                            <tr class="border-b border-black">
                              <td colSpan={7} class="p-1 text-center">
                                No student has ADDED this course.
                              </td>
                            </tr>
                          </Show>
                        }
                      >
                        <For each={resources().addedList}>
                          {(list, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-1 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-1 border-r border-black">
                                {list.matriculation_number}
                              </td>
                              <td class="p-1 border-r border-black space-x-1">
                                <span class="uppercase font-semibold">
                                  {list.surname}
                                </span>
                                <span class="capitalize">
                                  {list.first_name}
                                </span>
                                <span class="capitalize">
                                  {list.other_names}
                                </span>
                              </td>
                              <td class="border-r border-black flex text-transparent">
                                <table
                                  cellPadding={0}
                                  cellSpacing={0}
                                  class="w-full text-center"
                                >
                                  <tbody>
                                    <tr>
                                      <td class="p-1 border-r border-black">
                                        1
                                      </td>
                                      <td class="p-1 border-r border-black">
                                        2
                                      </td>
                                      <td class="p-1 border-r border-black">
                                        3
                                      </td>
                                      <td class="p-1 border-r border-black">
                                        4
                                      </td>
                                      <td class="p-1">5</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td class="p-1 border-r border-black"></td>
                              <td class="p-1 border-r border-black"></td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    }
                  >
                    <tr>
                      <td colSpan={7} class="p-1 text-center">
                        <Loading />
                      </td>
                    </tr>
                  </Show>
                </tbody>
                <thead>
                  <tr class="bg-gray-400 border-b border-black text-blue-900">
                    <th class="p-1 text-left" colSpan={7}>
                      :: Others
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                  <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                    <td class="p-1 border-r border-black font-semibold"></td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black space-x-1"></td>
                    <td class="border-r border-black flex text-transparent">
                      <table
                        cellPadding={0}
                        cellSpacing={0}
                        class="w-full text-center"
                      >
                        <tbody>
                          <tr>
                            <td class="p-1 border-r border-black">1</td>
                            <td class="p-1 border-r border-black">2</td>
                            <td class="p-1 border-r border-black">3</td>
                            <td class="p-1 border-r border-black">4</td>
                            <td class="p-1">5</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td class="p-1 border-r border-black"></td>
                    <td class="p-1 border-r border-black"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
