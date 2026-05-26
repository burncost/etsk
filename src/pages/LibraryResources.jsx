import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import { createSignal, createResource } from "solid-js";
import Loading from "../components/Loading";

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function LibraryResources() {
  const navigate = useNavigate();
  const fetchResources = async () => {
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
      } else {
        try {
          const res = await fetch(VITE_API_URL + "/api/library-resource/1", {
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
          return result.response;
        } catch (error) {
          console.error(error);
        }
      }
    } else {
      navigate("/", { replace: true });
    }
  };
  const [resources] = createResource(fetchResources);

  return (
    <MetaProvider>
      <Title>Library Resources - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Library Resources on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <div class="mt-8 w-11/12 mx-auto space-y-4 mb-20 library-resources">
          <h2 class="text-lg font-semibold text-center border-b border-red-600">
            Library Resources
          </h2>
          <div class="bg-yellow-100 rounded-md border border-yellow-200  p-1 space-y-0.5">
            <b class="block">Instruction:</b>
            <p>
              Below are some resources provided by ETSK library. If you have
              questions or need further help please contact a library staff.
            </p>
          </div>
          <div class="border border-gray-600 shadow-md rounded p-2 lg:p-4">
            <Show
              when={resources.loading}
              fallback={<div innerHTML={resources().post}></div>}
            >
              <Loading />
            </Show>
          </div>
        </div>
      </div>
    </MetaProvider>
  );
}
