import { Field } from "solid-form-handler";
import { createEffect, createSignal, For, Show, splitProps } from "solid-js";

export const Select = (props) => {
  const [local, rest] = splitProps(props, [
    "placeholder",
    "options",
    "label",
    "classList",
    "class",
    "formHandler",
    "required",
  ]);
  const [options, setOptions] = createSignal([]);

  /**
   * Computes the select options by using the placeholder and options props.
   */
  createEffect(() => {
    setOptions(() => [
      ...(local.placeholder ? [{ value: "", label: local.placeholder }] : []),
      ...(local.options || []),
    ]);
  });

  return (
    <Field
      {...props}
      mode="input"
      render={(field) => (
        <div class="bg-blue-100 border border-blue-200 p-1 text-sm">
          <div class="flex justify-between">
            <div>
              <Show when={local.label}>
                <label class="form-label" for={field.props.id}>
                  {local.label}
                  <Show when={local.required}>
                    <b class="text-red-600">*</b>
                  </Show>
                </label>
              </Show>
            </div>
            <div>
              <Show when={field.helpers.error}>
                <div class="text-purple-600">{field.helpers.errorMessage}</div>
              </Show>
            </div>
          </div>
          <select
            {...rest}
            {...field.props}
            classList={{
              "is-invalid": field.helpers.error,
              "form-control": true,
            }}
            class="text-slate-600 w-full block border border-black outline-none bg-white px-1 h-8"
          >
            <For each={options()}>
              {(option) => (
                <option
                  value={option.value}
                  selected={option.value == field.props.value}
                >
                  {option.label}
                </option>
              )}
            </For>
          </select>
        </div>
      )}
    />
  );
};
