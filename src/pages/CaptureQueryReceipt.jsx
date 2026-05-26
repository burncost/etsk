import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, createEffect } from "solid-js";

import Header from "../components/Header";
import StartCaptureReceiptForm from "../components/StartCaptureReceiptForm";
import StartQueryReceiptForm from "../components/StartQueryReceiptForm";
import VerifyOnlinePaymentForm from "../components/VerifyOnlinePaymentForm";
import UpdateStudentWalletForm from "../components/UpdateStudentWalletBalance";

const schema = z.object({
  ledger_number: z.string().length(11, "*Invalid"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const fetchStats = async () => {
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
    console.log(result.response);
    if (result.response === "Expired token") {
      localStorage.removeItem("jetsUser");
      navigate("/", { replace: true });
    }
  } else {
    navigate("/", { replace: true });
  }
};

export default function CaptureQueryReceipt() {
  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  createEffect(async () => {
    if (localStorage.getItem("jetsUser")) {
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
      }
    } else {
      navigate("/", { replace: true });
    }
  });

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <MetaProvider>
      <Title>
        Capture/Update/Verify Payments - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Capture Receipt on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-6">
          {/* Material-inspired heading with preserved red accent */}
          <h2 class="text-2xl font-medium text-center pb-2 border-b-2 border-red-600">
            Capture/Update/Verify Payment Records
          </h2>

          {/* Instruction card with Material elevation and preserved colors */}
          <div class="bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm p-4 space-y-3">
            <b class="block text-lg font-medium">Instruction:</b>
            <p class="text-gray-700">
              To ensure that a student's payment reflects in their portal wallet, enter the student's ledger number and click "Capture" to record the receipt.
            </p>
            <div class="border-t border-blue-900 pt-2">
              <p class="text-gray-700">
                For verification, you can check if a receipt has already been captured and for which student by entering the receipt number and clicking "Query."
              </p>
            </div>
            <div class="border-t border-blue-900 pt-2">
              <p class="text-gray-700">
                For payments made online, use the "Verify Online Payment" option to confirm transaction status before capturing the receipt.
              </p>
            </div>
          </div>
          {/* Main container with Material card styling */}
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Capture Receipt Card */}
              <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="p-6">
                  <div class="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    <span class="text-red-600">•</span> Capture Receipt <span class="text-red-600">•</span>
                  </div>
                  <div class="px-4">
                    <StartCaptureReceiptForm />
                  </div>
                </div>
              </div>

              {/* Query Receipt Card */}
              <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="p-6">
                  <div class="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    <span class="text-blue-600">•</span> Query Receipt <span class="text-blue-600">•</span>
                  </div>
                  <div class="px-4">
                    <StartQueryReceiptForm />
                  </div>
                </div>
              </div>

              {/* Verify Payment Card */}
              <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="p-6">
                  <div class="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    <span class="text-green-600">•</span> Verify Online Payment <span class="text-green-600">•</span>
                  </div>
                  <div class="px-4">
                    <VerifyOnlinePaymentForm />
                  </div>
                </div>
              </div>

              {/* credit student portal from bursary */}
              <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div class="p-6">
                  <div class="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    <span class="text-green-600">•</span> Update Student Wallet <span class="text-green-600">•</span>
                  </div>
                  <div class="px-4">
                    <UpdateStudentWalletForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
