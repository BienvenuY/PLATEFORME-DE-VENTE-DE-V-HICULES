import React from 'react'

function Button({
    id,
    text,
    type="button",
    variant="default",
    disabled=false,
    size="md",
    onClick
    }) {
       const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-[12px] gap-[8px] text-[14px] font-semibold disabled:pointer-events-none disabled:opacity-50"
       const variantStyles ={
        default:"bg-emerald-600 text-white hover:bg-emerald-500",
        error:"bg-red-600 text-white hover:bg-red-700",
        outlined:"border border-zinc-300 text-zinc-800 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
       }
       const sizeStyes={
        sm:'h-[32px] px-[12px]',
        md:'h-[40px] px-[16px]',
        lg:'h-[44px] px-[20px]'
       }

  return (
  
<button
    type={type}
    id={id}
    onClick={onClick}
    disabled={disabled}
    className={`${baseStyles} ${variantStyles[variant]} ${sizeStyes[size]}`}
    >
    {text}
</button>
      
    
  )
}

export default Button
//rfce