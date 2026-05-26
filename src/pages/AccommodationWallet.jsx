import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Show, createSignal, createEffect } from "solid-js";

import Header from "../components/Header";
import Loading from "../components/Loading";

export default function PortalWallet() {
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [loading, setLoading] = createSignal(true);
  const [accommodationWallet, setAccommodationWallet] = createSignal(true);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  createEffect(async () => {
    const navigate = useNavigate();

    if (localStorage.getItem("jetsUser")) {
      fetch(
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
      )
        .then((response) => {
          return response.json();
        })
        .then((data1) => {
          return fetch(
            VITE_API_URL +
              "/api/accommodation-wallet/" +
              data1.response.custom_id,
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
        })
        .then((response) => {
          return response.json();
        })
        .then((data2) => {
          if (data2.success) {
            setAccommodationWallet(data2.response);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      navigate("/", { replace: true });
    }
  });

  return (
    <MetaProvider>
      <Title>
        Accommodation Wallet - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="Accommodation Wallet on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={!loading()} fallback={<Loading />}>
          <div class="mt-8 mb-20 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Accommodation Wallet
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>
                Please MAKE SURE your accommodation wallet for each semester is
                correct before you submit and print out your accommodation
                request acceptance for the semester.
              </p>
            </div>
            <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
                <div class="bg-green-200 border border-green-300 p-6 rounded text-xl ">
                  <h2>Balance:</h2>
                  <div class="text-3xl">
                    {formatter.format(parseInt(accommodationWallet().amount))}
                  </div>
                </div>
                <div class="lg:col-span-2">
                  <h2 class="font-semibold underline text-blue-900 text-lg">
                    How to make payment:
                  </h2>
                  <p>
                    Make payment (transfer or bank deposit) into the following
                    account:
                    <br />
                    <b>ECWA Theological Seminary</b>, <b>First Bank</b>,{" "}
                    <b>0023xxxxxx</b>
                    <br />
                    Proceed to Bursary & obtain official school receipt. This
                    Wallet will be updated immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
