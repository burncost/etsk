import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { Select } from "./Select";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

const schema = z.object({
  comment: z.string().min(1, "*Required"),
  approval: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function AddDropDeanConfirmationForm(props) {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const sendSMS = async (msg) => {
    if (props.phone.length > 10) {
      var phone = "+234" + props.phone.substring(1, 11);
    } else {
      var phone = "+234" + props.phone;
    }
    const res = await axios.post("https://api.ng.termii.com/api/sms/send", {
      api_key: "TLWK68ATIe2skreBC99fl2dy7ltYNjpqpJweEoRqLRCPOamqO54zIP4RmGVh5P",
      to: phone,
      from: "JETS",
      sms: msg,
      type: "plain",
      channel: "generic",
    });
    return res;
    // console.log(phone, msg);
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    if (formData().approval === "disapprove") {
      var regStatus = "disapproved";
      var msg =
        "Dean's office disapproved your registration. Login to the portal, effect corrections and reforward.";
    }
    if (formData().approval === "approve") {
      var regStatus = "awaiting bursar";
      var msg =
        "Dean's office approved your registration and forwarded to Bursary. Now awaiting Bursary approval.";
    }
    try {
      const request1 = fetch(
        VITE_API_URL + "/api/edit-registration/" + props.customId,
        {
          mode: "cors",
          headers: {
            Authorization: `Bearer ${
              JSON.parse(localStorage.getItem("ecoejUser")).token
            }`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          method: "PATCH",
          body: JSON.stringify({
            period_id: props.periodId,
            add_drop_status: regStatus,
            comment: formData().comment,
          }),
        }
      ).then((response) => response.json());

      Promise.all([request1]).then(([data1]) => {
        sendSMS(msg);
        navigate("/admin/add-drop-awaiting-approval/" + props.periodId, {
          replace: true,
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  return (
    <form autocomplete="off" onSubmit={submit}>
      <div class="sm:flex sm:space-x-4">
        <div class="grow">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Select
                label="Action:"
                name="approval"
                placeholder="Select"
                required={true}
                options={[
                  {
                    value: "disapprove",
                    label: "NO. Reject this form.",
                  },
                  {
                    value: "approve",
                    label: "YES. Approve this form",
                  },
                ]}
                formHandler={formHandler}
              />
            </div>
            <div>
              <TextInput
                label="Comment:"
                name="comment"
                required={true}
                type="text"
                formHandler={formHandler}
              />
            </div>
          </div>
        </div>
        <div class="pt-2 sm:pt-5">
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
                      Forward
                    </button>
                  }
                >
                  <button
                    disabled
                    class="gray2-btn cursor-wait w-full p-3 text-center hover:opacity-60"
                  >
                    Wait.. .
                  </button>
                </Show>
              </>
            }
          >
            <button
              disabled
              class="gray-btn w-full p-3 text-center cursor-not-allowed"
            >
              Forward
            </button>
          </Show>
        </div>
      </div>
    </form>
  );
}
