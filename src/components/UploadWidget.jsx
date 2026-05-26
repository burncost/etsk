import { createSignal, createEffect, Show } from "solid-js";
import Success from "./icons/Success";
export default function UploadWidget() {
  const cloudinaryRef = createSignal();
  const widgetRef = createSignal();
  const [showSuccess, setShowSuccess] = createSignal(false);

  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  createEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: "dt5opbwyj",
        sources: ["local"],
        multiple: false,
        cropping: true,
        showSkipCropButton: false,
        croppingAspectRatio: 1,
        uploadPreset: "stupassport",
        clientAllowedFormats: ["png", "jpg", ".jpeg"],
        folder: "passports/students",
        maxImageFileSize: 15000000,
      },
      function (error, result) {
        updateUser(result);
      }
    );
  }, []);

  const updateUser = async (val) => {
    console.log(val);
    if (val.event === "success") {
      //update user
      const response = await fetch(
        VITE_API_URL +
          "/api/edit-user/" +
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
          method: "PATCH",
          body: JSON.stringify({
            status: "complete",
            passport_url: val.info.url,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        console.log(result);
      } else {
        setShowSuccess(true);
      }
    }
  };

  return (
    <div class="text-sm">
      <Show when={showSuccess()}>
        <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 h-screen w-screen flex items-center">
          <div class="w-80 sm:w-10/12 lg:w-6/12 mx-auto bg-white rounded-md p-6">
            <h2 class="text-center text-blue-900 font-semibold">
              Passport Uploaded
            </h2>
            <div class="my-2 border-t border-b py-4 border-black space-y-2">
              <Success />
              <p>Your passport photograph has been uploaded successfully.</p>
            </div>
            <div class="text-right space-x-3">
              <Show
                when={
                  JSON.parse(localStorage.getItem("jetsUser")).role === "admin"
                }
                fallback={
                  <button
                    onClick={() => (window.location.href = "/student/profile")}
                    class="blue-btn text-white p-3 hover:opacity-60"
                  >
                    Ok. Continue
                  </button>
                }
              >
                <button
                  onClick={() => (window.location.href = "/admin/profile")}
                  class="blue-btn text-white p-3 hover:opacity-60"
                >
                  Ok. Continue
                </button>
              </Show>
            </div>
          </div>
        </div>
      </Show>
      <button
        onClick={() => widgetRef.current.open()}
        class="blue-btn p-3 hover:opacity-60"
      >
        Upload
      </button>
    </div>
  );
}
