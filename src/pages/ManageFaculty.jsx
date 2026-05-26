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
  title: z.string().min(1, "*Required"),
  surname: z.string().min(1, "*Required"),
  first_name: z.string().min(1, "*Required"),
  other_names: z.string().optional(),
  gender: z.string().min(1, { message: "*Required" }),
  phone_number: z.string().length(11, { message: "*Invalid" }),
});

export default function ManageFaculty() {
  const params = useParams();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [facultyMembers, setFacultyMembers] = createStore([]);
  const [showModal, setShowModal] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [success, setSuccess] = createSignal(false);

  const fetchFaculty = async () => {
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

        Promise.all([request1])
          .then(([data1]) => {
            var allFaculty = data1.response.filter(
              (faculty) => faculty.user_role == "faculty"
            );
            setFacultyMembers(allFaculty);
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return {
        facultyMembers,
      };
    } else {
      navigate("/", { replace: true });
    }
  };

  const changeStatus = async (id, status) => {
    setIsProcessing(true);
    try {
      const res = await fetch(VITE_API_URL + "/api/edit-user/" + id, {
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
          status: status === "active" ? "inactive" : "active",
        }),
      });
      const result = await res.json();
      setSuccess(true);
      setIsProcessing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    var email =
      formData().first_name + "." + formData().surname + "@jets.edu.ng";
    email = email.toLowerCase().replace(/\s/g, "");
    try {
      //Call API here:
      const response = await fetch(VITE_API_URL + "/auth/register", {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          title: formData().title,
          surname: formData().surname.toUpperCase(),
          first_name: formData().first_name,
          other_names: formData().other_names,
          gender: formData().gender,
          username: email,
          phone_number: formData().phone_number,
          user_role: "faculty",
          status: "active",
          mode_of_study: "N.A",
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setMessage(result.response);
        setIsProcessing(false);
      } else {
        setShowSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [faculty] = createResource(fetchFaculty);

  return (
    <MetaProvider>
      <Title>Manage Faculty - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Manage Faculty on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={showModal()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Create Faculty Account
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
                          label="Title:"
                          name="title"
                          required={true}
                          type="text"
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <TextInput
                          label="Surname:"
                          name="surname"
                          required={true}
                          type="text"
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <TextInput
                          label="First Name:"
                          name="first_name"
                          required={true}
                          type="text"
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <TextInput
                          label="Other names:"
                          name="other_names"
                          required={false}
                          type="text"
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <Select
                          label="Gender:"
                          name="gender"
                          placeholder="Select"
                          required={true}
                          options={[
                            { value: "Female", label: "Female" },
                            { value: "Male", label: "Male" },
                          ]}
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <TextInput
                          label="Phone Number:"
                          name="phone_number"
                          required={true}
                          type="text"
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
                  <p>Faculty account was created successfully!</p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href = "/admin/manage-faculty")
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
        <Show when={success()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Status Changed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black text-center">
                <Success />
                <p>Status changed successfully!</p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href = "/admin/manage-faculty")
                  }
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </div>
            </div>
          </div>
        </Show>
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Manage Faculty
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Create and manage faculty portal accounts.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4 overflow-x-auto">
            <div>
              +
              <span
                onClick={() => setShowModal(true)}
                class="border-b border-red-600 font-semibold hover:opacity-60 cursor-pointer"
              >
                Create Faculty Account
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
                  <td class="p-4 border-r border-black">Name</td>
                  <td class="p-4 border-r border-black">Email</td>
                  <td class="p-4 border-r border-black">Phone</td>
                  <td class="p-4 border-r border-black">Status</td>
                  <td class="p-4">Change Status</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={faculty.loading}
                  fallback={
                    <Show when={faculty().facultyMembers.length > 0}>
                      <For each={faculty().facultyMembers}>
                        {(facultyMember, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black space-x-1">
                              <span>{facultyMember.title}</span>
                              <span class="uppercase font-semibold">
                                {facultyMember.surname}
                              </span>
                              <span class="capitalize">
                                {facultyMember.first_name}
                              </span>
                              <span class="capitalize">
                                {facultyMember.other_names}
                              </span>
                            </td>
                            <td class="p-4 border-r border-black lowercase">
                              {facultyMember.username}
                            </td>
                            <td class="p-4 border-r border-black uppercase">
                              {facultyMember.phone_number}
                            </td>
                            <td class="p-4 border-r border-black">
                              <A
                                href="#"
                                // href={
                                //   "/admin/manage-rooms/" +
                                //   hostel.id +
                                //   "/" +
                                //   hostel.hostel_name +
                                //   "/" +
                                //   hostel.status
                                // }
                                class="green-btn p-3 border border-black text-center hover:opacity-60"
                              >
                                Edit
                              </A>
                            </td>
                            <td class="p-4">
                              <b class="uppercase">{facultyMember.status}</b>
                              &nbsp; [
                              <span
                                onClick={() =>
                                  changeStatus(
                                    facultyMember.custom_id,
                                    facultyMember.status
                                  )
                                }
                                class="text-red-600 hover:opacity-60 cursor-pointer"
                              >
                                Change Status
                              </span>
                              ]
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
