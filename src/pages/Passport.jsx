import { A } from "@solidjs/router";
import { MetaProvider, Title, Meta } from "@solidjs/meta";
import { Show, createEffect, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

import Header from "../components/Header";
import UploadWidget from "../components/UploadWidget";
import Loading from "../components/Loading";

export default function UploadPassport() {
  const VITE_API_URL = import.meta.env["VITE_API_URL"];
  const [loading, setLoading] = createSignal(true);
  const [passport, setPassport] = createSignal();

  createEffect(async () => {
    const navigate = useNavigate();
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
        if (result.response.status === "change password") {
          navigate("/student/change-default-password", { replace: true });
        } else if (result.response.status === "complete profile") {
          navigate("/student/complete-profile", { replace: true });
        } else if (
          result.response.status === "upload passport" ||
          result.response.status === "complete"
        ) {
          setPassport(result.response.passport_url);
          setLoading(false);
        } else {
          navigate("/student/change-default-password", { replace: true });
        }
      }
    } else {
      navigate("/", { replace: true });
    }
  });

  return (
    <MetaProvider>
      <Title>Upload Passport - ECWA Theological Seminary, KAGORO (ETSK)</Title>
      <Meta
        name="description"
        content="Passport on ECWA Theological Seminary, KAGORO (ETSK)"
      />
      <div class="text-sm">
        <Header />
        <Show when={!loading()} fallback={<Loading />}>
          <div class="mt-8 w-11/12 mx-auto space-y-4">
            <h2 class="text-lg font-semibold text-center border-b border-red-600">
              Upload Passport
            </h2>
            <div class="bg-yellow-100 rounded-md border border-yellow-200 p-1 space-y-0.5">
              <b class="block">Instruction:</b>
              <p>
                Upload a formal and proper passport photograph of yourself.
                'Selfies' are NOT allowed. Click the 'Upload' button to upload
                passport.
              </p>
              <p class="border-t border-blue-900 pt-1">
                Only JPEG, JPG and PNG formats are allowed.
              </p>
            </div>
            <div class="border border-gray-600 shadow-md rounded p-1 sm:p-4">
              <div class="w-full sm:w-80 lg:w-6/12 mx-auto rounded-md p-2 text-center bg-gray-100 space-y-3">
                <div class="py-3">
                  <Show
                    when={passport()}
                    fallback={
                      <img src="/user.png" class="w-36 rounded mx-auto" />
                    }
                  >
                    <img
                      src={passport()}
                      alt="Passport"
                      class="w-36 rounded mx-auto"
                    />
                  </Show>
                </div>
                <div class="grid grid-cols-2 gap-2 border-t border-gray-200 pt-6 pb-3">
                  <UploadWidget />
                  <Show
                    when={passport()}
                    fallback={
                      <button disabled class="gray-btn py-3 cursor-not-allowed">
                        Proceed
                      </button>
                    }
                  >
                    <A href="/student/complete-profile" class="red-btn py-3">
                      Proceed
                    </A>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </MetaProvider>
  );
}
