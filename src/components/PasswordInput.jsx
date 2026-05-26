import { Field } from 'solid-form-handler';
import { Show, createSignal, splitProps } from 'solid-js';
import Eye from './icons/Eye';
import EyeCrossed from './icons/EyeCrossed';

export default function PasswordInput(props){

  const [crossEye, setCrossEye] = createSignal(false)



  const togglePass = (vId)=> {
    var x = document.getElementById(vId);

    if (x.type === "password") {
      x.type = "text";
      setCrossEye(true);
    } else {
      x.type = "password";
      setCrossEye(false);
    }

  }

    const [local, rest] = splitProps(props, [
        'label',
        'formHandler',
        'required',
        'passId'
      ]);
    
    return (
        <Field
        {...props}
        mode="input"
        render={(field) => (
            <div class="bg-blue-100 border border-blue-200 p-1 text-sm">
                <div class="flex justify-between">
                    <div>
                        <Show when={local.label}>
                            <label class="" for={field.props.id}>
                            {local.label}
                            </label>
                            <Show when={local.required}><b class="text-red-600">*</b></Show>
                        </Show>
                    </div>
                    <div>
                        <Show when={field.helpers.error}>
                            <div class="text-purple-600">{field.helpers.errorMessage}</div>
                        </Show>
                    </div>
                </div>
                <div class="flex">
                    <div class="grow">
                        <input
                            {...rest}
                            {...field.props}
                            classList={{
                            'is-invalid': field.helpers.error,
                            'form-control': true,
                            }}
                            type="password"
                            id={props.passId}
                            class="text-slate-600 w-full border border-black outline-none bg-white px-1 h-8"
                        />
                    </div>
                    <div class="w-8 bg-black border border-black text-center pt-0.5">
                        <span id="toggleEye" onClick={()=>{togglePass(props.passId)}} 
                        class="w-6 h-6 inline cursor-pointer text-blue-200 hover:text-blue-600"
                        >
                            <Show when={crossEye()} fallback={
                            <>
                                <Eye/>
                            </>
                            }>
                                <EyeCrossed/>
                            </Show>
                        </span>
                    </div>
                </div>
            </div>
        )}
        />
    )
}