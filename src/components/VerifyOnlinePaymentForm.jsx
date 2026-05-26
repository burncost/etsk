import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { Match, Show, Switch, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import Failure from "./icons/Failure";

const schema = z.object({
  transaction_id: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];
const GATEWAY = import.meta.env.VITE_GATEWAY;
const PRIVK = import.meta.env.VITE_PRIVKEY;

export default function VerifyOnlinePaymentForm() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [customID, setCustomID] = createSignal("");
  const [showUserPop, setShowUserPop] = createSignal(false);
  const [portalWallet, setPortalWallet] = createSignal();
  const [ledgerNumber, setLedgerNumber] = createSignal();
  const [foundReceipt, setFoundReceipt] = createSignal("checking");
  const [transactionData, setTransactionData] = createStore({});
  const [credited, setCredited] = createSignal("");

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

    // console.log(formData().transaction_id);

    try{
      const txResponse = await fetch(GATEWAY + "/transaction/" + formData().transaction_id + "/verify", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: PRIVK,
        }
      });
      const contentType = txResponse.headers.get("content-type");
      if (!contentType?.includes("application/json")){
        const text = await txResponse.text();
        throw new Error(`Expected JSON, got: ${text.substring(0,100)}`);
      }
      const txData = await txResponse.json();
      
      if (txData.status === 200 && txData.message === "Successfully processed") {
        setTransactionData({
          initialPortalBalance : "",
          txAmount : parseFloat(txData.data["transAmount"]),
          firstname : txData.data["customerFirstName"],
          surname : txData.data["customerLastName"],
          phonenumber : txData.data["customerPhoneNumber"],
          email : txData.data["customerId"],
          transRef : txData.data["transRef"],
          _studentId : txData.data["metadata"][0]["insightTagValue"],   
          txDate : txData.data["transactionDate"],
        });       
        setFoundReceipt("yes");;                 
      }
      else{
        console.log("No Tx Found for this ID!");
        setFoundReceipt("no");
      }              
    }
    catch (error){
      console.log(error);
    };

    var sid = transactionData._studentId;
    if (!user) return;
    // console.log(`${VITE_API_URL}/api/user/${sid}`);
    try {
      const response = await fetch(`${VITE_API_URL}/api/user/${sid}`, {
        mode: "cors",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        method: "GET",
      });

      const data = await response.json();
    
      setCustomID(data.response.custom_id);        
    } catch (error) {
      console.error("Error fetching user data:", error);
    };

    try {
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
      if (data.success) {
        setPortalWallet(data.response);
        var txRefList = portalWallet()?.tx_ref_ids.split(", ").map(s => s.replace(/"/g, ""));
      
        if (txRefList.includes(formData().transaction_id)){
          setCredited("Yes")
        }
        else{
          setCredited("No")
        }
      }
    } 
    catch (error) {
      console.error("Error fetching wallet data:", error);
    }; 
    
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
        setLedgerNumber(data.response.ledger_number);    
      }
    } 
    catch (error) {
      console.error("Error Student data:", error);
    };
    setShowUserPop(true);
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
                          <b>Transaction Date:</b>
                          <br />
                          {transactionData.txDate}
                        </div>
                        <div>
                          <b>Amount Paid:</b>
                          <br />
                          {formatter.format(parseInt(transactionData.txAmount))}
                        </div>
                        <div>
                          <b>Wallet Balance:</b>
                          <br />
                          <span >
                            {formatter.format(parseFloat(portalWallet()?.amount || 0))}
                          </span>
                        </div>
                        <div>
                          <b>Transaction Credited?</b>
                          <br />
                          {credited()}
                        </div>
                        <div class="col-span-2 sm:col-span-4 border-b text-gray-400">
                          It was captured for:
                        </div>
                        <div>
                          <b>Name:</b>
                          <br />
                          <b class="uppercase">{transactionData.surname}</b>{" "}
                          <span class="capitalize">{transactionData.firstname}</span>{" "}
                          {/* <span class="capitalize">{user.other_names}</span> */}
                        </div>
                        <div>
                          <b>Phone Number:</b>
                          <br />
                          {transactionData.phonenumber}
                        </div>
                        <div>
                          <b>Ledger Number:</b>
                          <br />
                          {ledgerNumber()}
                        </div>
                        <div>
                          <b>Student ID:</b>
                          <br />
                          <span >{transactionData._studentId}</span>
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
                            Transaction Id: <b>
                              {formData().transaction_id}
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
            label="Transaction Reference ID:"
            name="transaction_id"
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
                      Verify
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
              Verify
            </button>
          </Show>
        </div>
      </form>
    </>
  );
}
