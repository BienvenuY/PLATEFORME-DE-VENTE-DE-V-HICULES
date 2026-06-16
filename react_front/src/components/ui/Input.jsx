import React, { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, value, type, id, name, placeholder, onChange, error, onBlur, ...rest },
  ref
) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className='mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>{label}</label>
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-lg border bg-white px-4 py-2 text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100 ${
            error
            ?"border-red-500 focus:ring-2 focus:ring-red-300"
            :"border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-600 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
        }`}
        {...rest}
      />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

    </div>
  );
})

export default Input;