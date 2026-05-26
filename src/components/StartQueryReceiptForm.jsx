import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { Match, Show, Switch, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import Failure from "./icons/Failure";

const schema = z.object({
  receipt_number: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function StartQueryReceiptForm() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [student, setStudent] = createStore([]);
  const [showUserPop, setShowUserPop] = createSignal(false);
  const [portalWallet, setPortalWallet] = createSignal();
  const [receiptLog, setReceiptLog] = createStore([]);
  const [user, setUser] = createStore([]);
  const [foundReceipt, setFoundReceipt] = createSignal("checking");

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setShowUserPop(true);

    try {
      const response = await fetch(VITE_API_URL + "/api/view-receipts", {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("ecoejUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      });

      const result = await response.json();

      for (let i = 0; i < result.response.length; i++) {
        for (let j = 0; j < JSON.parse(result.response[i].log).length; j++) {
          if (
            JSON.parse(result.response[i].log)[j].receipt_number ===
            formData().receipt_number.toLowerCase()
          ) {
            setReceiptLog(JSON.parse(result.response[i].log)[j]);
            const request1 = fetch(
              VITE_API_URL +
                "/api/user/" +
                JSON.parse(result.response[i].log)[j].custom_id,
              {
                mode: "cors",
                headers: {
                  Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("ecoejUser")).token
                  }`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                method: "GET",
              }
            ).then((response) => response.json());
            const request2 = fetch(
              VITE_API_URL +
                "/api/student/" +
                JSON.parse(result.response[i].log)[j].custom_id,
              {
                mode: "cors",
                headers: {
                  Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("ecoejUser")).token
                  }`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                method: "GET",
              }
            ).then((response) => response.json());
            Promise.all([request1, request2]).then(([data1, data2]) => {
              setUser(data1.response);
              setStudent(data2.response);
              setFoundReceipt("yes");
            });

            return;
          } else {
            setFoundReceipt("no");
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <>
      <Show when={showUserPop()}>
        <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
          <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-3 overflow-hidden">
            <h2 class="text-center text-blue-900 font-semibold">
              Receipt Details
            </h2>
            <div class="my-2 border-t border-b border-black py-4 h-5/6 overflow-y-scroll">
              <Show
                when={foundReceipt() === "checking"}
                fallback={
                  <>
                    <Show when={foundReceipt() === "yes"}>
                      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <b>Date Issue:</b>
                          <br />
                          {receiptLog.date}
                        </div>
                        <div>
                          <b>Amount Capture:</b>
                          <br />
                          {formatter.format(parseInt(receiptLog.amount))}
                        </div>
                        <div>
                          <b>Description:</b>
                          <br />
                          <span class="capitalize">
                            {receiptLog.description}
                          </span>
                        </div>
                        <div>
                          <b>No.:</b>
                          <br />
                          {receiptLog.receipt_number}
                        </div>
                        <div class="col-span-2 sm:col-span-4 border-b text-gray-400">
                          It was captured for:
                        </div>
                        <div>
                          <b>Name:</b>
                          <br />
                          <b class="uppercase">{user.surname}</b>{" "}
                          <span class="capitalize">{user.first_name}</span>{" "}
                          <span class="capitalize">{user.other_names}</span>
                        </div>
                        <div>
                          <b>Phone Number:</b>
                          <br />
                          {user.phone_number}
                        </div>
                        <div>
                          <b>Ledger Number:</b>
                          <br />
                          {student.ledger_number}
                        </div>
                        <div>
                          <b>Matric Number:</b>
                          <br />
                          <span class="uppercase">{user.username}</span>
                        </div>
                      </div>
                    </Show>
                    <Show when={foundReceipt() === "no"}>
                      <div class="flex items-center h-full">
                        <div class="w-80 mx-auto">
                          <Failure />
                          <p>
                            Not found!
                            <br />
                            <br />
                            Receipt number: <b>
                              {formData().receipt_number}
                            </b>{" "}
                            was not found.
                          </p>
                        </div>
                      </div>
                    </Show>
                  </>
                }
              >
                <div class="flex items-center h-full">
                  <div class="w-80 mx-auto">
                    <p class="animate-pulse text-gray-400">Fetching.. .</p>
                  </div>
                </div>
              </Show>
            </div>
            <div class="text-right">
              <button
                onClick={() => setShowUserPop(false)}
                class="gray2-btn text-white p-3 hover:opacity-60"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Show>
      <form autocomplete="off" onSubmit={submit} class="flex space-x-2">
        <div class="grow">
          <TextInput
            label="Receipt Number:"
            name="receipt_number"
            required={true}
            type="text"
            formHandler={formHandler}
          />
        </div>
        <div class="w-34 pt-4">
          <Show
            when={formHandler.isFormInvalid()}
            fallback={
              <>
                <Show
                  when={isProcessing()}
                  fallback={
                    <button
                      type="submit"
                      class="red-btn w-full p-3 text-center hover:opacity-60"
                    >
                      Query
                    </button>
                  }
                >
                  <button
                    disabled
                    class="gray-btn cursor-none w-full p-3 text-center animate-pulse"
                  >
                    Wait.. .
                  </button>
                </Show>
              </>
            }
          >
            <button
              disabled
              class="gray2-btn w-full p-3 text-center cursor-not-allowed"
            >
              Query
            </button>
          </Show>
        </div>
      </form>
    </>
  );
}
