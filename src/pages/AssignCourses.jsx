import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";

import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { Select } from "../components/Select";
import TextInput from "../components/TextInput";
import Success from "../components/icons/Success";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";
import { createStore } from "solid-js/store";
import Failure from "../components/icons/Failure";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const schema = z.object({
  faculty_id: z.string().min(1, "*Required"),
  course_code: z.string().min(1, "*Required"),
});

export default function AssignCourses() {
  const params = useParams();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const [isProcessing, setIsProcessing] = createSignal(false);
  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [courses, setCourses] = createStore([]);
  const [displayFaculty, setDisplayFaculty] = createStore([]);
  const [displayCourses, setDisplayCourses] = createStore([]);
  const [showModal, setShowModal] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const [duplicateAssignment, setDuplicateAssignment] = createSignal(false);

  const navigate = useNavigate();

  const facultyArray = [];
  const AssignedCoursesArray = [];
  const coursesArray = [];
  const fetchResources = async () => {
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
        const request1 = fetch(VITE_API_URL + "/api/view-courses", {
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
        const request3 = fetch(
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

        Promise.all([request1, request2, request3])
          .then(([data1, data2, data3]) => {
            for (let i = 0; i < data1.response.length; i++) {
              var courses = {
                value: data1.response[i].code,
                label: data1.response[i].title + " - " + data1.response[i].code,
              };
              coursesArray.push(courses);
            }
            setDisplayCourses(coursesArray);

            var allFaculty = data2.response.filter(
              (faculty) =>
                faculty.user_role == "faculty" && faculty.status == "active"
            );
            for (let i = 0; i < allFaculty.length; i++) {
              var fac = {
                value: allFaculty[i].custom_id,
                label:
                  allFaculty[i].surname +
                  " " +
                  allFaculty[i].first_name +
                  " " +
                  allFaculty[i].other_names +
                  " (" +
                  allFaculty[i].title +
                  ")",
              };
              facultyArray.push(fac);
            }
            setDisplayFaculty(facultyArray);

            for (let i = 0; i < data3.response.length; i++) {
              for (
                let k = 0;
                k < JSON.parse(data3.response[i].courses).length;
                k++
              ) {
                var course_info = data1.response.filter(
                  (course) =>
                    course.code == JSON.parse(data3.response[i].courses)[k]
                );
                var faculty_info = allFaculty.filter(
                  (fac) => fac.custom_id == data3.response[i].custom_id
                );
                console.log(faculty_info[0]);
                console.log(data3.response[i].custom_id);
                console.log(data3.response[i]);
                var assigned_courses = {
                  code: course_info[0].code,
                  title: course_info[0].title,
                  hours: course_info[0].hours,
                  faculty_id: faculty_info[0].custom_id,
                  faculty_title: faculty_info[0].title,
                  faculty_surname: faculty_info[0].surname,
                  faculty_first_name: faculty_info[0].first_name,
                  faculty_other_names: faculty_info[0].other_names,
                  faculty_email: faculty_info[0].username,
                };
                AssignedCoursesArray.push(assigned_courses);
              }
            }
            setCourses(AssignedCoursesArray);
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        courses,
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

  const unassign = async (code, id) => {
    isProcessing(true);
    const response = await fetch(
      VITE_API_URL +
        "/api/assigned-course/" +
        id +
        "?period_id=" +
        params.periodId,
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

    var courses = JSON.parse(result.response[0].courses);
    const index = courses.indexOf(code);
    const removed = courses.splice(index, 1);

    try {
      const res = await fetch(
        VITE_API_URL + "/api/edit-assigned-course/" + id,
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
            courses: JSON.stringify(courses),
            custom_id: formData().faculty_id,
            period_id: params.periodId,
          }),
        }
      );
      const result = await res.json();
      setSuccess(true);
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const arr = [];
  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    //check if already assigned
    const response = await fetch(
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
    );
    const result = await response.json();
    var theFaculty = result.response.filter(
      (faculty) => faculty.custom_id == formData().faculty_id
    );
    if (result.response.length > 0) {
      for (let i = 0; i < result.response.length; i++) {
        for (
          let j = 0;
          j < JSON.parse(result.response[i].courses).length;
          j++
        ) {
          if (
            JSON.parse(result.response[i].courses)[j] === formData().course_code
          ) {
            setDuplicateAssignment(true);
            return;
          }
        }
      }
      if (theFaculty.length > 0) {
        for (let j = 0; j < JSON.parse(theFaculty[0].courses).length; j++) {
          arr.push(JSON.parse(theFaculty[0].courses)[j]);
        }
        arr.push(formData().course_code);
        var patch_post = "PATCH";
        var which_url =
          "edit-assigned-course/" +
          formData().faculty_id +
          "?period_id=" +
          params.periodId;
      } else {
        arr.push(formData().course_code);
        var patch_post = "POST";
        var which_url = "create-assigned-course";
      }
    } else {
      arr.push(formData().course_code);
      var patch_post = "POST";
      var which_url = "create-assigned-course";
    }
    console.log(patch_post, arr);
    try {
      const res = await fetch(VITE_API_URL + "/api/" + which_url, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("jetsUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: patch_post,
        body: JSON.stringify({
          courses: JSON.stringify(arr),
          custom_id: formData().faculty_id,
          period_id: params.periodId,
        }),
      });
      const result = await res.json();
      setShowSuccess(true);
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const [resources] = createResource(fetchResources);

  return (
    <MetaProvider>
      <Title>Assign Courses - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Assign Courses on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={success()}>
          <div class="z-50 fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Unassigned
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>The course was unassigned successfully!</p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href =
                      "/admin/assign-courses/" + params.periodId)
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Show when={showModal()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Assign Course to Lecturer{console.log(displayCourses)}
              </h2>
              <Show
                when={showSuccess()}
                fallback={
                  <Show
                    when={duplicateAssignment()}
                    fallback={
                      <div class="my-2 border-t border-b py-4 border-black">
                        <form
                          autocomplete="off"
                          onSubmit={submit}
                          class="space-y-4"
                        >
                          <div>
                            <Select
                              label="Course:"
                              name="course_code"
                              placeholder="Select"
                              required={true}
                              options={displayCourses}
                              formHandler={formHandler}
                            />
                          </div>
                          <div>
                            <Select
                              label="Faculty:"
                              name="faculty_id"
                              placeholder="Select"
                              required={true}
                              options={displayFaculty}
                              formHandler={formHandler}
                            />
                          </div>
                          <Show when={message() !== ""}>
                            <div class="bg-purple-200 text-purple-900 p-3 text-center animate-pulse border-l-2 border-black">
                              {message()}
                            </div>
                          </Show>
                          <div class="text-right space-x-3">
                            <Show
                              when={formHandler.isFormInvalid()}
                              fallback={
                                <>
                                  <Show
                                    when={isProcessing()}
                                    fallback={
                                      <button
                                        type="submit"
                                        class="red-btn p-3 hover:opacity-60"
                                      >
                                        Submit
                                      </button>
                                    }
                                  >
                                    <button
                                      disabled
                                      class="gray-btn cursor-wait p-3"
                                    >
                                      Processing.. .
                                    </button>
                                  </Show>
                                </>
                              }
                            >
                              <button
                                disabled
                                class="gray2-btn p-3 cursor-not-allowed"
                              >
                                Submit
                              </button>
                            </Show>
                            <button
                              onClick={() => setShowModal(false)}
                              class="gray-btn text-white p-3 hover:opacity-60"
                            >
                              Close
                            </button>
                          </div>
                        </form>
                      </div>
                    }
                  >
                    <div class="my-2 border-t border-b py-4 border-black text-center">
                      <Failure />
                      <p>Unable to assign course. Duplicate assignment!</p>
                    </div>
                    <div class="text-right space-x-3">
                      <button
                        onClick={() =>
                          (window.location.href =
                            "/admin/assign-courses/" + params.periodId)
                        }
                        class="blue-btn text-white p-3 hover:opacity-60"
                      >
                        Ok. Continue
                      </button>
                    </div>
                  </Show>
                }
              >
                <div class="my-2 border-t border-b py-4 border-black text-center">
                  <Success />
                  <p>The course was assigned successfully!</p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href =
                        "/admin/assign-courses/" + params.periodId)
                    }
                    class="blue-btn text-white p-3 hover:opacity-60"
                  >
                    Ok. Continue
                  </button>
                </div>
              </Show>
            </div>
          </div>
        </Show>
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Assign Courses{" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Click on the button labelled 'Asign' to assign the corresponding
              course to a lecturer.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <div>
              +
              <span
                onClick={() => setShowModal(true)}
                class="border-b border-red-600 font-semibold hover:opacity-60 cursor-pointer"
              >
                Assign Course
              </span>
            </div>
            <table
              cellPadding={0}
              cellSpacing={0}
              class="w-full my-4 border border-black"
            >
              <thead class="bg-blue-950 text-white border-b border-black">
                <tr>
                  <td class="p-4 border-r border-black">#.</td>
                  <td class="p-4 border-r border-black">Code</td>
                  <td class="p-4 border-r border-black">Title</td>
                  <td class="p-4 border-r border-black">CH</td>
                  <td class="p-4 border-r border-black">Assigned To</td>
                  <td class="p-4">Action</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={resources.loading}
                  fallback={
                    <Show when={resources().courses.length > 0}>
                      <For each={resources().courses}>
                        {(course, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black uppercase">
                              {course.code}
                            </td>
                            <td class="p-4 border-r border-black">
                              {course.title}
                            </td>
                            <td class="p-4 border-r border-black">
                              {course.hours}
                            </td>
                            <td class="p-4 border-r border-black space-x-1">
                              <span>{course.faculty_title}</span>
                              <span class="uppercase font-semibold">
                                {course.faculty_surname}
                              </span>
                              <span>{course.faculty_first_name}</span>
                              <span>{course.faculty_other_names}</span>
                            </td>
                            <td class="p-4 flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-1">
                              <button
                                onClick={() =>
                                  unassign(course.code, course.faculty_id)
                                }
                                class="red-btn p-3 border border-black text-center hover:opacity-60"
                              >
                                Unassign
                              </button>
                              <A
                                href={
                                  "/admin/class-list/" +
                                  params.periodId +
                                  "?code=" +
                                  course.code +
                                  "&title=" +
                                  course.title
                                }
                                class="green-btn p-3 border border-black text-center hover:opacity-60"
                              >
                                Class List
                              </A>
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
      </div>
    </MetaProvider>
  );
}
