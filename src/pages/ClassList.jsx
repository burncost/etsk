import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams, useSearchParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";
import { createStore } from "solid-js/store";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function ClassList() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [viewName, setViewName] = createSignal("");
  const [viewPassport, setViewPassport] = createSignal("");
  const [registeredList, setRegisteredList] = createStore([]);
  const [addedList, setAddedList] = createStore([]);
  const [droppedList, setDroppedList] = createStore([]);
  const [lecturer, setLecturer] = createSignal("");
  const [lecturerEmpty, setLecturerEmpty] = createSignal("");
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
        const request4 = fetch(
          VITE_API_URL + "/api/view-assigned-courses/" + params.periodId,
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

        Promise.all([request1, request2, request3, request4])
          .then(([data1, data2, data3, data4]) => {
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
                  // console.log(students.matriculation_number);
                  // console.log(completed_registration[i].custom_id);
                  // console.log(users.surname);
                  // console.log(users.phone_number);
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
                    code: the_course[0] || "",
                    custom_id: completed_add_drop[i]?.custom_id || "",
                    surname: users?.surname || "",
                    first_name: users?.first_name || "",
                    other_names: users?.other_names || "",
                    phone_number: users?.phone_number || "",
                    gender: users?.gender || "",
                    passport_url: users?.passport_url || "",
                    matriculation_number: students?.matriculation_number || "",
                    email: students?.email || "",
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
                    code: the_course[0] || "",
                    custom_id: completed_add_drop[i]?.custom_id || "",
                    surname: users?.surname || "",
                    first_name: users?.first_name || "",
                    other_names: users?.other_names || "",
                    phone_number: users?.phone_number || "",
                    gender: users?.gender || "",
                    passport_url: users?.passport_url || "",
                    matriculation_number: students?.matriculation_number || "",
                    email: students?.email || "",
                  };
                  droppedListArray.push(dropped_list);
                }
              }
            }

            for (let i = 0; i < data4.response.length; i++) {
              for (
                let k = 0;
                k < JSON.parse(data4.response[i].courses).length;
                k++
              ) {
                if (
                  JSON.parse(data4.response[i].courses)[k] === searchParams.code
                ) {
                  console.log(
                    JSON.parse(data4.response[i].courses)[k],
                    data4.response[i].custom_id
                  );
                  const lecturer = data2.response.find(
                    (user) => user.custom_id === data4.response[i].custom_id
                  );
                  setLecturer(lecturer);
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
            if (!lecturer()) {
              setLecturerEmpty(true);
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

  const getOptPassport = (val) => {
    if (val) {
      var pass1 = val.substring(0, 49);
      var pass2 = val.substring(48);
      var passport = pass1 + "c_scale,w_500/f_auto" + pass2;
      return passport;
    } else {
      return "wait";
    }
  };

  const [resources] = createResource(fetchResources);

  return (
    <MetaProvider>
      <Title>Class List - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Class List on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={showModal()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                {viewName()}
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <div class="w-40 mx-auto">
                  <img src={viewPassport()} class="mx-auto w-full" />
                </div>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                  }}
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Show>
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Class List - {searchParams.code} ({searchParams.title}){" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Find below list of students registered during registration period,
              students who later added, and those who have dropped this course.
              If using a mobile device, you may have to scroll or tilt sideways.
            </p>
          </div>
          <div class="border space-y-4 border-gray-600 shadow-md rounded p-2 lg:p-4 overflow-x-auto">
            <Show
              when={
                JSON.parse(localStorage.getItem("jetsUser")).role === "admin" ||
                JSON.parse(localStorage.getItem("jetsUser")).role === "faculty"
              }
            >
              <div class="flex space-x-4">
                <A
                  href={
                    "/print-class-list/" +
                    params.periodId +
                    "?code=" +
                    searchParams.code +
                    "&title=" +
                    searchParams.title +
                    "&cat=list" +
                    "&hours=" +
                    searchParams.hours
                  }
                  target="blank"
                  class="my-4 !text-black flex space-x-2 orange-btn p-3 w-fit hover:opacity-60"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                    />
                  </svg>

                  <span class="mt-0.5 text-sm">Go to Print this List</span>
                </A>

                <A
                  href={
                    "/print-class-list/" +
                    params.periodId +
                    "?code=" +
                    searchParams.code +
                    "&title=" +
                    searchParams.title +
                    "&cat=sheet" +
                    "&hours=" +
                    searchParams.hours
                  }
                  target="blank"
                  class="my-4 !text-white flex space-x-2 blue-btn p-3 w-fit hover:opacity-60"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
                    />
                  </svg>

                  <span class="mt-0.5 text-sm">Go to Print Grade Sheet</span>
                </A>
              </div>
            </Show>
            <table
              cellPadding={0}
              cellSpacing={0}
              class="w-full my-4 border border-black"
            >
              <Show
                when={
                  JSON.parse(localStorage.getItem("jetsUser")).role ===
                    "student" ||
                  JSON.parse(localStorage.getItem("jetsUser")).role === "admin"
                }
              >
                <thead>
                  <tr class="bg-gray-400 border-b border-black text-blue-900">
                    <th class="p-1 text-left" colSpan={7}>
                      :: LECTURER
                    </th>
                  </tr>
                  <tr>
                    <td class="p-4 text-left" colSpan={7}>
                      <div class="flex space-x-2 lg:space-x-4">
                        <div class="w-20 sm:w-28">
                          {lecturer().passport_url ? (
                            <img
                              src={getOptPassport(lecturer().passport_url)}
                              class="mx-auto w-11/12"
                            />
                          ) : (
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/9131/9131529.png"
                              class="w-11/12 mx-auto"
                            />
                          )}
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 lg:py-8">
                          <Show
                            when={lecturerEmpty()}
                            fallback={
                              <>
                                <div>
                                  <b>Name:</b>
                                  <br />
                                  <span class="flex">
                                    {lecturer().title ? (
                                      <span class="mr-1">
                                        {lecturer().title}
                                      </span>
                                    ) : (
                                      ""
                                    )}
                                    <span class="uppercase">
                                      {lecturer().surname}
                                    </span>
                                    <span class="capitalize mx-1">
                                      {lecturer().first_name}
                                    </span>
                                    <span class="capitalize">
                                      {lecturer().other_names}
                                    </span>
                                  </span>
                                </div>
                                <div>
                                  <b>Email Address:</b>
                                  <br />
                                  {lecturer().username}
                                </div>
                              </>
                            }
                          >
                            <div class="pt-4">No lecturer assigned yet.</div>
                          </Show>
                        </div>
                      </div>
                    </td>
                  </tr>
                </thead>
              </Show>
              <thead class="bg-blue-950 text-white border-b border-black">
                <tr>
                  <td class="p-4 border-r border-black">#.</td>
                  <td class="p-4 border-r border-black">Name</td>
                  <td class="p-4 border-r border-black">Gender</td>
                  <td class="p-4 border-r border-black">Mat. Number</td>
                  <td class="p-4 border-r border-black">Email</td>
                  <td class="p-4 border-r border-black">Phone</td>
                  <td class="p-4">Passport</td>
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
                              <td colSpan={7} class="p-4 text-center">
                                <Loading />
                              </td>
                            </tr>
                          }
                        >
                          <tr class="border-b border-black">
                            <td colSpan={7} class="p-4 text-center">
                              No student has REGISTERED this course.
                            </td>
                          </tr>
                        </Show>
                      }
                    >
                      <For each={resources().registeredList}>
                        {(list, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black space-x-1">
                              <span class="uppercase font-semibold">
                                {list.surname}
                              </span>
                              <span class="capitalize">{list.first_name}</span>
                              <span class="capitalize">{list.other_names}</span>
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.gender}
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.matriculation_number}
                            </td>
                            <td class="p-4 border-r border-black">
                              <Show
                                when={list.email}
                                fallback={
                                  <span class="text-red-600 text-xs">
                                    *Contact ICT department
                                  </span>
                                }
                              >
                                {list.email.toLowerCase().replace(/\s/g, "")}
                              </Show>
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.phone_number}
                            </td>
                            <td class="p-4">
                              <span
                                onClick={() => {
                                  passportPop(
                                    list.passport_url,
                                    list.surname,
                                    list.first_name,
                                    list.other_names
                                  );
                                }}
                                class="green-btn p-3 cursor-pointer"
                              >
                                View
                              </span>
                            </td>
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
                              <td colSpan={7} class="p-4 text-center">
                                <Loading />
                              </td>
                            </tr>
                          }
                        >
                          <tr class="border-b border-black">
                            <td colSpan={7} class="p-4 text-center">
                              No student has ADDED this course during Add/Drop.
                            </td>
                          </tr>
                        </Show>
                      }
                    >
                      <For each={resources().addedList}>
                        {(list, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black space-x-1">
                              <span class="uppercase font-semibold">
                                {list.surname}
                              </span>
                              <span class="capitalize">{list.first_name}</span>
                              <span class="capitalize">{list.other_names}</span>
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.gender}
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.matriculation_number}
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.email.toLowerCase()}
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.phone_number}
                            </td>
                            <td class="p-4">
                              <span
                                onClick={() => {
                                  passportPop(
                                    list.passport_url,
                                    list.surname,
                                    list.first_name,
                                    list.other_names
                                  );
                                }}
                                class="green-btn p-3 cursor-pointer"
                              >
                                View
                              </span>
                            </td>
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
                              <td colSpan={7} class="p-4 text-center">
                                <Loading />
                              </td>
                            </tr>
                          }
                        >
                          <tr class="border-b border-black">
                            <td colSpan={7} class="p-4 text-center">
                              No student has DROPPED this course during
                              Add/Drop.
                            </td>
                          </tr>
                        </Show>
                      }
                    >
                      <For each={resources().droppedList}>
                        {(list, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black space-x-1">
                              <span class="uppercase font-semibold">
                                {list.surname}
                              </span>
                              <span class="capitalize">{list.first_name}</span>
                              <span class="capitalize">{list.other_names}</span>
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.gender}
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.matriculation_number}
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.email.toLowerCase()}
                            </td>
                            <td class="p-4 border-r border-black">
                              {list.phone_number}
                            </td>
                            <td class="p-4">
                              <span
                                onClick={() => {
                                  passportPop(
                                    list.passport_url,
                                    list.surname,
                                    list.first_name,
                                    list.other_names
                                  );
                                }}
                                class="green-btn p-3 cursor-pointer"
                              >
                                View
                              </span>
                            </td>
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
            </table>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
