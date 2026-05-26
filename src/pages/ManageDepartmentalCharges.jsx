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

const schema = z.object({
  undergraduate_postgraduate: z.string().min(1, "*Required"),
  department: z.string().min(1, "*Required"),
  amount: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const [uGDepartmental, setUGDepartmental] = createStore([]);
const [pGDepartmental, setPGDepartmental] = createStore([]);
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
          if (
            data1.response[0].departmental &&
            data1.response[0].departmental !== "undefined"
          ) {
            setUGDepartmental(JSON.parse(data1.response[0].departmental));
          }
          if (
            data1.response[1].departmental &&
            data1.response[1].departmental !== "undefined"
          ) {
            setPGDepartmental(JSON.parse(data1.response[1].departmental));
          }
        })
        .catch((error) => {
          console.error(error);
        });

      return {
        uGDepartmental,
        pGDepartmental,
      };
    }
  } else {
    navigate("/", { replace: true });
  }
};

export default function ManageDepartmentalCharges() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [showModal, setShowModal] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [showSuccess2, setShowSuccess2] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const ugdepartmentalObj = {};
  const pgdepartmentalObj = {};
  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    if (formData().undergraduate_postgraduate === "undergraduate") {
      if (Object.keys(uGDepartmental).length > 0) {
        for (let key in uGDepartmental) {
          ugdepartmentalObj[key] = uGDepartmental[key];
        }
        ugdepartmentalObj[formData().department] = formData().amount;

        var theData = JSON.stringify({
          departmental: ugdepartmentalObj,
        });
      } else {
        ugdepartmentalObj[formData().department] = formData().amount;
        var theData = JSON.stringify({
          departmental: ugdepartmentalObj,
        });
      }
    }

    if (formData().undergraduate_postgraduate === "postgraduate") {
      console.log(Object.keys(pGDepartmental).length);
      if (Object.keys(pGDepartmental).length > 0) {
        for (let key in pGDepartmental) {
          pgdepartmentalObj[key] = pGDepartmental[key];
        }
        pgdepartmentalObj[formData().department] = formData().amount;

        var theData = JSON.stringify({
          departmental: pgdepartmentalObj,
        });
      } else {
        pgdepartmentalObj[formData().department] = formData().amount;
        var theData = JSON.stringify({
          departmental: pgdepartmentalObj,
        });
      }
    }

    try {
      const response = await fetch(
        VITE_API_URL +
          "/api/edit-charge/" +
          formData().undergraduate_postgraduate,
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
          body: theData,
        }
      );

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

  const [charges] = createResource(fetchCharges);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <MetaProvider>
      <Title>
        Manage Departmental Charges - ECWA Theological Seminary, KAGORO (ETSK)
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
                          label="Department:"
                          name="department"
                          placeholder="Select"
                          required={true}
                          options={[
                            {
                              value: "Pastoral Studies",
                              label: "Department of Pastoral Studies",
                            },
                            {
                              value: "Missions and Intercultural Studies",
                              label:
                                "Department of Missions and Intercultural Studies",
                            },
                            {
                              value: "Youth Ministry",
                              label: "Department of Youth Ministry",
                            },
                            {
                              value: "Leadership and Administration",
                              label:
                                "Department of Leadership and Administration",
                            },
                            {
                              value: "Peace and Conflict Studies",
                              label: "Department of Peace and Conflict Studies",
                            },
                            {
                              value: "Community Development",
                              label: "Department of Community Development",
                            },
                            {
                              value: "Christian Education",
                              label: "Department of Christian Education",
                            },
                            {
                              value: "Biblical Counselling and Psychology",
                              label:
                                "Department of Biblical Counselling and Psychology",
                            },
                            {
                              value: "Old Testament",
                              label: "Department of Old Testament",
                            },
                            {
                              value: "New Testament",
                              label: "Department of New Testament",
                            },
                            {
                              value: "Systematic Theology",
                              label: "Department of Systematic Theology",
                            },
                            {
                              value: "Church History and Historical Theology",
                              label:
                                "Department of Church History and Historical Theology",
                            },
                            {
                              value: "Christian Ethics and Public Theology",
                              label:
                                "Department of Christian Ethics and Public Theology",
                            },
                            {
                              value: "Christian Apologetics",
                              label: "Department of Christian Apologetics",
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
                      (window.location.href =
                        "/admin/manage-departmental-charges")
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
        <div class="mt-8 w-11/12 mx-auto space-y-4">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Manage Departmental Charges
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>Input and manage departmental charges here.</p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <Show
              when={charges.loading}
              fallback={
                <div>
                  <span>
                    +
                    <span
                      onClick={() => setShowModal(true)}
                      class="border-b border-red-600 font-semibold hover:opacity-60 cursor-pointer"
                    >
                      Input New Charge
                    </span>
                  </span>
                  <div class="mt-3 flex space-x-4">
                    <span
                      onClick={() => setShowWhat("ug")}
                      class="blue-btn p-3 cursor-pointer hover:opacity-60"
                    >
                      Undergraduate
                    </span>
                    <span
                      onClick={() => setShowWhat("pg")}
                      class="blue-btn p-3 cursor-pointer hover:opacity-60"
                    >
                      Postgraduate
                    </span>
                  </div>
                </div>
              }
            >
              Wait.. .
            </Show>

            <div class="overflow-x-auto">
              <table
                cellPadding={0}
                cellSpacing={0}
                class="w-full my-4 border border-black"
              >
                <thead class="bg-blue-950 text-white border-b border-black">
                  <tr>
                    <td class="p-4 border-r border-black">#.</td>
                    <td class="p-4 border-r border-black">Item</td>
                    <td class="p-4 border-r border-black">Amount</td>
                    <td class="p-4">Update</td>
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={charges.loading}
                    fallback={
                      <Switch>
                        <Match when={showWhat() === "ug"}>
                          <>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                1.
                              </td>
                              <td class="p-4 border-r border-black">
                                Pastoral Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental["Pastoral Studies"]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental[
                                        "Pastoral Studies"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                2.
                              </td>
                              <td class="p-4 border-r border-black">
                                Missions and Intercultural Studies Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental[
                                      "Missions and Intercultural Studies"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental[
                                        "Missions and Intercultural Studies"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                3.
                              </td>
                              <td class="p-4 border-r border-black">
                                Department of Youth Ministry Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental["Youth Ministry"]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental["Youth Ministry"]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                4.
                              </td>
                              <td class="p-4 border-r border-black">
                                Leadership and Administration Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental[
                                      "Leadership and Administration"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental[
                                        "Leadership and Administration"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                5.
                              </td>
                              <td class="p-4 border-r border-black">
                                Peace and Conflict Studies Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental[
                                      "Peace and Conflict Studies"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental[
                                        "Peace and Conflict Studies"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                6.
                              </td>
                              <td class="p-4 border-r border-black">
                                Community Development Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental[
                                      "Community Development"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental[
                                        "Community Development"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                7.
                              </td>
                              <td class="p-4 border-r border-black">
                                Christian Education Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental[
                                      "Christian Education"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental[
                                        "Christian Education"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                8.
                              </td>
                              <td class="p-4 border-r border-black">
                                Biblical Counselling and Psychology Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().uGDepartmental[
                                      "Biblical Counselling and Psychology"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().uGDepartmental[
                                        "Biblical Counselling and Psychology"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                          </>
                        </Match>
                        <Match when={showWhat() === "pg"}>
                          <>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                1.
                              </td>
                              <td class="p-4 border-r border-black">
                                Pastoral Department
                              </td>
                              <td class="p-4 border-r border-black">
                                {console.log(pGDepartmental)}
                                <Show
                                  when={
                                    charges().pGDepartmental["Pastoral Studies"]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental[
                                        "Pastoral Studies"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                2.
                              </td>
                              <td class="p-4 border-r border-black">
                                Missions and Intercultural Studies Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental[
                                      "Missions and Intercultural Studies"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental[
                                        "Missions and Intercultural Studies"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                3.
                              </td>
                              <td class="p-4 border-r border-black">
                                Department of Youth Ministry Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental["Youth Ministry"]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental["Youth Ministry"]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                4.
                              </td>
                              <td class="p-4 border-r border-black">
                                Leadership and Administration Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental[
                                      "Leadership and Administration"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental[
                                        "Leadership and Administration"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                5.
                              </td>
                              <td class="p-4 border-r border-black">
                                Peace and Conflict Studies Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental[
                                      "Peace and Conflict Studies"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental[
                                        "Peace and Conflict Studies"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                6.
                              </td>
                              <td class="p-4 border-r border-black">
                                Community Development Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental[
                                      "Community Development"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental[
                                        "Community Development"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                7.
                              </td>
                              <td class="p-4 border-r border-black">
                                Christian Education Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental[
                                      "Christian Education"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental[
                                        "Christian Education"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                8.
                              </td>
                              <td class="p-4 border-r border-black">
                                Biblical Counselling and Psychology Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental[
                                      "Biblical Counselling and Psychology"
                                    ]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental[
                                        "Biblical Counselling and Psychology"
                                      ]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                9.
                              </td>
                              <td class="p-4 border-r border-black">
                                Old Testament Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental["Old Testament"]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental["Old Testament"]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                            <tr class="border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                10.
                              </td>
                              <td class="p-4 border-r border-black">
                                New Testament Department
                              </td>
                              <td class="p-4 border-r border-black">
                                <Show
                                  when={
                                    charges().pGDepartmental["New Testament"]
                                  }
                                  fallback={<>-</>}
                                >
                                  {formatter.format(
                                    parseInt(
                                      charges().pGDepartmental["New Testament"]
                                    )
                                  )}
                                </Show>
                              </td>
                              <td class="p-4">
                                <button class="green-btn p-3">Update</button>
                              </td>
                            </tr>
                          </>
                        </Match>
                      </Switch>
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
