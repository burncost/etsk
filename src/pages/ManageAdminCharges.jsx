import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Show, createSignal, createResource, Switch, Match } from "solid-js";
import { createStore } from "solid-js/store";

import Header from "../components/Header";
import { Select } from "../components/Select";
import TextInput from "../components/TextInput";
import Success from "../components/icons/Success";
import Loading from "../components/Loading";

const schema = z.object({
  undergraduate_postgraduate: z.string().min(1, "*Required"),
  new_returning: z.string().min(1, "*Required"),
  item: z.string().min(1, "*Required"),
  amount: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const [UGDepartmental, setUGDepartmental] = createStore([]);
const [UGNewStudent, setUGNewStudent] = createStore([]);
const [UGReturningStudent, setUGReturningStudent] = createStore([]);
const [PGDepartmental, setPGDepartmental] = createStore([]);
const [PGNewStudent, setPGNewStudent] = createStore([]);
const [PGReturningStudent, setPGReturningStudent] = createStore([]);
const [showWhat, setShowWhat] = createSignal("");

const fetchCharges = async () => {
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
      fetch(VITE_API_URL + "/api/view-charges", {
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
          var objUG = JSON.parse(data1.response[0].departmental);
          var resultUG = Object.keys(objUG).map((key) => [key, objUG[key]]);
          setUGDepartmental(resultUG);

          var objPG = JSON.parse(data1.response[1].departmental);
          var resultPG = Object.keys(objPG).map((key) => [key, objPG[key]]);
          setPGDepartmental(resultPG);

          var objUGNewStudent = JSON.parse(data1.response[0].new_student);
          var resultUGNewStudent = Object.keys(objUGNewStudent).map((key) => [
            key,
            objUGNewStudent[key],
          ]);
          setUGNewStudent(resultUGNewStudent);

          var objPGNewStudent = JSON.parse(data1.response[1].new_student);
          var resultPGNewStudent = Object.keys(objPGNewStudent).map((key) => [
            key,
            objPGNewStudent[key],
          ]);
          setPGNewStudent(resultPGNewStudent);

          var objUGReturningStudent = JSON.parse(
            data1.response[0].returning_student
          );
          var resultUGReturningStudent = Object.keys(objUGReturningStudent).map(
            (key) => [key, objUGReturningStudent[key]]
          );
          setUGReturningStudent(resultUGReturningStudent);

          var objPGReturningStudent = JSON.parse(
            data1.response[1].returning_student
          );
          var resultPGReturningStudent = Object.keys(objPGReturningStudent).map(
            (key) => [key, objPGReturningStudent[key]]
          );
          setPGReturningStudent(resultPGReturningStudent);
        })
        .catch((error) => {
          console.error(error);
        });

      return {
        UGDepartmental,
        UGNewStudent,
        UGReturningStudent,
        PGDepartmental,
        PGNewStudent,
        PGReturningStudent,
      };
    }
  } else {
    navigate("/", { replace: true });
  }
};

export default function ManageAdminCharges() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showModal, setShowModal] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const [charges] = createResource(fetchCharges);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <MetaProvider>
      <Title>
        Manage Admin Charges - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Manage Admin Charges on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showModal()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Input New Charge
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
                        <Select
                          label="Undergraduate or Postgraduate:"
                          name="undergraduate_postgraduate"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "undergraduate",
                              label: "Undergraduate",
                            },
                            {
                              value: "postgraduate",
                              label: "Postgraduate",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <Select
                          label="New or Returning Students:"
                          name="new_returning"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "new",
                              label: "New Student",
                            },
                            {
                              value: "returning",
                              label: "Returning Student",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <Select
                          label="Item:"
                          name="item"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              label: "Adminsitrative Services",
                              value: "admin",
                            },
                            {
                              label: "New Student Matriculation",
                              value: "matric",
                            },
                            {
                              label: "Examination/Stationery",
                              value: "exam",
                            },
                            {
                              label: "Library Use and Services",
                              value: "library",
                            },
                            {
                              label: "ICT Dev & Internet Access",
                              value: "ict",
                            },
                            {
                              label: "ECWA Education Dept Levy",
                              value: "ecwa",
                            },
                            {
                              label: "Campus Dev. Levy",
                              value: "campus",
                            },
                            {
                              label: "Seminary Student/Library ID Card",
                              value: "card",
                            },
                            {
                              label: "ACTEA Accreditation",
                              value: "actea",
                            },
                            {
                              label: "Health Insurance",
                              value: "insurance",
                            },
                            {
                              label: "SUG Charges",
                              value: "sug",
                            },
                            {
                              label: "Late Registration",
                              value: "late",
                            },
                            {
                              label: "Academic Catalogue",
                              value: "catalogue",
                            },
                          ]}
                          formHandler={formHandler}
                        />
                      </div>
                      <div>
                        <TextInput
                          label="Amount:"
                          name="amount"
                          required={true}
                          type="number"
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
                  <p>The specified fee was inputed successfully!</p>
                </div>
                <div class="text-right space-x-3">
                  <button
                    onClick={() =>
                      (window.location.href = "/admin/manage-admin-charges")
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
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
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
        <div class="my-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Manage Charges
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Input and manage admin charges here.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <div class="overflow-x-auto space-y-6">
              <Show
                when={charges.loading}
                fallback={
                  <>
                    <table
                      cellPadding={0}
                      cellSpacing={0}
                      class="w-full my-4 border border-black"
                    >
                      <thead class="bg-blue-950 text-white border-b border-black">
                        <tr>
                          <td
                            colSpan={3}
                            class="p-4 border-r border-black text-center"
                          >
                            Departmental Charges: BA/Diploma
                          </td>
                        </tr>
                      </thead>
                      <thead class="text-left">
                        <tr class="border-b border-black">
                          <th class="w-fit p-4 border-r border-black">#.</th>
                          <th class="p-4 border-r border-black">Department</th>
                          <th class="p-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={charges().UGDepartmental}>
                          {(ugCharge, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black">
                                {ugCharge[0]}
                              </td>
                              <td class="p-4">
                                {formatter.format(ugCharge[1])} [
                                <b class="text-red-600 hover:opacity-60 cursor-pointer">
                                  Edit
                                </b>
                                ]
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                    <table
                      cellPadding={0}
                      cellSpacing={0}
                      class="w-full my-4 border border-black"
                    >
                      <thead class="bg-blue-950 text-white border-b border-black">
                        <tr>
                          <td
                            colSpan={3}
                            class="p-4 border-r border-black text-center"
                          >
                            Departmental Charges: Masters/MDiv
                          </td>
                        </tr>
                      </thead>
                      <thead class="text-left">
                        <tr class="border-b border-black">
                          <th class="w-fit p-4 border-r border-black">#.</th>
                          <th class="p-4 border-r border-black">Department</th>
                          <th class="p-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={charges().PGDepartmental}>
                          {(pgCharge, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black">
                                {pgCharge[0]}
                              </td>
                              <td class="p-4">
                                {formatter.format(pgCharge[1])} [
                                <b class="text-red-600 hover:opacity-60 cursor-pointer">
                                  Edit
                                </b>
                                ]
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>

                    <table
                      cellPadding={0}
                      cellSpacing={0}
                      class="w-full my-4 border border-black"
                    >
                      <thead class="bg-blue-950 text-white border-b border-black">
                        <tr>
                          <td
                            colSpan={3}
                            class="p-4 border-r border-black text-center"
                          >
                            New Students Seminary Charges - Undergraduate
                          </td>
                        </tr>
                      </thead>
                      <thead class="text-left">
                        <tr class="border-b border-black">
                          <th class="w-fit p-4 border-r border-black">#.</th>
                          <th class="p-4 border-r border-black">Item</th>
                          <th class="p-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={charges().UGNewStudent}>
                          {(charge, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black">
                                {charge[0]}
                              </td>
                              <td class="p-4">
                                {formatter.format(charge[1])} [
                                <b class="text-red-600 hover:opacity-60 cursor-pointer">
                                  Edit
                                </b>
                                ]
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                    <table
                      cellPadding={0}
                      cellSpacing={0}
                      class="w-full my-4 border border-black"
                    >
                      <thead class="bg-blue-950 text-white border-b border-black">
                        <tr>
                          <td
                            colSpan={3}
                            class="p-4 border-r border-black text-center"
                          >
                            New Students Seminary Charges - Postgraduate
                          </td>
                        </tr>
                      </thead>
                      <thead class="text-left">
                        <tr class="border-b border-black">
                          <th class="w-fit p-4 border-r border-black">#.</th>
                          <th class="p-4 border-r border-black">Item</th>
                          <th class="p-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={charges().PGNewStudent}>
                          {(charge, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black">
                                {charge[0]}
                              </td>
                              <td class="p-4">
                                {formatter.format(charge[1])} [
                                <b class="text-red-600 hover:opacity-60 cursor-pointer">
                                  Edit
                                </b>
                                ]
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>

                    <table
                      cellPadding={0}
                      cellSpacing={0}
                      class="w-full my-4 border border-black"
                    >
                      <thead class="bg-blue-950 text-white border-b border-black">
                        <tr>
                          <td
                            colSpan={3}
                            class="p-4 border-r border-black text-center"
                          >
                            Returning Students Seminary Charges - Undergraduate
                          </td>
                        </tr>
                      </thead>
                      <thead class="text-left">
                        <tr class="border-b border-black">
                          <th class="w-fit p-4 border-r border-black">#.</th>
                          <th class="p-4 border-r border-black">Item</th>
                          <th class="p-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={charges().UGReturningStudent}>
                          {(charge, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black">
                                {charge[0]}
                              </td>
                              <td class="p-4">
                                {formatter.format(charge[1])} [
                                <b class="text-red-600 hover:opacity-60 cursor-pointer">
                                  Edit
                                </b>
                                ]
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                    <table
                      cellPadding={0}
                      cellSpacing={0}
                      class="w-full my-4 border border-black"
                    >
                      <thead class="bg-blue-950 text-white border-b border-black">
                        <tr>
                          <td
                            colSpan={3}
                            class="p-4 border-r border-black text-center"
                          >
                            Returning Students Seminary Charges - Postgraduate
                          </td>
                        </tr>
                      </thead>
                      <thead class="text-left">
                        <tr class="border-b border-black">
                          <th class="w-fit p-4 border-r border-black">#.</th>
                          <th class="p-4 border-r border-black">Item</th>
                          <th class="p-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={charges().PGReturningStudent}>
                          {(charge, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black">
                                {charge[0]}
                              </td>
                              <td class="p-4">
                                {formatter.format(charge[1])} [
                                <b class="text-red-600 hover:opacity-60 cursor-pointer">
                                  Edit
                                </b>
                                ]
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </>
                }
              >
                <Loading />
              </Show>
            </div>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
