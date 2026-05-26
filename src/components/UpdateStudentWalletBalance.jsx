import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { Match, Show, Switch, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import Failure from "./icons/Failure";

const schema = z.object({
  id_amount: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];
const GATEWAY = import.meta.env.VITE_GATEWAY;
const PRIVK = import.meta.env.VITE_PRIVKEY;

export default function UpdateStudentWalletForm() {
  const [foundReceipt, setFoundReceipt] = createSignal("checking");
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [customID, setCustomID] = createSignal("");
  const [showUserPop, setShowUserPop] = createSignal(false);
  const [initialBalance, setInitialBalance] = createSignal();
  const [currentBalance, setCurrentBalance] = createSignal();
  const [studentId, setStudentId] = createSignal("");
  const [amount, setAmount] = createSignal("");
  const [uData, setUData] = createSignal();
  const [sData, setSData] = createSignal();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const getUserData = () => {
    const user = localStorage.getItem("jetsUser");
    return user ? JSON.parse(user) : null;
  };

  const user = getUserData();

  const submit = async (event) => {
    event.preventDefault();
    setShowUserPop(true);

    console.log(formData().id_amount.split(',').map(item => item.trim()));
    const sData = formData().id_amount.split(',').map(item => item.trim());
    
    setStudentId(sData[0]);
    setAmount(parseFloat(sData[1]));

    console.log(studentId());
    console.log(amount());

    if (!user) return;
    // get user details and extract custom_id
    try {
      const response = await fetch(`${VITE_API_URL}/api/user/${studentId()}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      });
      const data = await response.json();
      if (data.success){     
        setCustomID(data.response.custom_id);  
        setUData(data.response);  
        console.log("User details: ", uData())

        //get current wallet balance
        try{
          const response = await fetch(`${VITE_API_URL}/api/portal-wallet/${customID()}`, {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          });
          const data = await response.json();
          console.log(data)
          if (data.success){
            setInitialBalance(data.response.amount);

            // set valid wallet balance
            try {
              const response = await fetch(`${VITE_API_URL}/api/edit-portal-wallet/${customID()}`, {
                mode: "cors",
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                method: "PATCH",
                body:JSON.stringify({
                  amount: amount(),
                }),
              });

              const data = await response.json();
              if (data.success) {
                setCurrentBalance(amount());

                //get student data
                try {
                  const response = await fetch(`${VITE_API_URL}/api/student/${customID()}`, {
                    mode: "cors",
                    headers: {
                      Authorization: `Bearer ${user.token}`,
                      "Content-Type": "application/json",
                      Accept: "application/json",
                    },
                    method: "GET",
                  });

                  const data = await response.json();

                  if (data.success) {
                    setSData(data.response);
                    setFoundReceipt("yes");
                  }
                } 
                catch (error) {
                  console.error("Error Student data:", error);
                };
                setShowUserPop(true);
                setTimeout(() => setShowUserPop(false), 10000);
              }
            } 
            catch (error) {
              console.error("Error Updating wallet data:", error);
            };
          }
        }
        catch (error){
          console.log("Error fetching Student Balance : ", error);
        }
      }
      else{
        setFoundReceipt("no");
      }    
    } catch (error) {
      console.error("Error fetching user data:", error);
    };    
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
              Update Details...
            </h2>
            <div class="my-4 rounded-xl border border-gray-300 bg-white shadow-md p-6 h-[70vh] overflow-y-auto">
              <Show
                when={foundReceipt() === "checking"}
                fallback={
                  <>
                    <Show when={foundReceipt() === "yes"}>
                      <div class="space-y-6">
                        {/* Balance Summary Cards */}
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 class="text-sm font-medium text-blue-800 mb-1">Initial Balance</h3>
                            <p class="text-2xl font-bold text-blue-900">
                              {formatter.format(initialBalance())}
                            </p>
                          </div>
                          <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                            <h3 class="text-sm font-medium text-green-800 mb-1">Updated Balance</h3>
                            <p class="text-2xl font-bold text-green-900">
                              {formatter.format(currentBalance())}
                            </p>
                          </div>
                        </div>

                        {/* Student Information */}
                        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h3 class="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                            Student Details
                          </h3>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p class="text-sm text-gray-500">Ledger Number</p>
                              <p class="font-medium">{sData().ledger_number}</p>
                            </div>
                            <div>
                              <p class="text-sm text-gray-500">Student ID</p>
                              <p class="font-medium">{uData().username}</p>
                            </div>
                            <div class="sm:col-span-2">
                              <p class="text-sm text-gray-500">Full Name</p>
                              <p class="font-medium">
                                <span class="uppercase">{uData().surname}</span>{" "}
                                <span class="capitalize">{uData().firstname}</span>{" "}
                                <span class="capitalize">{uData().other_names}</span>
                              </p>
                            </div>
                            <div>
                              <p class="text-sm text-gray-500">Phone Number</p>
                              <p class="font-medium">{uData().phonenumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Show>

                    <Show when={foundReceipt() === "no"}>
                      <div class="flex flex-col items-center justify-center h-full text-center p-8">
                        <div class="max-w-xs">
                          <Failure class="mx-auto w-24 h-24 text-red-500" />
                          <h3 class="text-xl font-semibold mt-4 text-gray-800">Transaction Not Found</h3>
                          <p class="mt-2 text-gray-600">
                            Transaction ID: <span class="font-mono font-bold">{studentId()}</span> was not found in our records.
                          </p>
                          <p class="mt-4 text-sm text-gray-500">
                            Please verify the ID and try again.
                          </p>
                        </div>
                      </div>
                    </Show>
                  </>
                }
              />
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
                label="Student Id, Amount:"
                name="id_amount"
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
                          Update
                        </button>
                      }
                    >
                      <button
                        disabled
                        class="gray-btn cursor-none w-full p-3 text-center animate-pulse"
                      >
                        Wait...
                      </button>
                    </Show>
                  </>
                }
              >
                <button
                  disabled
                  class="gray2-btn w-full p-3 text-center cursor-not-allowed"
                >
                  Update
                </button>
              </Show>
            </div>
          </form>
    </>
  );
}
