import { A, useNavigate } from "@solidjs/router";
import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { createSignal, createResource } from "solid-js";
import { createStore } from "solid-js/store";
import CaptureReceiptForm from "./CaptureReceiptForm";
import Failure from "./icons/Failure";
import Loading from "./Loading";

// Updated schema to allow either ledger_number or ledger_number,period_id
// const schema = z.string()
//   .min(7, "*Invalid ledger number")
//   .refine(
//     (val) => {
//       const parts = val.split(",").map(part => part.trim());
//       return parts.length === 1 || (parts.length === 2 && parts[1].length > 0);
//     },
//     { message: "*Format: '1234567' or '1234567,period_id'" }
//   );
  const schema = z.object({
    ledger_number: z.string().min(7, "*Invalid"),
  });

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function StartCaptureReceiptForm() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [student, setStudent] = createStore([]);
  const [showUserPop, setShowUserPop] = createSignal(false);
  const [portalWallet, setPortalWallet] = createSignal(0);
  const [accommodationWallet, setAccommodationWallet] = createSignal(0);
  const [receiptLog, setReceiptLog] = createStore([]);
  const [user, setUser] = createStore([]);
  const [periodId, setPeriodId] = createSignal("");
  const [captureStatus, setCaptureStatus] = createSignal("");

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const fetchPeriods = async () => {
    const navigate = useNavigate();

    if (
      localStorage.getItem("jetsUser") &&
      JSON.parse(localStorage.getItem("jetsUser")).role === "admin"
    ) {
      try {
        const res = await fetch(VITE_API_URL + "/api/view-periods", {
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
        setPeriodId(result.response[0].period_id);
        return result.response[0];
      } catch (error) {
        console.error(error);
      }
    } else {
      navigate("/", { replace: true });
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      // Parse input (split by comma if present)
      const input = formData();
      // console.log(input.ledger_number)
      const [ledger_number, explicitPeriodId] = input.ledger_number.split(",").map(part => part.trim());

      // Use explicit period ID if provided, otherwise use fetched one
      const targetPeriodId = explicitPeriodId || periodId();

      const response = await fetch(
        VITE_API_URL +
          "/api/view-student-by-ledger?ledger_number=" +
          encodeURIComponent(ledger_number),
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
      setStudent(result.response);
      setShowUserPop(true);
      
      if (Object.keys(result.response).length > 0) {
        const studentId = result.response[0].custom_id;

        // Parallel requests
        const requests = [
          fetch(VITE_API_URL + "/api/portal-wallet/" + studentId, {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }),
          fetch(VITE_API_URL + "/api/user/" + studentId, {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }),
          fetch(VITE_API_URL + "/api/receipt/" + studentId, {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }),
          fetch(VITE_API_URL + "/api/accommodation-wallet/" + studentId, {
            mode: "cors",
            headers: {
              Authorization: `Bearer ${
                JSON.parse(localStorage.getItem("jetsUser")).token
              }`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "GET",
          }),
          fetch(
            VITE_API_URL +
              "/api/registration/" +
              studentId +
              "?period_id=" +
              targetPeriodId,
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
          ),
        ];

        const [portalRes, userRes, receiptRes, accommodationRes, registrationRes] =
          await Promise.all(requests);

        const [
          portalData,
          userData,
          receiptData,
          accommodationData,
          registrationData,
        ] = await Promise.all([
          portalRes.json(),
          userRes.json(),
          receiptRes.json(),
          accommodationRes.json(),
          registrationRes.json(),
        ]);

        // Set capture status based on registration
        if (registrationData.response) {
          setCaptureStatus(
            registrationData.response.registration_status === "completed" ||
              registrationData.response.registration_status === "incomplete"
              ? "qualified"
              : "unqualified"
          );
        } else {
          setCaptureStatus("unqualified");
        }

        // Update state
        setPortalWallet(portalData.response?.amount || 0);
        setAccommodationWallet(accommodationData.response?.amount || 0);
        setUser(userData.response || []);
        setReceiptLog(receiptData.response ? JSON.parse(receiptData.response.log) : []);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const [periods] = createResource(fetchPeriods);

  return (
    <>
      <Show
        when={periods.loading}
        fallback={
          <div>
            <Show when={showUserPop()}>
              <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
                <Show
                  when={Object.keys(student).length > 0}
                  fallback={
                    <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
                      <h2 class="text-center text-blue-900 font-semibold">
                        Not Found
                      </h2>
                      <div class="my-2 border-t border-b py-4 border-black text-center">
                        <Failure />
                        <p class="text-center">
                          The entered Ledger Number was not found.
                        </p>
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
                  }
                >
                  <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-3 h-5/6 overflow-hidden">
                    <h2 class="text-center text-blue-900 font-semibold">
                      Capture Receipt
                    </h2>
                    <div class="my-2 border-t border-b border-black py-4 h-5/6 overflow-y-scroll">
                      <CaptureReceiptForm
                        user={user}
                        portalWallet={portalWallet()}
                        accommodationWallet={accommodationWallet()}
                        student={student}
                        log={receiptLog.length > 0 ? receiptLog : "no"}
                        capture_status={captureStatus()}
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
                </Show>
              </div>
            </Show>

            <form autocomplete="off" onSubmit={submit} class="flex space-x-2">
              <div class="grow">
                <TextInput
                  label="Ledger Number (or 'Ledger, Period ID'):"
                  name="ledger_number"
                  required={true}
                  type="text"
                  formHandler={formHandler}
                  placeholder="000/0000 or 000/000, 320242025"
                />
              </div>
              <div class="w-34 pt-4">
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
                        class="gray-btn cursor-none w-full p-3 text-center animate-pulse"
                      >
                        Processing...
                      </button>
                    </Show>
                  }
                >
                  <button
                    disabled
                    class="gray2-btn w-full p-3 text-center cursor-not-allowed"
                  >
                    Capture
                  </button>
                </Show>
              </div>
            </form>
          </div>
        }
      >
        <Loading />
      </Show>
    </>
  );
}
