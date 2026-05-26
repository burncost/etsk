import { useFormHandler } from "solid-form-handler";
import { zodSchema } from "solid-form-handler/zod";
import { z } from "zod";
import TextInput from "./TextInput";
import { createSignal } from "solid-js";
import Success from "./icons/Success";
import { A, useNavigate, useParams } from "@solidjs/router";

const schema = z.object({
  newAmount: z.string().min(1, "*Required"),
});

export default function ChangeChargeForm(props) {
  const params = useParams();
  const VITE_API_URL = import.meta.env["VITE_API_URL"];

  const [isProcessing, setIsProcessing] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);

  const formHandler = useFormHandler(zodSchema(schema));
  const { formData } = formHandler;

  const submit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);

    // console.log(props.val, props.charges);
    var adminCharges = props.charges;
    var admin_charges = Object.keys(props.charges);

    var chargesObj = {};

    admin_charges.forEach((admin_charge) => {
      if (admin_charge === props.val) {
        chargesObj[admin_charge] = [formData().newAmount];
      } else if (admin_charge === "total") {
        var newTotal = adminCharges[admin_charge];
        newTotal = parseInt(newTotal) - parseInt(adminCharges[props.val]);
        newTotal = newTotal + parseInt(formData().newAmount);
        chargesObj[admin_charge] = [newTotal];
      } else {
        chargesObj[admin_charge] = [adminCharges[admin_charge]];
      }
    });
    console.log(chargesObj, params.customId, params.periodId);
    fetch(VITE_API_URL + "/api/edit-registration/" + params.customId, {
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
        period_id: params.periodId,
        seminary_charges: JSON.stringify(chargesObj),
      }),
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
                label={"New " + props.val}
                name="newAmount"
                required={true}
                type="number"
                formHandler={formHandler}
              />
            </div>
            <div class="pt-4 space-x-3 text-right">
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
                          Submit
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
                  Submit
                </button>
              </Show>
              <span
                onClick={() => {
                  window.location.reload();
                }}
                class="gray2-btn inline-block p-3 cursor-pointer"
              >
                Close
              </span>
            </div>
          </div>
        </form>
      }
    >
      <Success />
      <p class="text-center">Edited successfully!</p>
      <div class="mt-4 text-center">
        <button
          onClick={() => {
            window.location.reload();
          }}
          class="text-white p-3 hover:opacity-60 blue-btn"
        >
          Okay
        </button>
      </div>
    </Show>
  );
}
