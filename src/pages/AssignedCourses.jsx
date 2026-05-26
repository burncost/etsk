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

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const schema = z.object({
  faculty: z.string().min(1, "*Required"),
});

export default function AssignCourses() {
  const params = useParams();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const [isProcessing, setIsProcessing] = createSignal(false);
  const [semester, setSemester] = createSignal("");
  const [session, setSession] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [code, setCode] = createSignal("");
  const [title, setTitle] = createSignal("");
  const [courses, setCourses] = createStore([]);
  const [displayFaculty, setDisplayFaculty] = createStore([]);
  const [showModal, setShowModal] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);

  const myCoursesArray = [];
  const fetchResources = async () => {
    const navigate = useNavigate();

    if (
      localStorage.getItem("jetsUser") &&
      JSON.parse(localStorage.getItem("jetsUser")).role === "faculty"
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
          VITE_API_URL +
            "/api/assigned-course/" +
            JSON.parse(localStorage.getItem("jetsUser")).custom_id +
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
        ).then((response) => response.json());
        const request2 = fetch(VITE_API_URL + "/api/view-courses", {
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
            for (
              let i = 0;
              i < JSON.parse(data1.response[0].courses).length;
              i++
            ) {
              var course_info = data2.response.filter(
                (course) =>
                  course.code == JSON.parse(data1.response[0].courses)[i]
              );

              var courses = {
                code: course_info[0].code,
                title: course_info[0].title,
                hours: course_info[0].hours,
              };
              myCoursesArray.push(courses);
            }
            setCourses(myCoursesArray);
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

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
  };

  const [resources] = createResource(fetchResources);

  return (
    <MetaProvider>
      <Title>Assigned Courses - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Assigned Courses on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Assigned Courses{" "}
            <Show when={session() !== "" && semester() !== ""}>
              <span class="block font-normal capitalize">
                {semester()} Semester - {session()} Session
              </span>
            </Show>
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Click on the button labelled 'Proceed' to view class list and
              upload learning resources.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4 overflow-x-auto">
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
                  <td class="p-4">Class List</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={resources.loading}
                  fallback={
                    <Show
                      when={resources().courses.length > 0}
                      fallback={
                        <tr>
                          <td colSpan={5} class="p-1 text-center">
                            No course(s) assigned yet for this semester.
                          </td>
                        </tr>
                      }
                    >
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
                            <td class="p-4">
                              <A
                                href={
                                  "/faculty/class-list/" +
                                  params.periodId +
                                  "/" +
                                  "?code=" +
                                  course.code +
                                  "&title=" +
                                  course.title +
                                  "&hours=" +
                                  course.hours
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
                    <td colSpan={5} class="p-1 text-center">
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
