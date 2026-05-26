import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { Show, createSignal, createResource } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import Success from "../components/icons/Success";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

const fetchWallets = async () => {
  const navigate = useNavigate();
  if (
    localStorage.getItem("jetsUser") &&
    JSON.parse(localStorage.getItem("jetsUser")).role === "admin"
  ) {
    const [wallets, setWallets] = createStore([]);

    const res = await fetch(VITE_API_URL + "/api/view-accommodation-wallets", {
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

    result.response.forEach(async function (wallet) {
      const res2 = await fetch(VITE_API_URL + "/api/user/" + wallet.custom_id, {
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
      const res3 = await fetch(
        VITE_API_URL + "/api/student/" + wallet.custom_id,
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
      const result2 = await res2.json();
      const result3 = await res3.json();

      setWallets(wallets.length, {
        id: wallets.length,
        custom_id: wallet.custom_id,
        amount: wallet.amount,
        surname: result2.response.surname,
        other_names:
          result2.response.first_name + " " + result2.response.other_names,
        ledger_number: result3.response.ledger_number,
      });
    });

    return wallets;
  } else {
    navigate("/", { replace: true });
  }
};

export default function AllAccommodationWallets() {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const submit = async (val) => {
    setIsProcessing(true);

    const new_amount = document.getElementById("new_amount_" + val).value;
    const custom_id = val;

    if (!new_amount || !custom_id) {
      alert("Please fill out required field");
      return;
    }

    try {
      const response = await fetch(
        VITE_API_URL + "/api/edit-accommodation-wallet/" + custom_id,
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
      );

      const result = await response.json();

      if (!result.success) {
        setIsProcessing(false);
      } else {
        setIsProcessing(false);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [clients] = createResource(fetchWallets);

  return (
    <MetaProvider>
      <Title>
        All Accommodation Wallets - ECWA Theological Seminary, KAGORO (ETSK)
      </Title>
      <Meta
        name="description"
        content="All Accommodation Wallets on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Show when={showSuccess()}>
          <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
            <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
              <h2 class="text-center text-blue-900 font-semibold">
                Accommodation Wallet Changed
              </h2>
              <div class="my-2 border-t border-b py-4 border-black">
                <Success />
                <p>
                  The Accommodation Wallet Balance for the particular student
                  was changed successfully!
                </p>
              </div>
              <div class="text-right space-x-3">
                <button
                  onClick={() =>
                    (window.location.href = "/admin/all-accommodation-wallets")
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
            All Accommodation Wallets
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              This is a list of all students and their current accommodation
              wallets. Accommodation Wallets only apply to hostel accommodation.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-1 lg:p-4">
            <table
              cellPadding={0}
              cellSpacing={0}
              class="w-full my-4 border border-black"
            >
              <thead class="bg-blue-950 text-white border-b border-black">
                <tr>
                  <td class="p-4 border-r border-black">#.</td>
                  <td class="p-4 border-r border-black">Fullname</td>
                  <td class="p-4 border-r border-black">Ledger No.</td>
                  <td class="p-4 border-r border-black">Bal.</td>
                  <td class="p-4">Change Bal.?</td>
                </tr>
              </thead>
              <tbody>
                <Show
                  when={clients.loading}
                  fallback={
                    <Show
                      when={setTimeout(clients().length > 0, 0)}
                      fallback={
                        <tr>
                          <td colSpan={5} class="p-4 text-center">
                            No record found.
                          </td>
                        </tr>
                      }
                    >
                      <For each={clients()}>
                        {(client, i) => (
                          <tr class="even:bg-gray-200 odd:bg-white even:border-y border-black">
                            <td class="p-4 border-r border-black font-semibold">
                              {i() + 1}.
                            </td>
                            <td class="p-4 border-r border-black">
                              <b class="uppercase">{client.surname}</b>{" "}
                              <span class="capitalize">
                                {client.other_names.toLowerCase()}
                              </span>
                            </td>
                            <td class="p-4 border-r border-black">
                              {client.ledger_number}
                            </td>
                            <td class="p-4 border-r border-black">
                              {formatter.format(parseInt(client.amount))}
                            </td>
                            <td class="p-4 space-x-1">
                              <input
                                type="number"
                                id={"new_amount_" + client.custom_id}
                                name="new_amount"
                                class="border border-black p-3 w-full sm:w-20 outline-none"
                                required
                              />
                              <button
                                onClick={() => submit(client.custom_id)}
                                class="mt-1 sm:mt-0 red-btn float-right sm:float-none p-3 border border-black text-center hover:opacity-60"
                              >
                                Go
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </Show>
                  }
                >
                  <tr>
                    <td colSpan={5} class="p-4 text-center">
                      Fetching.. .
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
