import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { Select } from "../components/Select";
import { createSignal } from "solid-js";
import Failure from "./icons/Failure";
import Success from "./icons/Success";

const schema = z.object({
  description: z.string().min(1, "*Required"),
  amount: z.string().min(1, "*Required"),
  receipt_number: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function CaptureReceiptForm(props) {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [success, setSuccess] = createSignal(false);
  const [duplicatedReceipt, setDuplicatedReceipt] = createSignal();
  const [duplicateReceipt, setDuplicateReceipt] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    //check if receipt number already exist
    const response = await fetch(VITE_API_URL + "/api/view-receipts", {
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
    const result = await response.json();

    for (let i = 0; i < result.response.length; i++) {
      for (let j = 0; j < JSON.parse(result.response[i].log).length; j++) {
        if (
          JSON.parse(result.response[i].log)[j].receipt_number ===
          formData().receipt_number
        ) {
          setDuplicateReceipt(true);
          setDuplicatedReceipt(
            JSON.parse(result.response[i].log)[j].receipt_number
          );
          return;
        }
      }
    }

    var today =
      new Date().getDate() +
      "-" +
      (new Date().getMonth() + 1) +
      "-" +
      new Date().getFullYear();

    if (formData().description === "accommodation") {
      var which_wallet = "edit-accommodation-wallet";
      var new_amount =
        parseInt(formData().amount) + parseInt(props.accommodationWallet);
    } else {
      var which_wallet = "edit-portal-wallet";
      var new_amount =
        parseInt(formData().amount) + parseInt(props.portalWallet);
    }

    if (props.log === "no") {
      var which_method = "POST";
      var which_url = "create-receipt";

      var arr = [
        {
          receipt_number: formData().receipt_number.toLowerCase(),
          description: formData().description,
          amount: parseInt(formData().amount),
          date: today,
          custom_id: props.user.custom_id,
        },
      ];
    } else {
      var which_method = "PATCH";
      var which_url = "edit-receipt/" + props.user.custom_id;

      let loglist = {
        receipt_number: formData().receipt_number.toLowerCase(),
        description: formData().description,
        amount: parseInt(formData().amount),
        date: today,
        custom_id: props.user.custom_id,
      };
      var arr = [];
      var currentLogs = props.log;
      let logss = Object.values(currentLogs);

      for (const key in logss) {
        var val = {
          receipt_number: logss[key]["receipt_number"],
          description: logss[key]["description"],
          amount: parseInt(logss[key]["amount"]),
          date: logss[key]["date"],
          custom_id: props.user.custom_id,
        };
        arr.unshift(val);
      }

      arr.unshift(loglist);
    }
    console.log(new_amount, which_method, which_wallet);

    try {
      const request1 = fetch(
        VITE_API_URL + "/api/" + which_wallet + "/" + props.user.custom_id,
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
            amount: new_amount,
          }),
        }
      ).then((response) => response.json());
      const request2 = fetch(VITE_API_URL + "/api/" + which_url, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("jetsUser")).token
          }`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: which_method,
        body: JSON.stringify({
          log: JSON.stringify(arr),
          custom_id: props.user.custom_id,
        }),
      }).then((response) => response.json());

      Promise.all([request1, request2]).then(([data1, data2]) => {
        setIsProcessing(false);
        setSuccess(true);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

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

  return (
    <>
      <Show
        when={success()}
        fallback={
          <Show
            when={duplicateReceipt()}
            fallback={
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="col-span-2 row-span-2 sm:col-span-1">
                  <span class="block mx-auto w-40 lg:w-40 lg:max-h-40 overflow-hidden rounded-md">
                    <img
                      src={getOptPassport(props.user.passport_url)}
                      class="mx-auto h-full rounded"
                    />
                  </span>
                </div>
                <div>
                  <b>Fullname:</b>
                  <br />
                  <span class="uppercase font-semibold">
                    {props.user.surname}
                  </span>{" "}
                  <span class="capitalize">{props.user.first_name}</span>{" "}
                  <span class="capitalize">{props.user.other_names}</span>
                </div>
                <div>
                  <b>Ledger Number:</b>
                  <br />
                  {props.student[0].ledger_number}
                </div>
                <div>
                  <b>Matric Number:</b>
                  <br />
                  <span class="uppercase">{props.user.username}</span>
                </div>
                <div>
                  <b>Phone Number:</b>
                  <br />
                  <span class="uppercase">{props.user.phone_number}</span>
                </div>
                <div>
                  <b>Portal Wallet:</b>
                  <br />
                  <span>{formatter.format(parseInt(props.portalWallet))}</span>
                </div>
                <div>
                  <b>Accomm. Wallet:</b>
                  <br />
                  <span>
                    {formatter.format(parseInt(props.accommodationWallet))}
                  </span>
                </div>
                <div class="col-span-2 sm:col-span-4 border-t border-black pt-3">
                  <Show
                    when={props.capture_status === "qualified"}
                    fallback={
                      <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
                        <div class="flex">
                          <div class="w-20 text-xl pt-1">
                            <span class="">❌</span>
                          </div>
                          <div class="grow">
                            <p>
                              You cannot capture this student's receipt at the
                              moment because Ledger Balance for this semester
                              has not been inputed!
                            </p>
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <form autocomplete="off" onSubmit={submit}>
                      <div class="sm:flex sm:space-x-2">
                        <div class="grow">
                          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <Select
                                label="Description:"
                                name="description"
                                placeholder="Select"
                                required={true}
                                options={[
                                  {
                                    value: "tuition",
                                    label: "Tuition",
                                  },
                                  {
                                    value: "work scholarship",
                                    label: "Work Scholarship",
                                  },
                                  {
                                    value: "other scholarship",
                                    label: "Other Scholarship",
                                  },
                                  {
                                    value: "ledger transfer",
                                    label: "Ledger Transfer",
                                  },
                                  {
                                    value: "accommodation",
                                    label: "Accommodation",
                                  },
                                ]}
                                formHandler={formHandler}
                              />
                            </div>
                            <div>
                              <TextInput
                                label="Receipt No.:"
                                name="receipt_number"
                                required={true}
                                type="text"
                                formHandler={formHandler}
                              />
                            </div>
                            <div>
                              <TextInput
                                label={
                                  "Amount: " +
                                  formatter.format(formData().amount)
                                }
                                name="amount"
                                required={true}
                                type="number"
                                formHandler={formHandler}
                              />
                            </div>
                          </div>
                        </div>
                        <div class="sm:w-28 pt-2 sm:pt-4">
                          <Show
                            when={formHandler.isFormInvalid()}
                            fallback={
                              <Show
                                when={isProcessing()}
                                fallback={
                                  <button
                                    type="submit"
                                    class="red-btn w-full p-3 text-center hover:opacity-60"
                                  >
                                    Capture
                                  </button>
                                }
                              >
                                <button
                                  disabled
                                  class=" gray2-btn cursor-wait w-full p-3 text-center animate-pulse"
                                >
                                  Wait.. .
                                </button>
                              </Show>
                            }
                          >
                            <button
                              disabled
                              class="gray-btn w-full p-3 text-center cursor-not-allowed"
                            >
                              Capture
                            </button>
                          </Show>
                        </div>
                      </div>
                    </form>
                  </Show>
                </div>
                <div class="col-span-2 sm:col-span-4 border-t border-black pt-3">
                  <table
                    cellPadding={0}
                    cellSpacing={0}
                    class="w-full my-4 border"
                  >
                    <thead class="bg-blue-950 text-white border-b border-black">
                      <tr>
                        <td class="p-4 border-r border-black">#</td>
                        <td class="p-4 border-r border-black">
                          Receipt Number
                        </td>
                        <td class="p-4 border-r border-black">Date</td>
                        <td class="p-4 border-r border-black">Description</td>
                        <td class="p-4 border-r border-black">Amount</td>
                        <td class="p-4">?</td>
                      </tr>
                    </thead>
                    <tbody>
                      <Show
                        when={props.log !== "no"}
                        fallback={
                          <tr class="border-b border-black">
                            <td colSpan={5} class="text-center p-4">
                              No record found.
                            </td>
                          </tr>
                        }
                      >
                        <For each={props.log}>
                          {(log, i) => (
                            <tr class="even:bg-gray-200 odd:bg-white border-b border-black">
                              <td class="p-4 border-r border-black font-semibold">
                                {i() + 1}.
                              </td>
                              <td class="p-4 border-r border-black">
                                {log.receipt_number}
                              </td>
                              <td class="p-4 border-r border-black">
                                {log.date}
                              </td>
                              <td class="p-4 border-r border-black capitalize">
                                {log.description}
                              </td>
                              <td class="p-4 border-r border-black">
                                {formatter.format(parseInt(log.amount))}
                              </td>
                              <td class="p-4">
                                <button class="red-btn p-3">Remove</button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </Show>
                    </tbody>
                  </table>
                </div>
              </div>
            }
          >
            <div class="flex items-center h-full">
              <div class="w-80 mx-auto">
                <Failure />
                <p>
                  Duplicate!
                  <br />
                  <br />
                  <b>{duplicatedReceipt()}</b> has been captured before now.
                  Please confirm and try again.
                </p>
              </div>
            </div>
          </Show>
        }
      >
        <div class="flex items-center text-center h-full">
          <div class="w-80 mx-auto">
            <Success />
            <p>Action was carried out successfully!</p>
          </div>
        </div>
      </Show>
    </>
  );
}
