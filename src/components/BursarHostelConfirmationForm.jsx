import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

const schema = z.object({
  accommodation_bal: z.string().min(1, "*Required"),
});

const VITE_API_URL = import.meta.env["VITE_API_URL"];

export default function BursarHostelConfirmationForm(props) {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const navigate = useNavigate();

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  // const sendSMS = async () => {
  //   if (props.phone.length > 10) {
  //     var phone = "+234" + props.phone.substring(1, 11);
  //   } else {
  //     var phone = "+234" + props.phone;
  //   }
  //   var msg =
  //     "Bursar has approved your registration. Login to the portal to complete the process.";
  //   const res = await axios.post("https://api.ng.termii.com/api/sms/send", {
  //     api_key: "TLWK68ATIe2skreBC99fl2dy7ltYNjpqpJweEoRqLRCPOamqO54zIP4RmGVh5P",
  //     to: phone,
  //     from: "JETS",
  //     sms: msg,
  //     type: "plain",
  //     channel: "generic",
  //   });
  //   return res;
  //   // console.log(phone, msg);
  // };

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      const request1 = fetch(
        VITE_API_URL + "/api/edit-accommodation-wallet/" + props.customId,
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
            amount: formData().accommodation_bal,
          }),
        }
      ).then((response) => response.json());
      const request2 = fetch(
        VITE_API_URL + "/api/edit-hostel-application/" + props.customId,
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
            period_id: props.periodId,
            status: "balance updated",
          }),
        }
      ).then((response) => response.json());

      Promise.all([request1, request2]).then(async ([data1, data2]) => {
        // sendSMS();

        // if (props.phone.length > 10) {
        //   var phone = "+234" + props.phone.substring(1, 11);
        // } else {
        //   var phone = "+234" + props.phone;
        // }
        // var msg =
        //   "Bursar has approved your registration. Login to the portal to complete the process.";
        // const res = await axios.post("https://api.ng.termii.com/api/sms/send", {
        //   api_key:
        //     "TLWK68ATIe2skreBC99fl2dy7ltYNjpqpJweEoRqLRCPOamqO54zIP4RmGVh5P",
        //   to: phone,
        //   from: "JETS",
        //   sms: msg,
        //   type: "plain",
        //   channel: "generic",
        // });
        navigate("/admin/hostel-applications/" + props.periodId, {
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
      <div class="grid grid-cols-2 gap-2 mb-2">
        <div>
          Current Accommodation Wal. Bal.:{" "}
          <b>{formatter.format(parseInt(props.currentBal))}</b>
        </div>
        <div>
          Will Update to: <b>{formatter.format(formData().accommodation_bal)}</b>
        </div>
      </div>
      <div class="sm:flex sm:space-x-4">
        <div class="grow">
          <TextInput
            label="Accommodation Wallet Balance:"
            name="accommodation_bal"
            required={true}
            type="number"
            formHandler={formHandler}
          />
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
                      Approve
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
              Approve
            </button>
          </Show>
        </div>
      </div>
    </form>
  );
}
