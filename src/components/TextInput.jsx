import { Field } from 'solid-form-handler';
import { Show, splitProps } from 'solid-js';

export default function TextInput(props){

    const [local, rest] = splitProps(props, [
        'label',
        'formHandler',
        'required',
        'type',
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
                <input
                    {...rest}
                    {...field.props}
                    classList={{
                    'is-invalid': field.helpers.error,
                    'form-control': true,
                    }}
                    type={props.type}
                    class="text-slate-600 w-full block border border-black outline-none bg-white px-1 h-8"
                />
            </div>
        )}
        />
    )
}