import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Show, createSignal, createResource } from "solid-js";
import { createStore } from "solid-js/store";

import Header from "../components/Header";
import { Select } from "../components/Select";
import TextInput from "../components/TextInput";
import Success from "../components/icons/Success";

const schema = z.object({
  code: z.string().min(1, "*Required").toUpperCase(),
  year: z.string().min(1, "*Required"),
  title: z.string().min(1, "*Required"),
  hours: z.string().length(1, "*Required"),
  status: z.string().optional(),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const [initialCourses, setInitialCourses] = createStore([]);

const fetchCourses = async () => {
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
      fetch(VITE_API_URL + "/api/view-courses", {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("jetsUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      })
        .then((res1) => {
          return res1.json();
        })
        .then((data1) => {
          setInitialCourses(data1.response);
        })
        .catch((error) => {
          console.error(error);
        });

      return initialCourses;
    }
  } else {
    navigate("/", { replace: true });
  }
};

export default function ManageCourses() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showModal, setShowModal] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch(VITE_API_URL + "/api/create-course", {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("jetsUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          code: formData().code.toUpperCase(),
          year: formData().year,
          title: formData().title,
          hours: formData().hours,
          status: "available",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setMessage(result.response);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const update = async (code, status) => {
    setIsProcessing(true);

    try {
      const response = await fetch(VITE_API_URL + "/api/edit-course/" + code, {
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
          status: status !== "available" ? "available" : "unavailable",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        console.log(result);
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        setShowSuccess2(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [courses] = createResource(fetchCourses);

  return (
    <MetaProvider>
      <Title>Manage Courses - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Manage Courses on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showModal()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Input New Course
              </h2>
              <Show
                when={showSuccess()}
                fallback={
                  <div class="my-2 border-t border-b py-4 border-black">
                    <form
                      autocomplete="off"
                      onSubmit={submit}
                      class="space-y-4"
                    >
                      <div>
                        <TextInput
                          label="Course Title:"
                          name="title"
                          required={true}
                          type="text"
                          formHandler={formHandler}
                        />
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <TextInput
                            label="Credit Hours:"
                            name="hours"
                            required={true}
                            type="number"
                            formHandler={formHandler}
                          />
                        </div>

                        <div>
                          <TextInput
                            label="Course Code:"
                            name="code"
                            required={true}
                            type="text"
                            formHandler={formHandler}
                          />
                        </div>
                      </div>
                      <div>
                        <Select
                          label="Year:"
                          name="year"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "1",
                              label: "Year 1",
                            },
                            {
                              value: "2",
                              label: "Year 2",
                            },
                            {
                              value: "3",
                              label: "Year 3",
                            },
                            {
                              value: "4",
                              label: "Year 4",
                            },
                            {
                              value: "5",
                              label: "Year 5",
                            },
                            {
                              value: "6",
                              label: "Year 6",
                            },
                            {
                              value: "7",
                              label: "Year 7",
                            },
                          ]}
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
                  <Success />
                  <p>The specified course was inputed successfully!</p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href = "/admin/manage-courses")
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
        <Show when={showSuccess2()}>
          <div class="fixed z-50 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Status Changed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>
                  The status of the particular course was changed successfully!
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href = "/admin/manage-courses")
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Manage Courses
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Input and manage courses here.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <div>
              +
              <span
                onClick={() => setShowModal(true)}
                class="border-b border-red-600 font-semibold hover:opacity-60 cursor-pointer"
              >
                Input New Course
              </span>
            </div>

            <div class="overflow-x-auto">
              <table
                cellPadding={0}
                cellSpacing={0}
                class="w-full my-4 border border-black"
              >
                <thead class="bg-blue-950 text-white border-b border-black">
                  <tr>
                    <td class="p-4 border-r border-black">#.</td>
                    <td class="p-4 border-r border-black">Year</td>
                    <td class="p-4 border-r border-black">Code</td>
                    <td class="p-4 border-r border-black">Title</td>
                    <td class="p-4 border-r border-black">CH</td>
                    <td class="p-4 border-r border-black">Status</td>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={courses.loading}
                    fallback={
                      <Show when={courses()}>
                        <Show
                          when={courses().length > 0}
                          fallback={
                            <tr class="">
                              <td class="p-4 text-center" colSpan={6}>
                                No record found.
                              </td>
                            </tr>
                          }
                        >
                          <For each={courses()}>
                            {(course, i) => (
                              <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                                <td class="p-4 border-r border-black font-semibold">
                                  {i() + 1}.
                                </td>
                                <td class="p-4 border-r border-black">
                                  {course.year}
                                </td>
                                <td class="p-4 border-r border-black">
                                  {course.code}
                                </td>
                                <td class="p-4 border-r border-black">
                                  {course.title}
                                </td>
                                <td class="p-4 border-r border-black">
                                  {course.hours}
                                </td>
                                <td class="p-4 border-r border-black capitalize font-semibold">
                                  <b class="uppercase">
                                    {course.status === "available"
                                      ? "On Portal"
                                      : course.status}
                                  </b>
                                  <i class="inline-block">
                                    [
                                    <span
                                      onClick={() =>
                                        update(course.code, course.status)
                                      }
                                      class="text-red-600 hover:opacity-60 cursor-pointer"
                                    >
                                      Change Status
                                    </span>
                                    ]
                                  </i>
                                </td>
                              </tr>
                            )}
                          </For>
                        </Show>
                      </Show>
                    }
                  >
                    <tr class="">
                      <td class="p-4 text-center" colSpan={6}>
                        Fetching.. .
                      </td>
                    </tr>
                  </Show>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
