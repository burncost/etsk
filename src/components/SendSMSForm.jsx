import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { createSignal } from "solid-js";
import Success from "./icons/Success";

const schema = z.object({
  message: z.string().min(1, "*Required").max(100, "*Too many characters"),
});

export default function SendSMSForm(props) {
  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    if (props.phone.length > 10) {
      var phone = "+234" + props.phone.substring(1, 11);
    } else {
      var phone = "+234" + props.phone;
    }
    var msg = formData().message;
    const res = await axios.post("https://api.ng.termii.com/api/sms/send", {
      api_key: "TLWK68ATIe2skreBC99fl2dy7ltYNjpqpJweEoRqLRCPOamqO54zIP4RmGVh5P",
      to: phone,
      from: "JETS",
      sms: msg,
      type: "plain",
      channel: "generic",
    });

    setShowSuccess(true);
  };

  return (
    <Show
      when={showSuccess()}
      fallback={
        <form autocomplete="off" onSubmit={submit} class="space-y-4">
          <div class="">
            <div>
              <TextInput
                label="Message:"
                name="message"
                required={true}
                type="text"
                formHandler={formHandler}
              />
            </div>
            <div class="pt-4">
              <Show
                when={formHandler.isFormInvalid()}
                fallback={
                  <>
                    <Show
                      when={isProcessing()}
                      fallback={
                        <button
                          type="submit"
                          class="red-btn p-3 hover:opacity-60"
                        >
                          Send Now
                        </button>
                      }
                    >
                      <button disabled class="gray-btn cursor-wait p-3">
                        Wait.. .
                      </button>
                    </Show>
                  </>
                }
              >
                <button disabled class="gray-btn p-3 cursor-not-allowed">
                  Send Now
                </button>
              </Show>
            </div>
          </div>
        </form>
      }
    >
      <Success />
      <p class="text-center">SMS sent successfully!</p>
    </Show>
  );
}
