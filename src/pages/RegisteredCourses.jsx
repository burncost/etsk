import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate, useParams } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function RegisteredCourses() {
  const params = useParams();

  var myCoursesArr = [];
  const fetchRegisteredCourses = async () => {
    const navigate = useNavigate();
    const now = new Date();

    if (
      localStorage.getItem("jetsUser") &&
      now.getTime() > JSON.parse(localStorage.getItem("jetsUser")).expiry
    ) {
      localStorage.removeItem("jetsUser");
      navigate("/");
    }

    if (localStorage.getItem("jetsUser")) {
      try {
        const res = await fetch(
          VITE_API_URL +
            "/api/registration/" +
            params.customId +
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
        const result = await res.json();
        for (
          let i = 0;
          i < JSON.parse(result.response.picked_courses).length;
          i++
        ) {
          if (
            JSON.parse(result.response.dropped_courses) &&
            JSON.parse(result.response.dropped_courses).includes(
              JSON.parse(result.response.picked_courses)[i]
            )
          ) {
            var courseDetail = getCourseDetails(
              JSON.parse(result.response.picked_courses)[i],
              "dropped"
            );
          } else {
            var courseDetail = getCourseDetails(
              JSON.parse(result.response.picked_courses)[i],
              "not-dropped"
            );
          }
          myCoursesArr.push(await courseDetail);
        }
      } catch (error) {
        console.error(error);
      }
      return myCoursesArr;
    } else {
      navigate("/", { replace: true });
    }
  };

  const getCourseDetails = async (code, status) => {
    try {
      const res = await fetch(VITE_API_URL + "/api/course/" + code, {
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

      if (result.response.hours === "P/F") {
        var course_hrs = 1;
      } else {
        var course_hrs = result.response.hours;
      }

      var myCourses = {
        code: code,
        hours: course_hrs,
        title: result.response.title,
        status: status,
      };

      return myCourses;
    } catch (error) {
      console.error(error);
    }
  };

  const [courses] = createResource(fetchRegisteredCourses);

  return (
    <MetaProvider>
      <Title>
        My Registered Courses - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="My Registered Courses on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            My Registered Courses
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Below are the courses you have registered for the chosen semester.
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
                  <td class="p-4 border-r border-black">Hrs</td>
                  <td class="p-4">Class List</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={courses.loading}
                  fallback={
                    <Show
                      when={courses().length > 0}
                      fallback={
                        <tr>
                          <td colSpan={5} class="p-4 text-center">
                            No record found.
                          </td>
                        </tr>
                      }
                    >
                      <For each={courses()}>
                        {(course, i) => (
                          <tr
                            class={
                              course.status === "dropped"
                                ? "line-through even:bg-gray-200 odd:bg-white even:border-y border-black"
                                : " even:bg-gray-200 odd:bg-white even:border-y border-black"
                            }
                          >
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
                              <Show
                                when={course.status === "dropped"}
                                fallback={
                                  <A
                                    href={
                                      "/student/class-list/" +
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
                                }
                              >
                                <span class="gray-btn p-3 border border-black text-center cursor-not-allowed">
                                  Dropped
                                </span>
                              </Show>
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
